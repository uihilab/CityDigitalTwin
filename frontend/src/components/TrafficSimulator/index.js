import CarSimulator from "./carSimulator";
import DeckglAnimation from "./deckglAnimation";
import { importOSMRoadsFromGeoJSON, importRoadsFromGeoJSON_v2 } from "./roadDataImporter";

const roadDataPath = `${process.env.PUBLIC_URL }/data/highway_waterloo.geojson`;
//const roadDataPath = process.env.PUBLIC_URL +"/data/waterloo_roads_v2.geojson";
async function loadRoadData() {
    const response = await fetch(roadDataPath);
    const roadData = await response.json();
    return roadData;
}

export async function startTrafficSimulator(setMapLayer, viewportRef) {
    const roadData = await loadRoadData();
    var roadDataTransformed = importOSMRoadsFromGeoJSON(roadData);
    //var roadDataTransformed = importRoadsFromGeoJSON_v2(roadData);
    const carSimulator = new CarSimulator(roadDataTransformed);
    const animation = new DeckglAnimation(setMapLayer, carSimulator);
    animation.startAnimation(null, null, viewportRef);
}

export function stopTrafficSimulator(setMapLayer) {
    const carSimulator = new CarSimulator(roadData, 5);
    const animation = new DeckglAnimation(setMapLayer, carSimulator);
    animation.startAnimation();
}