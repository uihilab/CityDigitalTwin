import CarSimulator from "./carSimulator";
import DeckglAnimation from "./deckglAnimation";
import { importOSMRoadsFromGeoJSON, importRoadsFromGeoJSON_v2 } from "./roadDataImporter";
import { LineLayer, PathLayer } from "@deck.gl/layers";

const roadDataPath = `${process.env.PUBLIC_URL}/data/roads/roads_100yr_flood.geojson`;
//const roadDataPath = `${process.env.PUBLIC_URL }/data/highway_waterloo.geojson`;
//const roadDataPath = process.env.PUBLIC_URL +"/data/waterloo_roads_v2.geojson";
async function loadRoadData() {
  const response = await fetch(roadDataPath);
  const roadData = await response.json();
  return roadData;
}

function drawRoutes(routes, setMapLayer) {
  const routeLayer = new PathLayer({
    id: "PathLayer",
    data: routes,

    /* props from PathLayer class */

    // billboard: false,
    // capRounded: false,
    getColor: (d) => {
      const hex = "#ed1c24";
      // convert to RGB
      return hex.match(/[0-9a-f]{2}/g).map((x) => parseInt(x, 16));
    },
    getPath: (d) => d,
    getWidth: 5,
    // jointRounded: false,
    // miterLimit: 4,
    // widthMaxPixels: Number.MAX_SAFE_INTEGER,
    widthMinPixels: 2,
    // widthScale: 1,
    // widthUnits: 'meters',

    /* props inherited from Layer class */

    // autoHighlight: false,
    // coordinateOrigin: [0, 0, 0],
    // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    // highlightColor: [0, 0, 128, 128],
    // modelMatrix: null,
    // opacity: 1,
    parameters: {
      depthMask: false,
    },
    pickable: true,
    // visible: true,
    // wrapLongitude: false,
  });
  setMapLayer(routeLayer);
}

export async function startTrafficSimulator(setMapLayer, setMapLayerStatic, viewportRef) {
  const roadData = await loadRoadData();
  const roadDataTransformed = importOSMRoadsFromGeoJSON(roadData);
  //var roadDataTransformed = importRoadsFromGeoJSON_v2(roadData);
  const carSimulator = new CarSimulator(roadData, roadDataTransformed);
  drawRoutes(carSimulator.routes, setMapLayerStatic);
  const animation = new DeckglAnimation(setMapLayer, carSimulator);
  animation.startAnimation(null, null, viewportRef);
}

export function stopTrafficSimulator(setMapLayer) {
  //   const carSimulator = new CarSimulator(roadData, 5);
  //   const animation = new DeckglAnimation(setMapLayer, carSimulator);
  //   animation.startAnimation();
}
