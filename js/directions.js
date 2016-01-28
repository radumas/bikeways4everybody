var tooltipstate = 0;

function startNewLine(rNum) {
    var polyline = new line(rNum);
    tooltipstate = 1;
    routeDict[polyline.id] = polyline;
    return polyline;
}


/* Ends the current line
 */
 function endLine(route1) {
     $("#add-route").removeClass('icon-click');
     //Resets tooltip to null
     tooltipstate = 0;
     $( "#map").tooltip( "close" );
     dialog.dialog( "open" );
    
 }
/* Adds a marker to the current route 
 * If a marker is clicked (simulates a double click) the route is ended
 */
function addMarker(evt) {
    //Refresh the tooltip
    $( "#map").tooltip( "close" );
	
    if (currentLine === null) {
	}
	else if (currentLine !== null) {
            
		var marker = L.marker(evt.latlng, { draggable:true, icon:circleIcon });
		//marker.setIcon(circleIcon);
		marker.on('dragend', function() {
			drawRoute(currentLine);
		});
//		marker.addTo(map);
        drawnRoute.addLayer(marker);
		currentLine.waypoints.push(marker);
		drawRoute(currentLine);
        
        //Change message of the tooltip
        if(currentLine.waypoints.length > 1){
            tooltipstate = 2;
        }
        
		marker.on("click", function () {
			if (currentLine) {
				endLine(currentLine);
			}
		});
	}
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

		var directionUrl = 'https://api.mapbox.com/v4/directions/mapbox.walking/'+ waypointsString + '.json?access_token=pk.eyJ1IjoicmVtb3RlZ2VudHJpZnkiLCJhIjoiY2lnanJzMjJpMDA1dnYxbHo5MTZtdGZsYSJ9.gLE8d40zmDAtMSSZyd2h1Q';

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