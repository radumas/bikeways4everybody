Truncate bikeways_routes_agged;
INSERT INTO bikeways_routes_agged (ids, num_submissions, all_comments, the_geom)
(WITH line AS(
SELECT cartodb_id, notes, the_geom, insert_time
FROM bikeways
WHERE geometrytype(the_geom) LIKE 'LINESTRING'
)
,smallest_segements AS (
  SELECT (ST_Dump(split_line_multipoint(ST_Union(ST_MakeValid(the_geom)), ST_Union(ST_Boundary(the_geom))))).*
  FROM line
  
)
, contains as (SELECT ids, num_submissions, all_comments, path, s.geom AS segment
FROM smallest_segements s, LATERAL (
  SELECT array_agg(cartodb_id ORDER BY insert_time) AS ids, COUNT(DISTINCT cartodb_id) AS num_submissions
  ,STRING_AGG(notes, '<br>' ORDER BY insert_time) as all_comments
  FROM line a
  WHERE ST_Contains(a.the_geom, s.geom)
) l
)
 , overlap AS (
SELECT ids, num_submissions, all_comments, s.geom AS segment, path
FROM smallest_segements s, LATERAL (
  SELECT array_agg(DISTINCT cartodb_id) AS ids, COUNT(DISTINCT cartodb_id) AS num_submissions
  ,STRING_AGG(notes, '<br>' ORDER BY insert_time) as all_comments
  FROM line a
  WHERE ST_Overlaps(a.the_geom, s.geom) 
) l
WHERE path IN (SELECT path FROM contains WHERE ids IS NULL) 
)


-- ORDER BY join_id-- 
SELECT array_agg(cartodb_id ORDER BY insert_time) AS ids, COUNT(cartodb_id ) AS num_submissions, STRING_AGG(notes, '<br>' ORDER BY insert_time) as all_comments
	, s.geom AS segment
FROM smallest_segements s, LATERAL (
  SELECT DISTINCT ON (cartodb_id) cartodb_id, notes, insert_time
  FROM line a
  WHERE ST_Intersects(a.the_geom, s.geom) AND NOT ST_Crosses(a.the_geom, s.geom)

) l
WHERE path IN (SELECT path FROM overlap WHERE ids IS NULL) 
GROUP BY s.geom
UNION ALL
SELECT ids, num_submissions, all_comments, segment
FROM overlap
WHERE ids IS NOT NULL
UNION ALL
SELECT ids, num_submissions, all_comments, segment
FROM contains
WHERE ids IS NOT NULL
)
