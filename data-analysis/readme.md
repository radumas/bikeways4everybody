# Data Analysis

The data stored in CartoDB comes in the form below. In order to see where the most people have submitted input, it will be necessary to split lines where they overlap with each other to aggregate the overlapping segments. Points will need to be clustered into nearby clusters.

| cartodb_id | notes | name | insert_time |  zipcode | the_geom |
|----------------------------------------------------------------------|
|1|This is terrifying| Raphael | 2016-02-25 16:43:45 | 02139 | LINE|
|2| Aweful intersection| Raphael | 2016-02-25 16:46:32 | 02139 | POINT|

## Lines

I asked GIS.SE how best to accomplish this and got [this answer](http://gis.stackexchange.com/a/187031/36886). Basically splitting the mass of lines by the end points  of individual lines. The code is as follows:

```sql
WITH smallest_segments AS (
  SELECT (ST_Dump(ST_Split(ST_Union(geom), ST_Union(ST_Boundary(the_geom))))).*
  FROM bikeways
)
SELECT row_number() over() AS rn, ids, s.geom AS segment
FROM smallest_segments s, LATERAL (
  SELECT ARRAY_AGG(id) AS ids
  FROM stackex a
  WHERE ST_Contains(a.the_geom, s.geom)
) l;
```

Unfortunately whatever version of `PostGIS` CartoDB is using hasn't been updated to where `ST_Split` can split a line [by multiple points](http://postgis.net/docs/ST_Split.html). So create the [`split_line_multipoint`](/data-analysis/split_line_multipoint.sql) function in CartoDB, and replace `ST_Split` with it. Also unfortunate was that I asked the question for a simple set of lines. And the actual routes drawn are rather messy (they self-intersect, they have mysterious ends). So for the segments that cannot be joined to their parent line with `ST_contains`, for now, I've added successive join functions, first `ST_Overlaps`, then `ST_intersects` while waiting for [an answer](https://gis.stackexchange.com/questions/187503/how-can-i-use-st-contains-st-overlaps-with-non-simple-lines?lq=1). The full query is in [this file](/data-analysis/bikeways_route_agg.sql). Run the query and then `Create a new dataset` from it. Next turn that dataset into a map. Make the lines a chloropleth based on `num_submissions` and edit the info_window html to be something like:

```html
<div class="cartodb-popup v2">
  <a href="#close" class="cartodb-popup-close-button close">x</a>
  <div class="cartodb-popup-content-wrapper">
    <div class="cartodb-popup-content">
      <p><h3>{{num_submissions}} Submissions</h3></p>
      <p>{{{all_comments}}}</p>
    </div>
  </div>
  <div class="cartodb-popup-tip-container"></div>
</div>
```

Notice the triple mustache around `{{{all_comments}}}`, this is because in the line aggregation the function separates individual comments with an html `<br>` linebreak tag. The triple mustache tells mustache.js not to [escape the html code inside](http://gis.stackexchange.com/a/187171/36886).

I have plans to turn the route aggregation into a function that gets called nightly to truncate and renew a `routes_aggregated` table. This can apparently be done using bash (maybe) and a free heroku account (definitely).

## Points

I wanted to cluster points that are close together in order to highlight locations where more comments have been submitted while still allowing someone to read the submitted comments. Since the points aren't being snapped to existing geometries like the streets above, they don't necessarily overlap, so the aggregation technique used above won't work.

Fortunately [I previously wrote](http://gis.stackexchange.com/a/144230/36886) a clustering algorithm to group together points within a specified radius. I've added a [version](point_cluster.sql) to run on CartoDB (just run that script) that has all comments removed so it will [play well with CartoDB](http://gis.stackexchange.com/a/187150/36886).

After some examination of existing clusters of points in QGIS, I settled on a 40 m radius as a good tradeoff between grouping together close points while maintaining the granularity of the user submitted points. You may find a different cluster size is appropriate. The full query to plug in to CartoDB is below. 

```sql
WITH points AS(
 SELECT cartodb_id, the_geom as geom, notes, insert_time
  FROM bikeways
  WHERE geometrytype(the_geom) = 'POINT'
 ) 
,clustered AS(
SELECT (clusters).cluster_id, (clusters).stop_id::int AS cartodb_id FROM (

    SELECT bottomup_cluster_index(array_agg((cartodb_id,geom)::pt), 40) as clusters 
    FROM  points
)a
)

SELECT cluster_id, ST_CEntroid(ST_Collect(geom)) as the_geom, COUNT(DISTINCT cartodb_id) AS num_submissions
  ,STRING_AGG(notes, '<br>' ORDER BY insert_time) as all_comments
from points
INNER JOIN clustered USING (cartodb_id)
GROUP BY cluster_id;
```
After renaming the output table to `bikeways_point_clusters`, you can add the following to the start of the query above to  update that table with new data.
```sql
TRUNCATE bikeways_point_clusters;
INSERT INTO bikeways_point_clusters(cluster_id, the_geom, num_submissions, all_comments)
```

### Mapping

I mapped the points as Bubbles using the wizard, so the size of the cluster increases with the number of submissions. You can use the same custom `html` as with the routes for the infowindow.

## Mapping Routes and Points

You can combine the two layers in a map. I put the points on top.