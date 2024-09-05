import { GeoJsonLayer } from "deck.gl";
import { IconLayer } from "@deck.gl/layers";

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

export async function loadBusLayer() {
  const busRoute = await fetch(`${process.env.PUBLIC_URL}/data/Bus_Route_4326.geojson`);
  if (!busRoute.ok) {
    throw new Error(`HTTP error! status: ${busRoute.status}`);
  }

  // Gelen verileri JSON formatında çözümleyin
  const busGeoJson = await busRoute.json();
  // Preprocess the data to split MultiLineString into individual LineStrings
  const processedBusGeoJson = preprocessBusRouteData(busGeoJson);

  const layers = new GeoJsonLayer({
    id: "BusRoute",
    data: processedBusGeoJson,
    pickable: true,

    // Define dynamic color generation for each round (now each is a separate LineString)
    getLineColor: (d) => {
      const coordinatesLength = d.geometry.coordinates.length; // Get the length of the coordinates array
      return generateSharpColorBasedOnRoundLength(coordinatesLength); // Use sharper color bands
    },
    getLineWidth: 20,
    getElevation: 30,
  });
  return layers;
}

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.stop_name !== undefined) {
    tooltipData += `Stop Name: ${item.stop_name}\n`;
  }
  if (item.wheelchair !== undefined) {
    tooltipData += `wheelchair: ${item.wheelchair}\n`;
  }
  return tooltipData.trim(); // Remove trailing newline
}

export async function loadBusStopLayer() {
  const busStop = await fetch(`${process.env.PUBLIC_URL}/data/busstop.geojson`);
  if (!busStop.ok) {
    throw new Error(`HTTP error! status: ${busRoute.status}`);
  }
  const stop = await busStop.json();
  debugger;
  const processedData = stop.features.map((feature) => {
    const item = {
      stop_name: feature.properties.stop_name,
      coordinates: feature.geometry.coordinates,
      wheelchair: feature.properties.wheelchair,
    };
    item.tooltip_data = formatTooltipData(item);
    return item;
  });

  const StopLayer = new IconLayer({
    id: "BusStop",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_map.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_publictransportation.json`,
    getIcon: (d) => "icons8-bus-100",
    sizeScale: 15,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
  });
  return StopLayer;
}

export async function removeBusLayer() {}
