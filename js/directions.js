var lastClick = 0;

function startNewLine(rNum) {
	$("#map").addClass("pointing");
    var polyline = new line(rNum);
    routeDict[polyline.id] = polyline;
    routeDrawTooltip = new L.Tooltip(map);
    map.on('mousemove', _onMouseMove);
	map.on('click', addMarker);
    routeDrawTooltip.updateContent({text:"Click to add a start point to your route"});
    return polyline;
}


/* Ends the current line
 */
 function endLine(evt) {
	 dialog.dialog( "open" );
 }

function cancelLine(){
	stopRouteDraw();
}

function stopRouteDraw(){
	currentLine = null;
	routeDrawTooltip.dispose();
	map.removeEventListener('dblclick');
	map.off('mousemove', _onMouseMove);
	map.off('click', addMarker);
	$("#add-route").removeClass('icon-click');
	$("#map").removeClass("pointing");
}
/* Adds a marker to the current route 
 * If a marker is clicked (simulates a double click) the route is ended
 */
function addMarker(evt) {

	//From http://stackoverflow.com/a/28610565/4047679
	if (lastClick >= (Date.now() - 20))
    	return;
	
	lastClick = Date.now();
	
    if (currentLine === null) {
	}
	else if (currentLine !== null) {

		var marker = new L.marker(evt.latlng, { draggable:true, icon:circleIcon });
		
		marker.on('dragend', function() {
			drawRoute(currentLine);
		});
		drawnRoute.addLayer(marker);
		currentLine.waypoints.push(marker);
		drawRoute(currentLine);
        
        if(currentLine.waypoints.length >= 1){
            routeDrawTooltip.updateContent({text:"Click to add a another point to your route"});
        }

        //Change message of the tooltip, and enable finishing route
        if(currentLine.waypoints.length >= 2){
			routeDrawTooltip.updateContent({text: 'Double-click on a point to finish drawing' });
			map.on("dblclick", endLine);
//			marker.on('click', endLine);
			marker.on("dblclick", endLine);
//			marker.on('contextmenu', endLine);
//			map.on('contextmenu', endLine);		
			$("#save").show();
			$("#save").css({'display':'inline-block'});
		}

	}
}


function _onMouseMove (e) {
	var latlng = e.latlng;	
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