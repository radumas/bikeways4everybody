# bikeways4everyone
Crowd-sourcing lines on a map to solicit public input on ideal locations for fully protected bike routes as part of the [Boston Cyclists' Union's Bikeways for Everybody initiative](http://bostoncyclistsunion.org/bikeways-for-everybody/)


## Inspirations:  
 * Code for Philly with the Philadelphia Bike coalition developed an [app to log people's routes](http://cyclephilly.org/) and produced this [web-map](http://www.dvrpc.org/webmaps/cyclephilly/)
 * Mike Foster's [work](https://github.com/mjfoster83/neighborhoods) on crowdsourcing neighbourhoods
 * BostonGIS [tutorial](http://www.bostongis.com/PrinterFriendly.aspx?content_name=using_custom_osm_tiles) For clipping osm tiles to a polygon 
 * Sarah Bindman's app to [map bikeroutes](https://github.com/sbindman/Veloroute) (Great for the "snapping of lines to streets"--actually directions from MapBox. Currently with reduced functionality due to restricted APIs). 

## Vision  
Have a map. That people can draw lines representing the bike routes they would like to see protected. And then save those lines + comments to a database (probably CartoDB).

### Layers  
 * Basemap clipped to select cities
 * Crash data
 * Existing infrastructure
 * Bikeways for Everybody corridors

## Current path forward
1. ~~Based on [this tutorial](http://blog.cartodb.com/read-and-write-to-cartodb-with-the-leaflet-draw-plugin/) from CartoDB, it seems easy to create a sql function to insert data into a CartoDB database that is publicly available while hiding security authorization, thus eliminating the need for a secure backend (woo woo!). So it should be easy to create a [leaflet map on github](https://github.com/radumas/crowdmap-basic) with leaflet draw functionality that draws to a CartoDB database.~~
2. **Add bike layers to the map**
3. ~~Make username & zipcode global variables entered when editing begins and ensure integrity of zipcode value.~~
3. ~~Add the MapBox directions functionality~~ (in directions branch)
4. Add big buttons like veloroute, enable leaflet.draw as per [this](https://stackoverflow.com/questions/15775103/leaflet-draw-mapping-how-to-initiate-the-draw-function-without-toolbar)
4. Add pop-up instructions and an about section and otherwise styling the front-end.
5. Test
6. Publish?
