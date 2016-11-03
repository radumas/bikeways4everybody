# Bikeways for Everybody
Crowd-sourcing lines on a map to solicit public input on ideal locations for fully protected bike routes as part of the [Boston Cyclists' Union's Bikeways for Everybody initiative](http://bostoncyclistsunion.org/bikeways-for-everybody/). See the live site [here](https://boston-cyclists-union.github.io/bikeways4everybody/)

# How to Fork

## Set Up Accounts and Fork Repository

1. Get a [github](https://github.com/join), a [cartodb](https://cartodb.com/signup), and a [mapbox](https://www.mapbox.com/studio/signup/) account
  + (*Optional*) Mac & Windows users can install the [Github Desktop Software](https://desktop.github.com/)
2. Fork the repository by clicking on the [fork icon](#js-flash-container) at the top right of this page, like the image below. To learn more about forking, click [here](https://help.github.com/articles/fork-a-repo/).
[![](https://help.github.com/assets/images/help/repository/fork_button.jpg)](#js-flash-container)  


## Carto

2. Create a new Carto dataset. The default dataset comes with the following fields: `{cartodb_id, the_geom, description, name}`. Add `zipcode` (string) by creating a new column.
   Each row represents one submission from the map with the first field a unique id assigned by Carto to each geometry. `the_geom` is the geographic object. `description` is the user input description of the shape, and `name` is the user's name.
3. In the view for the table, click on the "SQL" tab on the write to execute arbitrary SQL.  
![Custom SQL tab](https://i.stack.imgur.com/HPEHG.png)
4. Add an `insert_time` column by inputting the following code in the SQL pane: `ALTER TABLE bikeways ADD COLUMN insert_time timestamp DEFAULT current_timestamp;`
4. Copy and paste the contents of `insert_function.sql` ([located here](cartoDB_functions/insert_function.sql)) into the sql pane, and then modify the name of the table to be inserted:  
	```
	_the_table TEXT := 'bikeways';
	```  
	This function allows you to send data from the map to the Carto using a publicly accessible URL while limiting what functions the public can perform on the data (for example, modifying or deleting existing data). This function takes the drawn shape as a GeoJSON, the description, and the username. It converts the GeoJSON to a PostGIS geometry object and then inserts a new row in the table with the geometry, and the other two user-input values. Since it isn't easy to view saved functions in cartoDB, I recommend saving the function in a text file.  
	**If you have multiple tables** see below for more information on keeping track of multiple files.
5. Go to step 2 in [**After Forking this Repository**](#after-forking-this-repository)  

**If you have multiple tables:** you need to create a unique function for each, it's probably a good idea to save each function as a separate file so you can recall what is on your Carto account. Alternatively you can see which functions have been created with the following `sql` query ([source](http://stackoverflow.com/a/1559039/4047679)):  
```sql  
SELECT  proname, proargnames, prosrc 
FROM    pg_catalog.pg_namespace n
JOIN    pg_catalog.pg_proc p
ON      p.pronamespace = n.oid
WHERE   n.nspname = 'public' 
AND		p.proowner <> 10
```	 

## Mapbox
*The mapbox.js leaflet.js extension isn't used anymore, so the basemap is no longer hosted by mapbox. If you want to use the old basemap read the instructions further below. For now, this project **is** using the mapbox directions API, for which you **do still** need an access token*

2. Login to Mapbox and then click on `Studio` in the top bar.
3. Note your **Access token** in the right bar.

### Old basemap instructions
1. Download `emerald_nolabel.tm2z` above (click on the name, then click on `raw` to initiate the download)
2. Login to Mapbox and then click on `Studio` in the top bar.
4. Click on `classic` in the left bar then **Upload Classic style** and locate the the file you downloaded in Step 1.
5. Note the ID for the basemap after the upload is successful, it's in a grey box on the same line as `emerald_nolabel` and should be something like `yourusername.rand0malphanum3r1c`

## After Forking this Repository

1. Perform all the steps under the [Carto](#carto) heading, then.  
2. Modify the following variables in [`userconfig.js`](js/userconfigs.js), you can edit this after [cloning](https://help.github.com/articles/cloning-a-repository/), or you can edit directly in your web-browser by clicking on the [`userconfig.js`](js/userconfigs.js) filename above and then clicking on the pencil icon in the top right.  
   `cartoDBusername` to your cartodb username  
   `cartoDBinsertfunction` to the name of your insert function, if you changed it  
   `mapboxAccessToken` your access token in Mapbox, see [above](#Mapbox)  
3. Go to http://YOURGITHUBUSERNAME.github.io/bikeways4everybody to see your own map, and start submitting data, you can see the submitted data by going to the data view for that table in your Carto account.
4. Have a look at the [Data Analysis README](data-analysis/readme.md) to learn how to process the data.

## Inspirations:  
 * Sarah Bindman's app to [map bikeroutes](https://github.com/sbindman/Veloroute) (Great for the "snapping of lines to streets"--actually directions from MapBox. Currently with reduced functionality due to restricted APIs). 
 * Code for Philly with the Philadelphia Bike coalition developed an [app to log people's routes](http://cyclephilly.org/) and produced this [web-map](http://www.dvrpc.org/webmaps/cyclephilly/)
 * Mike Foster's [work](https://github.com/mjfoster83/neighborhoods) on crowdsourcing neighbourhoods
 * BostonGIS [tutorial](http://www.bostongis.com/PrinterFriendly.aspx?content_name=using_custom_osm_tiles) For clipping osm tiles to a polygon 

### Layers  
 * ~~Basemap clipped to select cities~~ (not sure if can work with Mapbox)
 * Crash data?
 * Existing infrastructure
 * Bikeways for Everybody corridors


