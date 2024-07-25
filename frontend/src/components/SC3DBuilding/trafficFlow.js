import CarSimulator from "components/TrafficSimulator/carSimulator";
import { startAnimation } from "./animation";
import PathFinder from 'geojson-path-finder';

const roadDataPath = `${process.env.PUBLIC_URL }/data/highway_waterloo.geojson`;
let roadData = null;

export async function startTrafficFlow(setAnimationLayers, map) {
    const response = await fetch(roadDataPath);
    roadData = await response.json();

    const numCarsPerRoad = 5; // Number of cars per road
    const simulator = new CarSimulator(roadData, numCarsPerRoad);
    simulator.startSimulation(1000);

    console.log(roadData);
    debugger;
    let routeData = [];
    routeData.push(route1());
    routeData.push(route2());

    var stopAnimation = startAnimation(routeData, setAnimationLayers, { showPaths: true, tracking: false });
    return stopAnimation;
}

function route1() {
    //42.497032, -92.376278
    const start = createPointFeature([-92.376278, 42.497032]);
    //42.487985, -92.313380
    const end = createPointFeature([-92.313380, 42.487985]);
    var path = findPath(start, end);
    return path.path;
}

function route2() {
    //42.505396, -92.342412
    const start = createPointFeature([-92.342412, 42.505396]);
    //42.471816, -92.348645
    const end = createPointFeature([-92.348645, 42.471816]);
    var path = findPath(start, end);
    return path.path;
}

function findPath(start, end) {
    var pathFinder = new PathFinder(roadData, { tolerance: 1e-3 });
    //42.515939,-92.475933
    const path = pathFinder.findPath(start, end);
    return path;
}

const createPointFeature = (coordinates) => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates
    },
    properties: {}
});