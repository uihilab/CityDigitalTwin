import CarSimulator from "./carSimulator";
import BusSimulator from "./busSimulator";
import DeckglAnimation from "./deckglAnimation";
import { importBusRoutesFromGeoJSON, importOSMRoadsFromGeoJSON } from "./roadDataImporter";
import { colorizeRoutes, generateRoadLayer, getRouteLayer } from "./routes";

function getRoadDataPath(floodYears) {
  let result = "";
  if (floodYears > 0) {
    result = `${process.env.PUBLIC_URL}/data/roads/roads_${floodYears}yr_flood.geojson`;
  } else {
    result = `${process.env.PUBLIC_URL}/data/roads/roads_waterloo.geojson`;
  }
  return result;
}

function getBusRoadDataPath(floodYears) {
  let result = "";
  if (floodYears > 0) {
    result = `${process.env.PUBLIC_URL}/data/roads/bus/roads_${floodYears}yr_flood.geojson`;
  } else {
    result = `${process.env.PUBLIC_URL}/data/roads/bus/roads_0yr_flood.geojson`;
  }
  return result;
}

async function loadRoadData(floodYears, roadType) {
  let roadDataPath;
  if (roadType === "car") {
    roadDataPath = getRoadDataPath(floodYears);
  } else if (roadType === "bus") {
    roadDataPath = getBusRoadDataPath(floodYears);
  }
  const response = await fetch(roadDataPath);
  const roadData = await response.json();
  return roadData;
}

let stopAnimation = null;

export async function startTrafficSimulator(
  simulationType,
  setAnimationLayers,
  setMapLayerStatic,
  viewportRef,
  floodYears,
  modelUrl
) {
  let roadData;
  let roadDataTransformed;
  let allRoadsLayer;
  let simulator;
  if (simulationType === "car") {
    roadData = await loadRoadData(floodYears, simulationType);
    roadDataTransformed = importOSMRoadsFromGeoJSON(roadData);
    allRoadsLayer = generateRoadLayer(roadDataTransformed);
    simulator = new CarSimulator(roadData, roadDataTransformed);
  } else if (simulationType === "bus") {
    roadData = await loadRoadData(floodYears, simulationType);
    roadDataTransformed = importBusRoutesFromGeoJSON(roadData);
    roadDataTransformed = colorizeRoutes(roadDataTransformed);
    allRoadsLayer = generateRoadLayer(roadDataTransformed);
    simulator = new BusSimulator(roadData, roadDataTransformed);
  }
  setMapLayerStatic([allRoadsLayer, getRouteLayer(simulator.routes)]);
  const animation = new DeckglAnimation(setAnimationLayers, simulator, modelUrl);
  animation.startAnimation(null, null, viewportRef);
  // Stop the animation when needed
  stopAnimation = animation.stopAnimation;
}

export function stopTrafficSimulator() {
  if (stopAnimation) {
    stopAnimation();
  }
}
