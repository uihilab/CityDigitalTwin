import { GeoJsonLayer } from "deck.gl";
import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

// Function to generate a sharper color based on the length of the coordinates array for each round
function generateSharpColorBasedOnRoundLength(coordinatesLength) {
  // Define color bands based on the length of the coordinates
  if (coordinatesLength < 10) {
    return [0, 255, 0, 255]; // Bright green for short rounds
  } else if (coordinatesLength < 50) {
    return [255, 255, 0, 255]; // Yellow for medium-short rounds
  } else if (coordinatesLength < 70) {
    return [255, 165, 30, 255]; // Orange for medium rounds
  } else if (coordinatesLength < 100) {
    return [0, 0, 255, 255]; // Blue for long rounds
  } else if (coordinatesLength < 130) {
    return [173, 216, 230, 255]; // Açık mavi
  } else if (coordinatesLength < 160) {
    return [255, 0, 0, 255]; // Bright red
  } else {
    return [255, 0, 0, 255]; // Bright red for very long rounds
  }
}

// Function to generate a color based on the length of the coordinates array for each round
function generateColorBasedOnRoundLength(coordinatesLength) {
  const minLength = 2; // Minimum length of the coordinates array
  const maxLength = 50; // Maximum length, adjust based on your dataset

  // Calculate the percentage based on the length of the coordinates
  const percentage = Math.min(
    Math.max((coordinatesLength - minLength) / (maxLength - minLength), 0),
    1
  );

  // Interpolate between green (for short rounds) and red (for long rounds)
  const startColor = [0, 128, 0]; // Green
  const endColor = [255, 0, 0]; // Red

  const r = Math.round(startColor[0] + percentage * (endColor[0] - startColor[0]));
  const g = Math.round(startColor[1] + percentage * (endColor[1] - startColor[1]));
  const b = Math.round(startColor[2] + percentage * (endColor[2] - startColor[2]));

  return [r, g, b, 255]; // Return the RGBA color with full opacity
}

function generateRouteArray(geoJsonData) {
  // Extract unique routes from the GeoJSON data
  const routesMap = new Map();

  geoJsonData.features.forEach((feature) => {
    const properties = feature.properties;
    const routeId = properties.route_id;
    const routeName = properties.route_long || properties.route_shortname || "Unknown";

    if (!routesMap.has(routeId)) {
      routesMap.set(routeId, routeName);
    }
  });

  // Convert the Map to an array
  const routesArray = Array.from(routesMap, ([routeId, routeName]) => ({
    routeId,
    routeName,
  }));
}

// Preprocess the GeoJSON data to split MultiLineString into individual LineStrings
function preprocessBusRouteData(busGeoJson) {
  const newFeatures = [];

  busGeoJson.features.forEach((feature) => {
    if (feature.geometry.type === "MultiLineString") {
      // If it's a MultiLineString, split it into separate LineStrings
      feature.geometry.coordinates.forEach((coordinateSet) => {
        const newFeature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinateSet,
          },
          properties: feature.properties, // Keep the same properties
        };
        newFeatures.push(newFeature);
      });
    } else {
      // If it's already a LineString, add it as is
      newFeatures.push(feature);
    }
  });

  return {
    type: "FeatureCollection",
    features: newFeatures,
  };
}

function colorizeRoutes(routes) {

  const routeColors = {
    "1": "#FF5733",    // FAIRGROUNDS
    "2": "#33C1FF",    // MAURY ST
    "3": "#FFC300",    // UNIVERSITY
    "4": "#DAF7A6",    // E 14TH ST
    "6": "#C70039",    // INDIANOLA AVE
    "7": "#900C3F",    // SW 9TH ST
    "8": "#581845",    // FLEUR DR
    "9": "#800080",    // Cedar Falls Loop - PURPLE
    "10": "#FF8C00",   // EAST UNIVERSITY
    "11": "#2E8B57",   // INGERSOLL / VALLEY JUNCTION
    "12": "#4682B4",   // UNI Weekend Safe Ride
    "5L": "#D2B48C",   // Crossroads/La Porte Road - TAN
    "5W11": "#D2B48C", // Crossroads/West 11th Street - TAN
  };

  routes.features.forEach((feature) => {
    // Get the route_id from the feature's properties
    const routeId = feature.properties.route_id;
//debugger;
    // Assign the color based on the route_id
    feature.properties.color = routeColors[routeId] || "#000000"; // Default to black if not found
    feature.properties.colorrgba = hexToRGBA(feature.properties.color);
  });

  return routes;
}

function hexToRGBA(hex) {
  hex = hex.replace('#', '');
  let bigint = parseInt(hex, 16);
  let r, g, b;

  if (hex.length === 6) {
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else if (hex.length === 3) {
    r = ((bigint >> 8) & 15) * 17;
    g = ((bigint >> 4) & 15) * 17;
    b = (bigint & 15) * 17;
  } else {
    throw new Error('Invalid hex color format.');
  }

  return [r, g, b, 255];
}

export async function getRoutesInfo() {
  const data = await getBusRouteData();
  const routes = {};
  data.features.forEach((feature) => {
    const route_id = feature.properties.route_id;
    if (!routes[route_id]) {
      routes[route_id] = {
        route_id: route_id,
        route_name: feature.properties.route_long,
        route_shortname: feature.properties.route_shortname,
        color: feature.properties.color,
      };
    }
  });
  return Object.values(routes);
}

// Function to group features by route_id
function separateFeaturesByRoute(data) {
  const routeFeatures = {};
  data.features.forEach((feature) => {
    const route_id = feature.properties.route_id;
    if (!routeFeatures[route_id]) {
      routeFeatures[route_id] = [];
    }
    routeFeatures[route_id].push(feature);
  });
  return routeFeatures;
}

function filterGeoJSONByRouteIds(geojsonData, route_ids) {
  const routeIdsSet = new Set(route_ids);
  const filteredFeatures = geojsonData.features.filter((feature) => {
    return routeIdsSet.has(feature.properties.route_id);
  });

  return {
    type: "FeatureCollection",
    features: filteredFeatures,
  };
}

export async function getBusRouteData() {
  const busRoute = await fetch(`${process.env.PUBLIC_URL}/data/waterloo_bus_routes_4326.geojson`);
  if (!busRoute.ok) {
    throw new Error(`HTTP error! status: ${busRoute.status}`);
  }

  const busGeoJson = await busRoute.json();
  // Preprocess the data to split MultiLineString into individual LineStrings
  const processedBusGeoJson = preprocessBusRouteData(busGeoJson);
  const coloredBusRoutes = colorizeRoutes(processedBusGeoJson);

  return coloredBusRoutes;
}

export async function loadBusLayer(routeIdsToKeep) {
  const routeData = await getBusRouteData();
  let filteredRoutes = routeData;
  if (routeIdsToKeep) {
    filteredRoutes = filterGeoJSONByRouteIds(filteredRoutes, routeIdsToKeep);
  }
  const layers = new GeoJsonLayer({
    id: "BusRoute",
    data: filteredRoutes,
    pickable: true,

    // Define dynamic color generation for each round (now each is a separate LineString)
    getLineColor: (d) => d.properties.colorrgba,
    //   {
    //   const coordinatesLength = d.geometry.coordinates.length; // Get the length of the coordinates array
    //   return generateSharpColorBasedOnRoundLength(coordinatesLength); // Use sharper color bands
    // },
    getLineWidth: 20,
    getElevation: 30,
  });
  return layers;
}

const keyMappings = {
  stop_name: "Stop Name",
  wheelchair: "Wheelchair Capacity",
};

export async function loadBusStopLayer(openDetailsBox) {
  const busStop = await fetch(`${process.env.PUBLIC_URL}/data/busstop.geojson`);
  if (!busStop.ok) {
    throw new Error(`HTTP error! status: ${busRoute.status}`);
  }
  const stop = await busStop.json();
  const processedData = stop.features.map((feature) => {
    const item = {
      stop_name: feature.properties.stop_name,
      coordinates: feature.geometry.coordinates,
      wheelchair: feature.properties.wheelchair,
    };
    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });

  const StopLayer = new IconLayer({
    id: "BusStop",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_map.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_publictransportation.json`,
    getIcon: (d) => "icons8-bus-100",
    sizeScale: 6,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 6,
    getTooltip: ({ object }) => object && object.tooltip_data,
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
  return StopLayer;
}

export async function removeBusLayer() {}
