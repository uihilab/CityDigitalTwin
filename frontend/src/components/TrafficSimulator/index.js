import CarSimulator from "./carSimulator";
import BusSimulator from "./busSimulator";
import TrainSimulator from "./trainSimulator";
import DeckglAnimation from "./deckglAnimation";
import {
  importBusRoutesFromGeoJSON,
  importOSMRoadsFromGeoJSON,
  importRailwaysFromGeoJSON,
} from "./roadDataImporter";
import { colorizeRoutes, generateRoadLayer, getRouteLayer } from "./routes";
import modelUrls from "./modelFiles";

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
  } else if (roadType === "train") {
    roadDataPath = `${process.env.PUBLIC_URL}/data/train/Rail_Line_Active_linestring.geojson`;
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
  routeNumber
) {
  let roadData;
  let roadDataTransformed;
  let allRoadsLayer;
  let simulator;
  if (simulationType === "car") {
    roadData = await loadRoadData(floodYears, simulationType);
    roadDataTransformed = importOSMRoadsFromGeoJSON(roadData);
    allRoadsLayer = generateRoadLayer(roadDataTransformed);
    simulator = new CarSimulator(roadData, roadDataTransformed, routeNumber);
  } else if (simulationType === "bus") {
    roadData = await loadRoadData(floodYears, simulationType);
    roadDataTransformed = importBusRoutesFromGeoJSON(roadData);
    roadDataTransformed = colorizeRoutes(roadDataTransformed);
    allRoadsLayer = generateRoadLayer(roadDataTransformed);
    simulator = new BusSimulator(roadData, roadDataTransformed);
  } else if (simulationType === "train") {
    roadData = await loadRoadData(floodYears, simulationType);
    //remove elevation data from train road data
    roadData.features.forEach((feature) => {
      feature.geometry.coordinates = feature.geometry.coordinates.map((coord) => [
        coord[0],
        coord[1],
      ]);
    });
    roadDataTransformed = importRailwaysFromGeoJSON(roadData);
    allRoadsLayer = generateRoadLayer(roadDataTransformed);
    simulator = new TrainSimulator(roadData, roadDataTransformed);
  }
  setMapLayerStatic([allRoadsLayer, getRouteLayer(simulator.routes)]);
  const animation = new DeckglAnimation(setAnimationLayers, simulator, modelUrls, simulationType);
  animation.startAnimation(null, null, viewportRef);
  // Stop the animation when needed
  stopAnimation = animation.stopAnimation;
}

export function stopTrafficSimulator() {
  if (stopAnimation) {
    stopAnimation();
  }
}
