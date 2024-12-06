import RandomRouteTrafficGenerator, { createPointFeature } from "./trafficRandomRouteTraffic";
import TripBuilder from "./trip-builder";
const trainSpacingDistance = 200;
const trainSpeed = 60;

class TrainSimulator {
  constructor(roadDataRaw, roadData) {
    this.routes = roadData;
    this.routeGenerator = new RandomRouteTrafficGenerator(roadDataRaw, roadData, 1e-3);
    this.routes = this.routeGenerator.generateRoutes(this.getRoutes());
    this.trains = this.generateTrains(this.routes);
    this.lastTimestamp = null;
  }

  getRoutes() {
    const routes = [];
    routes.push({
      start: [-92.389924181340191, 42.542769354364843],
      end: [-92.275163973984405, 42.477529113526089],
    });
    routes.push({
      start: [-92.4328632, 42.5428187],
      end: [-92.2356214, 42.464944],
    });

    routes.push({
      start: [-92.32986395, 42.49283162],
      end: [-92.248906, 42.4689823],
    });
    routes.push({
      start: [-92.2538184, 42.5129998],
      end: [-92.282081, 42.439778],
    });
    routes.push({
      start: [-92.31195, 42.494405],
      end: [-92.396044, 42.543462],
    });
    routes.push({
      start: [-92.360834, 42.501087],
      end: [-92.400362, 42.543481],
    });
    routes.push({
      start: [-92.3676717, 42.5426225],
      end: [-92.326127, 42.503816],
    });
    routes.push({
      start: [-92.382378, 42.510608],
      end: [-92.45435, 42.54123],
    });
    return routes;
  }

  updatePositions(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = 0;
    }
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (this.trains) {
      this.trains.forEach((train) => {
        if (!train.tripBuilder) {
          train.tripBuilder = new TripBuilder({
            waypoints: train.route.coordinates,
            speed: train.route.maxSpeed,
            loop: true,
          });
        }

        // Accumulate total time
        train.totalTime += delta;

        // Update locomotive position
        const frame = train.tripBuilder.getFrame(train.totalTime);
        train.position = frame.point;
        train.heading = frame.heading;

        const timePerCar = trainSpacingDistance / train.speed;

        // Update positions of train cars
        train.cars.forEach((car, index) => {
          const carTotalTime = train.totalTime - (index + 1) * timePerCar;
          const carFrame = train.tripBuilder.getFrame(carTotalTime);
          car.position = carFrame.point;
          car.heading = carFrame.heading;
        });
      });
    }
  }

  rotateWaypoints(waypoints) {
    const randomIndex = Math.floor(Math.random() * waypoints.length);
    return [...waypoints.slice(randomIndex), ...waypoints.slice(0, randomIndex)];
  }

  generateTrains(routes) {
    debugger;
    const trains = [];
    routes.forEach((route, index) => {
      const train = {
        id: `train_${index}`,
        route: route,
        position: route,
        cars: [],
        totalTime: 0, // Initialize total time
      };

      // Add 3 cars to each train
      for (let i = 0; i < 3; i++) {
        train.cars.push({
          id: `train_${index}_car_${i}`,
          position: route,
          heading: 0,
        });
      }

      train.speed = trainSpeed; // Store train speed

      train.tripBuilder = new TripBuilder({
        waypoints: route,
        speed: train.speed,
        loop: true,
      });

      trains.push(train);
    });
    return trains;
  }
}

export default TrainSimulator;
