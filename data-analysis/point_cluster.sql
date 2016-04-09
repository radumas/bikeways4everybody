CREATE TABLE pt
(
  stop_id character varying(32) NOT NULL,
  geom geometry(Point)
);

CREATE TABLE clustered_pt
(
  stop_id character varying(32) NOT NULL,
  geom geometry(Point),
  cluster_id smallint
);

CREATE OR REPLACE FUNCTION bottomup_cluster_index(points pt[], radius integer)
  RETURNS SETOF clustered_pt AS
$BODY$

DECLARE
    srid int;
    counter int:=1;

BEGIN

IF array_length(points,1)<2 THEN
    RETURN QUERY SELECT stop_id::varchar(32), geom::geometry(point), 1 FROM unnest(points);
    RETURN;
END IF;


CREATE TEMPORARY TABLE IF NOT EXISTS stops (LIKE pt) ON COMMIT DROP;

CREATE TEMPORARY SEQUENCE clusterids;

CREATE TEMPORARY TABLE clusters(
    stop_group geometry,
    stop_ids varchar[],
    cluster_id smallint DEFAULT nextval('clusterids')
    ) ON COMMIT DROP;


ALTER SEQUENCE clusterids OWNED BY clusters.cluster_id;

TRUNCATE stops;
INSERT INTO stops(stop_id, geom)
    (SELECT (unnest(points)).* ); 

srid := ST_SRID(geom) FROM stops LIMIT 1;

UPDATE stops
SET geom =  ST_TRANSFORM(geom,26986);

INSERT INTO clusters(stop_group, stop_ids)
    (SELECT ST_COLLECT(geom), ARRAY_AGG(stop_id)
        FROM stops GROUP BY geom 
    );

CREATE INDEX geom_index
ON clusters
USING gist
(stop_group);

Analyze clusters;

LOOP
    IF (SELECT ST_MaxDistance(a.stop_group,b.stop_group)  FROM clusters a, clusters b
        WHERE 
        ST_DFullyWithin(a.stop_group,b.stop_group, 2 * radius)
        AND a.cluster_id < b.cluster_id AND a.cluster_id > 0 AND b.cluster_id > 0
        ORDER BY ST_MaxDistance(a.stop_group,b.stop_group) LIMIT 1)
        IS NULl
    THEN
        EXIT;
    END IF;

    ANALYZE clusters;

    counter := counter +1;

    WITH finding_nearest_clusters AS(
    SELECT DISTINCT ON (a.cluster_id) a.cluster_id, ST_collect(a.stop_group,b.stop_group) AS stop_group, ARRAY[a.cluster_id,b.cluster_id] as joined_clusters, a.stop_ids||b.stop_ids AS stop_ids
    FROM clusters a, clusters b
        WHERE ST_DFullyWithin(a.stop_group,b.stop_group, 2 * radius)
            AND a.cluster_id < b.cluster_id AND a.cluster_id > 0 AND b.cluster_id > 0
        ORDER BY a.cluster_id, ST_MaxDistance(a.stop_group,b.stop_group)
    )
    , unique_clusters AS(
    SELECT a.*, CASE WHEN ST_AREA(ST_MinimumBoundingCircle(a.stop_group))>= ST_AREA(ST_MinimumBoundingCircle(b.stop_group)) THEN 1 ELSE 0 END as repeat_flag 
    FROM finding_nearest_clusters a
    LEFT OUTER JOIN finding_nearest_clusters b ON a.cluster_id <> b.cluster_id AND a.joined_clusters && b.joined_clusters 
    )       
    UPDATE clusters o SET 
        cluster_id = CASE WHEN o.cluster_id = joined_clusters[2] THEN 0 ELSE joined_clusters[1] END
        ,stop_group = CASE WHEN o.cluster_id = joined_clusters[2] THEN NULL ELSE f.stop_group END
        ,stop_ids = CASE WHEN o.cluster_id = joined_clusters[2] THEN NULL ELSE f.stop_ids END
        FROM (SELECT DISTINCT ON (cluster_id) cluster_id, stop_group, joined_clusters, stop_ids, repeat_flag
            FROM unique_clusters 
            ORDER BY cluster_id, repeat_flag DESC
            ) f
        WHERE o.cluster_id = ANY (joined_clusters) AND repeat_flag =0;

	IF (SELECT COUNT(DISTINCT cluster_id) FROM clusters) < 2	THEN
		EXIT;					
	END IF;

END LOOP;

RETURN QUERY 
    SELECT stop_id::varchar(32), ST_TRANSFORM(geom, srid)::geometry(point), cluster_id 
    FROM stops
    inner join (select cluster_id, unnest(stop_ids) AS stop_id FROM clusters)c USING (stop_id);
END;
$BODY$
LANGUAGE plpgsql VOLATILE;