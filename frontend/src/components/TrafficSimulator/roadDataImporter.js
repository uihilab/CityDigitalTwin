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
  debugger;

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
