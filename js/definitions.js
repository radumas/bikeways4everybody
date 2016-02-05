/* global variables which store information about 
 * current route and all routes 
 */
var routeNum = 0;
var currentLine = null;
var markerDrawer = null;
var routeDict = {};
var colors = ['#4AA0D3', '#2C9359', '#9BB31C', '#4BBCA1', '#B3A81D', '#31938B', '#4AD35A', '#99C946', '#ABE345'];
var routeDraw = false,  markerDraw = false, validInput = false;


var zip= 0, enteredUsername ="";


/* constructor for a new line object 
 */
function line(id) {
	this.id = id;
	if (colors[id]) {
		var lineColor = colors[id];
	} else {
		var lineColor = "#575757";
	}
	this.polyline = L.polyline([], { color:lineColor, weight: 5.5, opacity: 0.8 });
	this.waypoints = [];
}

var circleIcon = L.icon({
    iconUrl: 'img/icon2.png',
    iconSize: [20, 20]
});