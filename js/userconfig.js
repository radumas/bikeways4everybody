/*
 * Central repository of options to change when forking this map!
 */

var config = {
	mapFocus : [42.381899, -71.122499],
	//Set Map Bounds & point map is centered around
	south : 42.204 ,
	west : -71.27,
	north : 42.453,
	east : -70.95,
	//Mapbox access token & key for basemap
	mapboxAccessToken :              
            'pk.eyJ1IjoicmFwaGJjdSIsImEiOiJjaWthNzVlb3Uwamc3dXhrcG16ajQwZ3JsIn0.v7QSzegphm27n89KJEFwIw',
	baseMap: 'remotegentrify.ea603042',
    //Change to your username, insert function on cartodb, and cartodb tablename (see also /cartoDB_functions)
	cartoDBusername : 'bcu',
	cartoDBinsertfunction : 'insert_bikeways_data',
	walkthroughWelcome: "<p>This webmap allows you to view data collected by the <a href='http://bostoncyclistsunion.org/' target='_blank'>Boston Cyclists Union</a> on biking in Boston.</p><p>It also allows you to submit input on where biking infrastructure can be improved by drawing on the map! The map is restricted to the inner core of Metro Boston, where we concentrate our advocacy.</p>"
};
