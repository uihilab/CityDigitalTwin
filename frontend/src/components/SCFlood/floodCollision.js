import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { booleanPointInPolygon } from '@turf/turf';

/**
 * Identifies points that overlap with flood zones
 * @param {Object} floodAreas - GeoJSON object representing flood zones
 * @param {Array} points - Array of points with coordinates
 * @returns {Array} - Array of points that overlap with flood zones
 */
export const findCollisions = (floodAreas, points) => {
    debugger;
  return points.filter((point) => {
    // Convert the point to a GeoJSON feature for easier processing
    const pointFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: point.coordinates,
      },
    };

    // Iterate through each flood zone polygon to check for overlap
    return floodAreas.features.some((floodArea) =>
      // Use Turf.js to check if the point is inside the flood zone polygon
      booleanPointInPolygon(pointFeature, floodArea)
    );
  });
};
