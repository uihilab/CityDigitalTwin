import PathFinder from "geojson-path-finder";
import generateRandomPaths from "./randomPathGenerator";

export const createPointFeature = (coordinates) => ({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates,
  },
  properties: {},
});

class RandomRouteTrafficGenerator {
  constructor(roadDataRaw, roadData) {
    this.roadDataRaw = roadDataRaw;
    this.roadData = roadData;
    this.pathFinder = new PathFinder(this.roadDataRaw, { tolerance: 1e-3 });//{ tolerance: 1e-3 }
  }

  findPath(start, end) {
    const path = this.pathFinder.findPath(start, end);
    return path;
  }

  generateRandomRoutes(numPaths, minDistance) {
    const randomPaths = generateRandomPaths(this.roadData, numPaths, minDistance);
    return this.generateRoutes(randomPaths);
  }

  generateRoutes(paths) {
    this.routes = [];
debugger;
    paths.forEach((path) => {
      const start = createPointFeature(path.start);
      const end = createPointFeature(path.end);
      const route = this.findPath(start, end);
      if (route) {
        this.routes.push(route.path);
      }
    });

    return this.routes;
  }
}

export default RandomRouteTrafficGenerator;
