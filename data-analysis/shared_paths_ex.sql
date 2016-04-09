SELECT ST_ASTEXT(ST_SharedPaths(a.wkb_geometry, b.wkb_geometry))
FROM mass_ave_test a
cross join mass_ave_test b
Where a.cartodb_id = 30 AND b.cartodb_id = 409