var marker = null;

function startNewLine(rNum) {
	$("#map").addClass("pointing");
    var polyline = new line(rNum);
    routeDict[polyline.id] = polyline;
    routeDrawTooltip = new L.Tooltip(map);
    map.on('mousemove', _onMouseMove);
    routeDrawTooltip.updateContent({text:"Click to add a waypoint to your route"});
    return polyline;
}


/* Ends the current line
 */
 function endLine() {
	 dialog.dialog( "open" );
 }

function cancelLine(){
	stopRouteDraw();
}

function stopRouteDraw(){
	 currentLine = null;
	 map.removeEventListener('dblclick');
     map.off('mousemove', _onMouseMove);
	 map.off('click', addMarker);
	 map.removeLayer(marker);
	 marker = null;
	 $("#add-route").removeClass('icon-click');
	 $("#map").removeClass("pointing");
    routeDrawTooltip.dispose();
}
/* Adds a marker to the current route 
 * If a marker is clicked (simulates a double click) the route is ended
 */
function addMarker(evt) {
	
    if (currentLine === null) {
	}
	else if (currentLine !== null) {

		marker.on('dragend', function() {
			drawRoute(currentLine);
		});

        drawnRoute.addLayer(marker);
		currentLine.waypoints.push(marker);
		drawRoute(currentLine);

		marker = new L.marker(evt.latlng, { draggable:true, icon:circleIcon}).addTo(map);
        //Change message of the tooltip, and enable finishing route
        if(currentLine.waypoints.length > 2){
            routeDrawTooltip.updateContent({text: 'Right-click to finish drawing' });


			map.on("dblclick", endLine);
			
			marker.on("dblclick", endLine);
			marker.on('contextmenu', endLine);
			map.on('contextmenu', endLine);
				
		}
	}
}


function _onMouseMove (e) {
	var latlng = e.latlng;

	if(!marker){
		marker = L.marker(latlng, { draggable:true, icon:circleIcon });
		map.addLayer(marker);
	}
	else{
		marker.setLatLng(latlng);	
	}
	
	
	routeDrawTooltip.updatePosition(latlng);
}
        

/* Draws the route between a given set of waypoints
 * If there are at least 2 points then a request is sent to the directions api
 * which includes user-added waypoints
 * Those points are then added to the map
 */
function drawRoute(routeToDraw) {
	var defer = $.Deferred();
	if (routeToDraw.waypoints.length > 1 ) {
		var waypointsString = "";
		var pointsToDraw = [];

		for (i = 0; i < routeToDraw.waypoints.length - 1; i++) {
			var lat = routeToDraw.waypoints[i].getLatLng().lat;
			var lng = routeToDraw.waypoints[i].getLatLng().lng;		
			waypointsString += lng + "," + lat + ";";
	  	}
	  	//accounts for omitting semi-colon
	  	var lastLat = routeToDraw.waypoints[routeToDraw.waypoints.length - 1].getLatLng().lat;
	  	var lastLng = routeToDraw.waypoints[routeToDraw.waypoints.length - 1].getLatLng().lng;

	  	waypointsString += lastLng + "," + lastLat;

		var directionUrl = 'https://api.mapbox.com/v4/directions/mapbox.walking/'+ waypointsString + '.json?access_token='+config.mapboxAccessToken;

		routeDict[routeToDraw.id].directionUrl = directionUrl;

		$.when($.get(directionUrl)
		).done( function (result) {
			var route = result.routes[0].geometry.coordinates;

			routeDict[routeToDraw.id].coordinates = route;
			pointsToDraw = route.map( function(coordinate) {
				return [coordinate[1], coordinate[0]]; //use this to switch lat and long
			});

			routeToDraw.polyline.setLatLngs(pointsToDraw);
			defer.resolve();
		}
		).fail( function (result) {
			//alert("there was an issue drawing the route"); //use for debugging
		});
 	}
 	return defer.promise();
 }