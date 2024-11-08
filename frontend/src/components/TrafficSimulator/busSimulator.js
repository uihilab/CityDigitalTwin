import TripBuilder from "./trip-builder";

class BusSimulator {
  constructor(roadDataRaw, roadData) {
    this.routes = roadData;
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
            waypoints: road.waypoints.coordinates,
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

  rotateWaypoints(waypoints) {
    const randomIndex = Math.floor(Math.random() * waypoints.length);
    return [...waypoints.slice(randomIndex), ...waypoints.slice(0, randomIndex)];
  }

  generateCars(routes) {
    const cars = [];
    routes.forEach((route, index) => {
      const car = {
        id: `bus_route_${index}`,
        position: route,
        direction: Math.random() < 0.5 ? "forward" : "backward", // Random initial direction
      };
      const rotatedWaypoints = this.rotateWaypoints(route.coordinates);
      car.tripBuilder = new TripBuilder({
        waypoints: rotatedWaypoints,
        speed: 30, //TODO: road.maxSpeed, // meters per second
        loop: true,
      });
      cars.push(car);
    });
    return cars;
  }
}

export default BusSimulator;
