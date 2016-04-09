
DROP TABLE IF EXISTS mass_ave_segments_overlapping;
SELECT *
into mass_ave_segments_overlapping
FROM (
	SELECT a.cartodb_id, a.notes, a.name, a.zipcode, (ST_DUMP(ST_INTERSECTION(a.wkb_geometry, b.wkb_geometry))).geom as segment
	from mass_ave_test a
	INNER JOIN mass_ave_test b ON ST_OVERLAPS(a.wkb_geometry,b.wkb_geometry)
	WHERE a.cartodb_id <> b.cartodb_id
) intersections 
WHERE geometrytype(segment) = 'LINESTRING'