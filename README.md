# Crowdmap: Basic
This is an attempt to create the most basic example of a web map for crowdsourcing... anything that users can draw on a map (points, squares, circles, lines, polygons...).
It uses [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) ([demo](https://leaflet.github.io/Leaflet.draw/)) to crowdsource user-generated shapes on a map and then inserts them in a [CartoDB table](https://cartodb.com/data/).

[![Example Screenshot](/screenshot.png)](http://radumas.github.io/crowdmap-basic)
[Try it here](http://radumas.github.io/crowdmap-basic)

## All You Need to Do After Forking this Repository
1. Perform all the steps under the [CartoDB](#cartodb) heading
2. Modify the following variables in `index.html` (search for "TODO") 
   `cartoDBusername` to your cartodb username
   `cartoDBinsertfunction` to the name of your insert function
   `cartoDBtablename` to the name of your table in CartoDB
3. Go to http://YOURGITHUBUSERNAME.github.io/crowdmap-basic to play.
4. Modify the code to your whims. 


## CartoDB

1. Get a free [CartoDB account](https://cartodb.com/signup)
2. Create a new CartoDB dataset. The default dataset comes with the following fields: `{cartodb_id, the_geom, description, name}`
   Each row represents one submission from the map with the first field a unique id assigned by CartoDB to each geometry. `the_geom` is the geographic object. `description` is the user input description of the shape, and `name` is the user's name.
3. In the view for the table, click on the "SQL" tab on the write to execute arbitrary SQL.  
![Custom SQL tab](https://i.stack.imgur.com/HPEHG.png)
4. Copy and paste the contents of `insert_function.sql` ([here](https://github.com/radumas/crowdmap-basic/blob/gh-pages/insert_function.sql))
This allows you to send data from the map to the CartoDB using a publicly accessible URL while limiting what functions the public can perform on the data (for example, modifying or deleting existing data). This function takes the drawn shape as a GeoJSON, the description, and the username. It converts the GeoJSON to a PostGIS geometry object and then inserts a new row in the table with the geometry, and the other two user-input values.
**If you have different tables** you need to create a unique function for each, it's probably a good idea to save each function as a separate file so you can recall what is on your CartoDB account.
5. Your CartoDB API endpoint is http://YOURUSERNAME.cartodb.com/api/v2/sql

## Leaflet 

1. Inspiring myself from the [excellent tutorial](http://duspviz.mit.edu/web-map-workshop/cartodb-data-collection/#) by Mike Foster ([@mjfoster83](https://github.com/mjfoster83/web-map-workshop)). If this is your first introduction to leaflet, you should probably go through the entire webmapping workshop
2. Modify the `setData()` function to construct the SQL query which calls the function to insert the data to CartoDB.
   ```javascript
    //Convert the drawing to a GeoJSON to pass to the CartoDB sql database
    var drawing = "'"+JSON.stringify(layer.toGeoJSON().geometry)+"'";

    //Construct the SQL query to insert data from the three parameters: the drawing, 
    //the input username, and the input description of the drawn shape
      var sql = "SELECT insert_crowd_mapping_data(";
    sql += drawing;
      sql += ","+enteredDescription;
      sql += ","+enteredUsername;
      sql += ");";
   ```  
3. And then add the sql query to an AJAX call in order to pass the data to your CartoDB table
```javascript
    //TODO: Change to your username
    var cartoDBusername = "raphaeld"  
    //Sending the data
      $.ajax({
        type: 'POST',
        url: 'https://'+cartoDBusername+'.cartodb.com/api/v2/sql',
        crossDomain: true,
        data: {"q":sql},
        dataType: 'json',
        success: function(responseData, textStatus, jqXHR) {
          console.log("Data saved");

        },
        error: function (responseData, textStatus, errorThrown) {

            console.log("Problem saving the data");
        }
      });
```
4. After each new drawing is inserted, the data from the `drawnItems` layer is passed to the `CartoDBData` layer without re-querying the database. This does mean that a user **won't** see others' edits to the map after load. See Mike Foster's [tutorial](http://duspviz.mit.edu/web-map-workshop/cartodb-data-collection/#) for the easy fix to reload the data from CartoDB after every draw.
```javascript
    // Transfer drawing to the CartoDB layer
    var newData = layer.toGeoJSON();
      newData.properties.description = description.value;
      newData.properties.name = username.value;

    cartoDBData.addData(newData);
```