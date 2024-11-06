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
      if (d.colorrgba) {
        return d.colorrgba;
      }
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

function hexToRGBA(hex) {
  hex = hex.replace("#", "");
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
    throw new Error("Invalid hex color format.");
  }

  return [r, g, b, 255];
}

export function colorizeRoutes(routes) {
  const routeColors = {
    1: "#FF5733", // FAIRGROUNDS
    2: "#33C1FF", // MAURY ST
    3: "#FFC300", // UNIVERSITY
    4: "#DAF7A6", // E 14TH ST
    6: "#C70039", // INDIANOLA AVE
    7: "#900C3F", // SW 9TH ST
    8: "#581845", // FLEUR DR
    9: "#800080", // Cedar Falls Loop - PURPLE
    10: "#FF8C00", // EAST UNIVERSITY
    11: "#2E8B57", // INGERSOLL / VALLEY JUNCTION
    12: "#4682B4", // UNI Weekend Safe Ride
    "5L": "#D2B48C", // Crossroads/La Porte Road - TAN
    "5W11": "#D2B48C", // Crossroads/West 11th Street - TAN
  };

  routes.forEach((route) => {
    // Get the route_id from the feature's properties
    const routeId = route.id;
    //debugger;
    // Assign the color based on the route_id
    route.color = routeColors[routeId] || "#000000"; // Default to black if not found
    route.colorrgba = hexToRGBA(route.color);
  });

  return routes;
}