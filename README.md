# Crowdmap: Basic
Basic example of using Leaflet.draw to crowdsource geographies to a CartoDB database.

## CartoDB


1. Get a free [CartoDB account](https://cartodb.com/signup)
2. Create a new CartoDB dataset. The default dataset comes with the following fields: `{cartodb_id, the_geom, description, name}`
3. In the view for the table, click on the "SQL" tab on the write to execute arbitrary SQL.  
![Custom SQL tab](https://i.stack.imgur.com/HPEHG.png)
4. Copy and paste the contents of `insert_function.sql` ([here](https://github.com/radumas/crowdmap-basic/blob/master/insert_function.sql))
This allows you to send data from the map to the CartoDB using a publicly accessible URL while limiting what functions the public can perform on the data (for example, modifying or deleting existing data).
5. Your API endpoint is now 


http://docs.cartodb.com/cartodb-platform/sql-api.html#what-levels-of-database-access-can-rolesusers-have


## Leaflet 

1. Inspiring myself from the [excellent tutorial](http://duspviz.mit.edu/web-map-workshop/cartodb-data-collection/#) by Mike Foster ([@mjfoster83](https://github.com/mjfoster83/web-map-workshop) )
2. Modify the `setData()` function to construct the SQL query which calls the function to insert the data to CartoDB.
```javascript
    //Convert the drawing to a GeoJSON to pass to the CartoDB sql database
    var drawing = "'"+JSON.stringify(layer.toGeoJSON().geometry)+"'";

    //Construct the SQL query to insert data from the three parameters: the drawing, the input username, and the input description of the drawn shape
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
      