# Crowdmap: Basic
Basic example of using leaflet.DRAW to crowdsource geographies to a CartoDB database.

## CartoDB


1. Get a free [CartoDB account](https://cartodb.com/signup)
2. Create a new CartoDB dataset. The default dataset comes with the following fields: `{cartodb_id, the_geom, description, name}`
3. In the view for the table, click on the "SQL" tab on the write to execute arbitrary SQL.  
![Custom SQL tab](https://i.stack.imgur.com/HPEHG.png)
4. Copy and paste the contents of `inserT_function.sql` ([here](https://github.com/radumas/crowdmap-basic/insert_function)


```sql
function goes here
```
http://docs.cartodb.com/cartodb-platform/sql-api.html#what-levels-of-database-access-can-rolesusers-have


## Leaflet 
