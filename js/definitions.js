/* global variables which store information about 
 * current route and all routes 
 */
var routeNum = 0;
var currentLine = null;
var markerDrawer = null;
var routeDict = {};
var colors = ['#4AA0D3', '#2C9359', '#9BB31C', '#4BBCA1', '#B3A81D', '#31938B', '#4AD35A', '#99C946', '#ABE345'];
var routeDraw = false,  markerDraw = false, validInput = false;
/* constructor for a new line object 
 */
function line(id) {
	this.id = id;
	if (colors[id]) {
		var lineColor = colors[id];
	} else {
		var lineColor = "#575757";
	}
	this.polyline = L.polyline([], { color:lineColor, weight: 5.5, opacity: 0.8 }).addTo(map);
	this.waypoints = [];
//	this.elePoints = null;
//	this.elevation = null;
//	this.eGain = null;
//	this.eLoss = null;
//	this.distance = null;
//	this.mostDirectDistance = null;
//	this.averageSpeed = null;
//	this.leftTurns = null;
//	this.coordinates = [];
//	this.sElevation = null;
//	this.sDistance = null;
//	this.sLeftTurns = null;
//	this.sAverageSpeed = null;
}

var circleIcon = L.icon({
    iconUrl: 'img/icon2.png',
    iconSize: [20, 20]
});