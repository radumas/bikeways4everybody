# Data Analysis

The data stored in CartoDB comes in the form below. In order to see where the most people have submitted input, it will be necessary to split lines where they overlap with each other to aggregate the overlapping segments. Points will need to be clustered into nearby clusters.

| cartodb_id | notes | name | insert_time |  zipcode | the_geom |
|----------------------------------------------------------------------|
|1|This is terrifying| Raphael | 2016-02-25 16:43:45 | 02139 | LINE|
|2| Aweful intersection| Raphael | 2016-02-25 16:46:32 | 02139 | POINT|

## Lines

Lines first need to be split where they overlap to then be aggregated into segments that are overlapping.

In short we want to separate each user-drawn line into the following three different types of segments:  
1. Segments which overlap other lines.
2. Segments which do not overlap lines on lines which do at some point overlap
3. Lines that do not overlap other lines.

### 1. Overlapping segments

This query takes the intersection between any line `a` and line `b` which overlap, where `a` & `b` are not the same line. Note that since we care about all submitted content, and not just the shapes, we want the intersection of `a` & `b` *AND* the intersection of `b` & `a`, which is why the `WHERE` clause has the not equals `<>` operator rather than the less than `<`, which would halve the number of comparisons to make. 

```sql
SELECT a.cartodb_id, ST_INTERSECTION(a.the_geom, b.the_geom) as segment
from bikeways a
INNER JOIN bikeways b ON ST_OVERLAPS(a.the_geom,b.the_geom)
WHERE a.cartodb_id <> b.cartodb_id
```

A note that `ST_Intersection` produces `MultiLineStrings` (multiple lines) and `GeometryCollections` (a collection of points *and* lines), more on this [later](#Aggregating). 

### 2. Disjointed segments of overlapping lines 

For segments that do not overlap other lines but are parts of lines that **do** overlap, we can use the [`ST_Difference`](http://postgis.net/docs/ST_Difference.html) operation. 

```sql
SELECT a.cartodb_id, ST_Difference(a.the_geom, b.the_geom) AS segment
from bikeways a
INNER JOIN bikeways b ON ST_OVERLAPS(a.the_geom,b.the_geom)
WHERE a.cartodb_id <> b.cartodb_id
```

### 3. Fully disjointed lines

From [this answer](http://gis.stackexchange.com/a/49849/36886), we can use a `LEFT OUTER JOIN` to see which lines do not overlap with any other.

```sql
SELECT a.cartodb_id, a.the_geom AS segment
FROM bikeways a
LEFT OUTER JOIN bikeways b ON ST_OVERLAPS(a.the_geom,b.the_geom)
WHERE b.cartodb_id IS NULL
```

### Aggregating

Following these three separate operations, we have three different types of geometries:

 - `GeometryCollections`: a collection of points *and* lines
 - `MultiLineStrings`: multiple lines
 - `LineStrings`: single, contiguous lines

Given that the input are lines, we are not interested in intersection points between them. Further, most GIS software has some difficulty in displaying *mixed geometries*. We can select only `LineString`s from the `GeometryCollection` with [`ST_CollectionExtract(geom, 2) `](http://postgis.net/docs/ST_CollectionExtract.html).

Next we disaggregate the `MultiLineStrings` in order to group together *identical segments* using [`ST_Dump`](http://postgis.net/docs/ST_Dump.html) before aggregating twice:
1. By identical segments, using `GROUP BY geom` while aggregating the drawn segment `id`s with `array_agg(id ORDER BY id)`
2. By merging together lines which share the same `id[]` array.

Putting it all together in the command below. You can run this in the `sql` window in CartoDB and then click on the `Create dataset from query` button. 

```sql
WITH segments as(
	SELECT cartodb_id
	,CASE 	WHEN geometrytype(segment) = 'GEOMETRYCOLLECTION' THEN ST_CollectionExtract(segment, 2)
		else segment
	END AS segment
	FROM(
	SELECT a.cartodb_id, ST_INTERSECTION(a.the_geom, b.the_geom) as segment
	from bikeways a
	INNER JOIN bikeways b ON ST_OVERLAPS(a.the_geom,b.the_geom)
	WHERE a.cartodb_id <> b.cartodb_id AND geometrytype(a.the_geom) = 'LINESTRING' AND geometrytype(b.the_geom) = 'LINESTRING'
	) overlapping
	UNION 
	SELECT cartodb_id
	,CASE 	WHEN geometrytype(segment) = 'GEOMETRYCOLLECTION' THEN ST_CollectionExtract(segment, 2)
		ELSE segment
	END AS segment
	FROM(
	SELECT a.cartodb_id, ST_Difference(a.the_geom, b.the_geom) AS segment
	from bikeways a
	INNER JOIN bikeways b ON ST_OVERLAPS(a.the_geom,b.the_geom)
	WHERE a.cartodb_id <> b.cartodb_id
	) disjointed
	UNION 
	SELECT a.cartodb_id, a.the_geom AS segment
	FROM bikeways a
	LEFT OUTER JOIN bikeways b ON ST_OVERLAPS(a.the_geom,b.the_geom)
	WHERE b.cartodb_id IS NULL
)
, dump AS(
	SELECT cartodb_id
	,(ST_DUMP(segment)).geom AS segment
	FROM segments 	
)
, agg1 AS(
	SELECT array_agg(DISTINCT cartodb_id ORDER BY cartodb_id) as ids, segment
	FROM dump
	GROUP BY segment
)

SELECT ids, ST_LineMerge(ST_Multi(ST_Collect(segment))) as line, array_length(ids, 1) as cnt
FROM agg1
GROUP BY ids
```

To aggregate notes together by joining 

```sql
SELECT a.cartodb_id, STRING_AGG(notes, ',<br>' ORDER BY insert_time), a.the_geom_webmercator, cnt
FROM bikeways_crossover c
INNER JOIN bikeways b ON input_id = b.cartodb_id
INNER JOIN bikeways_aggregated a ON agg_id = a.cartodb_id
GROUP BY a.cartodb_id, agg_id, a.the_geom_webmercator, a.cnt
```

Should investigate buffering Mass Ave. 

agg_id 283 & 172 overlap and share (some) segments somehow on mass ave above newbury st. The two segments intersect but do not overlap and are not identical, 

Problem seems more widespread:
```sql
SELECT a.cartodb_id, b.cartodb_id as overlap, a.ids, b.ids as overlapping_ids, a.the_geom_webmercator FROM bikeways_aggregated a
INNER JOIN bikeways_aggregated b ON a.cartodb_id < b.cartodb_id
AND ST_Overlaps(a.the_geom, b.the_geom) AND a.ids && b.ids
```




