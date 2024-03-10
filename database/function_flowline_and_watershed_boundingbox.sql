-- THIS IS AN EXAMPLE POSTGRESQL FUNCTION WITH POSTGIS ENABLED.
-- Taken from RIMORPHIS Project.

-- This function returns all the flowlines in provided bounding box.
CREATE OR REPLACE FUNCTION public.get_nhdcatchments_in_bb(
  lngw double precision,
  lats double precision,
  lnge double precision,
  latn double precision
) RETURNS json AS $$
  WITH nhdflowlines AS (
    SELECT json_agg(ST_AsGeoJSON(t.*)::json)
    FROM(
      SELECT ST_ReducePrecision(geometry, 0.0001), foreign_id, null, river_name, length, slope, label
      FROM river_flowline, (values('flowline')) s(label)
      WHERE ST_Intersects(ST_MakeEnvelope(lngw, lats, lnge, latn, 4326), geometry)
    UNION ALL
      SELECT ST_ReducePrecision(geometry, 0.0001), foreign_id, area, null, null, null, label
      FROM river_catchment_nhd, (values('nhdcatchment')) s(label)
      WHERE ST_Intersects(ST_MakeEnvelope(lngw, lats, lnge, latn, 4326), geometry)
    )
    AS t(geometry, foreign_id, area, river_name, length, slope)
  )

  SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', nhdflowlines.json_agg
            )
  FROM nhdflowlines
$$ LANGUAGE SQL;

-- DROP FUNCTION public.get_nhdcatchments_in_bb;