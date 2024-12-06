import RandomRouteTrafficGenerator from "./trafficRandomRouteTraffic";
import TripBuilder from "./trip-builder";

class CarSimulator {
  constructor(roadDataRaw, roadData, routeNumber = 400) {
    this.routeGenerator = new RandomRouteTrafficGenerator(roadDataRaw, roadData, 1e-4);
    this.routes = this.routeGenerator.generateRandomRoutes(routeNumber, 0.001);
    this.cars = this.generateCars(this.routes);
    this.lastTimestamp = null;
  }

  updatePositions(timestamp) {  // Changed from updateCarPositions
    const frames = [];
    if (!this.lastTimestamp) {
      this.lastTimestamp = 0;
    }
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (this.cars) {
      this.cars.forEach((car) => {
        if (!car.tripBuilder) {
          car.tripBuilder = new TripBuilder({
            waypoints: road.geometry.coordinates,
            speed: road.maxSpeed, // meters per second
            loop: true,
          });
        }
        const frame = car.tripBuilder.getFrame(delta);
        car.position = frame.point;
        car.heading = frame.heading;
      });
    }

    if (this.roads) {
      this.roads.forEach((road) => {
        road.cars.forEach((car) => {
          if (!car.tripBuilder) {
            //console.log(road.geometry.coordinates);
            car.tripBuilder = new TripBuilder({
              waypoints: road.geometry.coordinates,
              speed: road.maxSpeed, // meters per second
              loop: true,
            });
          }
          const frame = car.tripBuilder.getFrame(delta);
          car.position = frame.point;
          car.heading = frame.heading;
        });
      });
    }

    return frames;
  }

  generateCars(routes) {
    const cars = [];
    routes.forEach((route, index) => {
      const car = {
        id: `car_route_${index}`,
        position: route,
        direction: Math.random() < 0.5 ? "forward" : "backward", // Random initial direction
      };
      car.tripBuilder = new TripBuilder({
        waypoints: route,
        speed: 30, //TODO: road.maxSpeed, // meters per second
        loop: true,
      });
      cars.push(car);
    });
    return cars;
  }
}

export default CarSimulator;
