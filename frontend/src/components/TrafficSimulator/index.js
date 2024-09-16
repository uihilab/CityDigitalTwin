import CarSimulator from "./carSimulator";
import DeckglAnimation from "./deckglAnimation";
import { importOSMRoadsFromGeoJSON } from "./roadDataImporter";
import { generateRoadLayer, getRouteLayer } from "./routes";

function getRoadDataPath(floodYears) {
  let result = "";
  if (floodYears > 0) {
    result = `${process.env.PUBLIC_URL}/data/roads/roads_${floodYears}yr_flood.geojson`;
  } else {
    result = `${process.env.PUBLIC_URL}/data/roads/roads_waterloo.geojson`;
  }
  return result;
}

async function loadRoadData(floodYears) {
  const roadDataPath = getRoadDataPath(floodYears);
  const response = await fetch(roadDataPath);
  const roadData = await response.json();
  return roadData;
}

let stopAnimation = null;

export async function startTrafficSimulator(
  setAnimationLayers,
  setMapLayerStatic,
  viewportRef,
  floodYears,
  modelUrl
) {
  const roadData = await loadRoadData(floodYears);
  const roadDataTransformed = importOSMRoadsFromGeoJSON(roadData);
  const allRoadsLayer = generateRoadLayer(roadDataTransformed);
  const carSimulator = new CarSimulator(roadData, roadDataTransformed);
  setMapLayerStatic([allRoadsLayer, getRouteLayer(carSimulator.routes)]);
  const animation = new DeckglAnimation(setAnimationLayers, carSimulator, modelUrl);
  animation.startAnimation(null, null, viewportRef);
  // Stop the animation when needed
  stopAnimation = animation.stopAnimation;
}

export function stopTrafficSimulator() {
  if (stopAnimation) {
    stopAnimation();
  }
}
