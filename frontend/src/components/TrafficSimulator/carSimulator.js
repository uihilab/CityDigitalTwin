import TrafficGenerator from './trafficGenerator';
import TripBuilder from './trip-builder';

class CarSimulator {
  constructor(geojsonData, numCarsPerRoad) {
    this.trafficGenerator = new TrafficGenerator(geojsonData);
    this.roads = this.trafficGenerator.generateRandomCars(numCarsPerRoad);
    this.lastTimestamp = null;
  }

  updateCarPositions(timestamp) {
    var frames = [];
    if (!this.lastTimestamp) {
      this.lastTimestamp = 0;
    }
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.roads.forEach(road => {
      road.cars.forEach(car => {
        if (!car.tripBuilder) {
          car.tripBuilder = new TripBuilder({
            waypoints: road.geometry.coordinates,
            speed: road.maxSpeed, // meters per second
            loop: true
          });
        }
        const frame = car.tripBuilder.getFrame(delta);
        car.position = frame.point;
        car.heading = frame.heading;
      });
    });
    return frames;
  }

  
}

export default CarSimulator;
