DROP FUNCTION IF EXISTS split_line_multipoint(input_geom geometry, blade geometry);
CREATE FUNCTION split_line_multipoint(input_geom geometry, blade geometry)
  RETURNS geometry AS
$BODY$
    -- this function is a wrapper around the function ST_Split 
    -- to allow splitting multilines with multipoints
	-- Source: https://gis.stackexchange.com/questions/112282/split-lines-into-non-overlapping-subsets-based-on-points/112317#112317
    DECLARE
        result geometry;
        simple_blade geometry;
        blade_geometry_type text := GeometryType(blade);
        geom_geometry_type text := GeometryType(input_geom);
    BEGIN
        IF blade_geometry_type NOT ILIKE 'MULTI%' THEN
            RETURN ST_Split(input_geom, blade);
        ELSIF blade_geometry_type NOT ILIKE '%POINT' THEN
            RAISE NOTICE 'Need a Point/MultiPoint blade';
            RETURN NULL;
        END IF;

        IF geom_geometry_type NOT ILIKE '%LINESTRING' THEN
            RAISE NOTICE 'Need a LineString/MultiLineString input_geom';
            RETURN NULL;
        END IF;

        result := input_geom;           
        -- Loop on all the points in the blade
        FOR simple_blade IN SELECT (ST_Dump(ST_CollectionExtract(blade, 1))).geom
        LOOP
            -- keep splitting the previous result
            result := ST_CollectionExtract(ST_Split(result, simple_blade), 2);
        END LOOP;
        RETURN result;
    END;
$BODY$
LANGUAGE plpgsql IMMUTABLE;