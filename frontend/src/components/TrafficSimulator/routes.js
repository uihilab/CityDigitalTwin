import { LineLayer, PathLayer } from "@deck.gl/layers";

export function getRouteLayer(routes) {
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
  return routeLayer;
  //setMapLayer(routeLayer);
}

export function generateRoadLayer(roads) {
  const routeLayer = new PathLayer({
    id: "RoadsLayer",
    data: roads,

    /* props from PathLayer class */

    // billboard: false,
    // capRounded: false,
    getColor: (d) => {
      const hex = "#808080";
      // convert to RGB
      return hex.match(/[0-9a-f]{2}/g).map((x) => parseInt(x, 16));
    },
    getPath: (d) => d.coordinates,
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
  return routeLayer;
}
