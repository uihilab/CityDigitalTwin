import length from "@turf/length";
import RoadModel from "./RoadModel";

const turf = {
  length,
};

function filterRoadTypes(roads) {
  const roadTypes = [
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "residential",
  ];

  return roads.filter((road) => roadTypes.includes(road.properties.highway));
}

function filterShortRoads(roads, minLength = 0.2) {
  return roads.filter((road) => {
    const roadLength = turf.length(road.geometry);
    return roadLength >= minLength;
  });
}

export function importOSMRoadsFromGeoJSON(geoJSON) {
  const roads = [];

  const filteredRoads = filterRoadTypes(geoJSON.features);
  //const longEnoughRoads = filterShortRoads(filteredRoads);
  //.filter((x) => x.properties.name === "West Park Avenue")

  //console.log(filteredRoads);
  // geoJSON.features.filter(feature => {
  //   const highwayType = feature.properties.highway;
  //   return (
  //     highwayType === "primary" ||
  //     highwayType === "secondary" ||
  //     highwayType === "trunk" ||
  //     highwayType === "tertiary"
  //   );
  // });

  filteredRoads.forEach((feature, index) => {
    const properties = feature.properties;
    const geometry = feature.geometry;
    const id = properties.full_id || index; // Use full_id if available, otherwise use the index
    const coordinates = geometry.coordinates;
    const roadType = properties.highway;
    const maxSpeedMilesPerHour = properties.maxspeed ? parseInt(properties.maxspeed, 10) : 30;
    const maxSpeedMetersPerSec = mphToMps(maxSpeedMilesPerHour);
    const isOneway = properties.oneway === "yes";
    const laneCount = properties.lanes ? parseInt(properties.lanes, 10) : null;
    const name = properties.name;
    const roadLength = turf.length(geometry);
    const road = new RoadModel(
      id,
      coordinates,
      roadType,
      maxSpeedMetersPerSec,
      isOneway,
      laneCount,
      name,
      geometry,
      roadLength
    );
    roads.push(road);
  });

  return roads;
}

function mphToMps(mph) {
  const metersPerMile = 1609.34;
  const secondsPerHour = 3600;

  // Convert mph to mps
  let mps = (mph * metersPerMile) / secondsPerHour;
  return mps;
}

export function importRoadsFromGeoJSON_v2(geojson) {
  const roads = [];
  const features = geojson.features;
  
  features.forEach((feature) => {
    const properties = feature.properties;
    const geometry = feature.geometry;

    const id = properties.id;
    const coordinates = geometry.coordinates.flat(); // Flatten the MultiLineString coordinates
    const roadType = properties.road_syste === 4 ? "residential" : "highway"; // Example mapping
    const maxSpeedMilesPerHour = properties.speed_limi;
    const maxSpeedMetersPerSec = mphToMps(maxSpeedMilesPerHour);
    const isOneway = properties.lane_direc === "C" ? false : true;
    const laneCount = properties.number_lan;
    const name = properties.municipal_;

    const road = new RoadModel(
      id,
      coordinates,
      roadType,
      maxSpeedMetersPerSec,
      isOneway,
      laneCount,
      name,
      geometry
    );
    roads.push(road);
  });

  return roads;
}


export function importBusRoutesFromGeoJSON(geoJSON) {
  const roads = [];

  const filteredRoads = geoJSON.features;
  filteredRoads.forEach((feature, index) => {
    const properties = feature.properties;
    const geometry = feature.geometry;
    const id = properties.route_id || index; // Use full_id if available, otherwise use the index
    let { coordinates } = geometry;
    // Flatten the MultiLineString coordinates
    coordinates = coordinates.reduce((acc, val) => acc.concat(val), []);
    const roadType = "bus_route";
    const maxSpeedMilesPerHour = properties.maxspeed ? parseInt(properties.maxspeed, 10) : 30;
    const maxSpeedMetersPerSec = mphToMps(maxSpeedMilesPerHour);
    const isOneway = properties.oneway === "yes";
    const laneCount = properties.lanes ? parseInt(properties.lanes, 10) : null;
    const name = properties.route_long;
    const roadLength = turf.length(geometry);
    const road = new RoadModel(
      id,
      coordinates,
      roadType,
      maxSpeedMetersPerSec,
      isOneway,
      laneCount,
      name,
      geometry,
      roadLength
    );
    roads.push(road);
  });

  return roads;
}

function extractMainLineRoutes(geojsonData) {
  // Filter out segments that are labeled as "Main" lines
  const mainLineSegments = geojsonData.features
      .filter(feature => feature.properties.TRACK_TYPE === "Main")
      .map(feature => feature.geometry.coordinates);

  const routes = [];

  // Helper function to check if two segments are connected
  function areSegmentsConnected(seg1, seg2) {
      return (
          JSON.stringify(seg1[seg1.length - 1]) === JSON.stringify(seg2[0]) ||
          JSON.stringify(seg1[0]) === JSON.stringify(seg2[seg2.length - 1])
      );
  }

  // Build routes by connecting segments
  mainLineSegments.forEach(segment => {
      let connected = false;

      for (const route of routes) {
          // Check if the segment can connect to the current route at the beginning or end
          if (areSegmentsConnected(route, segment)) {
              if (JSON.stringify(route[route.length - 1]) === JSON.stringify(segment[0])) {
                  route.push(...segment.slice(1)); // Connect at end
              } else if (JSON.stringify(route[0]) === JSON.stringify(segment[segment.length - 1])) {
                  route.unshift(...segment.slice(0, -1)); // Connect at beginning
              }
              connected = true;
              break;
          }
      }

      // If no connections found, start a new route
      if (!connected) {
          routes.push([...segment]);
      }
  });

  return routes;
}

export function importRailwaysFromGeoJSON(geoJSON) {
  const roads = [];
//   const mainLineRoutes = extractMainLineRoutes(geoJSON);
// console.log(mainLineRoutes);

  const filteredRoads = geoJSON.features;
  const MIN_RAILWAY_LENGTH = 2; // Minimum length in kilometers for train routes

  filteredRoads.forEach((feature, index) => {
    const properties = feature.properties;
    const geometry = feature.geometry;
    const id = properties.route_id || index; // Use full_id if available, otherwise use the index
    let { coordinates } = geometry;
    if (geometry.type === "MultiLineString") {
          // Flatten the MultiLineString coordinates
    coordinates = coordinates.reduce((acc, val) => acc.concat(val), []);
    }

    const roadLength = turf.length(geometry);
    const isLongRoute = roadLength >= MIN_RAILWAY_LENGTH;

    const roadType = "train_route";
    const maxSpeedMilesPerHour = properties.maxspeed ? parseInt(properties.maxspeed, 10) : 30;
    const maxSpeedMetersPerSec = mphToMps(maxSpeedMilesPerHour);
    const isOneway = properties.oneway === "yes";
    const laneCount = properties.lanes ? parseInt(properties.lanes, 10) : null;
    const name = properties.route_long;
    
    const road = new RoadModel(
      id,
      coordinates,
      roadType,
      maxSpeedMetersPerSec,
      isOneway,
      laneCount,
      name,
      geometry,
      roadLength,
      isLongRoute // Add this new property
    );
    roads.push(road);
  });
console.log(roads);
  return roads;
}