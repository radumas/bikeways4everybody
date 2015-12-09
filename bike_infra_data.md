## Sources of Data
 * MAPC's bike layer ([on the Drive](https://drive.google.com/open?id=0B-2KO4mJHLm4SDdpTWlROXBhRmM))
 * Cambridge [Bike Lanes](http://www.cambridgema.gov/gis/gisdatadictionary/recreation/recreation_bikefacilities.aspx)
 * Boston [Bike Lanes](http://bostonopendata.boston.opendata.arcgis.com/datasets/d02c9d2003af455fbc37f550cc53d3a4_0) ([data dictionary](https://drive.google.com/file/d/0B5xorwVOSRdXS3hCMERSUEFjVlk/view?usp=sharing))
 * City & Town borders for the BCU's "Service Area" from [MassGIS](http://www.mass.gov/anf/research-and-tech/it-serv-and-support/application-serv/office-of-geographic-information-massgis/datalayers/townsurvey.html)

## Editing
For this project, we are only interested in the four "core" cities of Boston, Brookline, Cambridge, and Somerville. The polygons for these cities were merged together in QGIS, and the MAPC's layer was intersected with them. 

### Converting infrastructure classifications  
Each agency had its own scale to classify bike infrastructure, and we wanted to keep it simple for displaying on our map. The 5 levels of classification to be used in the map are defined in the table below. Each subsequent subsection shows the code used in the `QGIS Field calculator` to create a unified column of bike infrastructure.

|Type       |Number|
|-----------|:----:|
|Off-street |     1|
|Cycle-track|     2|
|Buffered   |     3|
|Bike-lane  |     4|
|Sharrow    |     5|
#### Boston
```
CASE
WHEN "ExisFacil" = 'ADV' THEN	4
WHEN "ExisFacil" = 'BFBL' THEN	3
WHEN "ExisFacil" = 'BL' THEN	4
WHEN "ExisFacil" = 'BSBL' THEN	4
WHEN "ExisFacil" = 'CFBL' THEN	4
WHEN "ExisFacil" = 'CL' THEN	4
WHEN "ExisFacil" = 'CT1-1' THEN	2
WHEN "ExisFacil" = 'CT1-2' THEN	2
WHEN "ExisFacil" = 'CT2-1' THEN	2
WHEN "ExisFacil" = 'NW' THEN	5
WHEN "ExisFacil" = 'PS' THEN	5
WHEN "ExisFacil" = 'PSL' THEN	5
WHEN "ExisFacil" = 'SLM' THEN	5
WHEN "ExisFacil" = 'SRd' THEN	5
WHEN "ExisFacil" = 'SUP' THEN	1
WHEN "ExisFacil" = 'SUC' THEN	1
WHEN "ExisFacil" = 'SUB' THEN	1
WHEN "ExisFacil" = 'NSUP' THEN	1
--Additions
WHEN "ExisFacil" = 'PBFBL' THEN	3
WHEN "ExisFacil" = 'CTBL' THEN	2
WHEN "ExisFacil" = 'BFCL' THEN	4
END
```
#### Cambridge
```
CASE  
WHEN  "BIKE_FAC" = 4 THEN 2  
WHEN  "BIKE_FAC" = 3 THEN 4 
WHEN  "BIKE_FAC" = 1 THEN 4
WHEN  "BIKE_FAC" = 5 THEN 1
WHEN  "BIKE_FAC" = 6 THEN 5
WHEN  "BIKE_FAC" = 7 THEN 5
WHEN  "BIKE_FAC" = 8 THEN 2 --Ames street 
END
```
#### MAPC
First, bikefacili must be 1, which means the infrastructure is built. 
Not sure what to do about 6s ("To be determined"). See how many intersect Boston/Cambridge infra?
```
CASE
WHEN "BikeFaci_1" = 1 AND "FacilityDe" = 11 THEN 3
WHEN "FacilityDe" = 91 THEN 5
WHEN "FacilityDe" = 83 THEN 2
WHEN "FacilityDe" = 92 THEN 5
WHEN "BikeFaci_1" = 1 THEN 4
WHEN "BikeFaci_1" = 2 THEN 2
WHEN "BikeFaci_1" = 3 THEN 5
WHEN "BikeFaci_1" = 4 THEN 4
WHEN "BikeFaci_1" = 5 THEN 1
WHEN "FacilityDe" = 94 THEN 4
WHEN "BikeFaci_1" = 9 THEN 5
WHEN "BikeFaci_1" = 6 THEN 5 --Holdouts, assuming Sharrows.
END

```
### Overlapping infrastructure
Since the Boston & Cambridge layers are more recent than the MAPC one, they should take precedence when infrastructure overlaps. I created a 5m buffer around the Boston & Cambridge layers separately, and then selected lines on the MAPC layer which were within these buffers. After inverting the selection, I saved only the lines that were not duplicated in those two layers.

### Combining
I made sure the bike facility classification column had the **same name** in the three different layers, then I put all three shapefiles in the same folder. I used `Vector > Data Management Tools > Merge Shapefiles to One...` to merge the three files. I then deleted extraneous columns and ran `Simplify` with default tolerance to shrink the files. Then in order to make it easy to add the layer and its legend to the webmap, I used the `qgis2web` plugin with Leaflet mode, with the following options:  
 - no popup
 - minify GeoJSON
 - precision: 5
 - add layers list
 - match project CRS
 
Then I exported it, and copied the exported data `.js` file to the project's `data` folder as well as a number of other `.css` and `.js` files:  
 - 
