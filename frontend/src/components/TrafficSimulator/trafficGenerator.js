import length from '@turf/length';
import along from '@turf/along';

const turf = {
  length,
  along
};

class TrafficGenerator {
  constructor(geojsonData) {
    this.geojsonData = geojsonData;
  }

  getRandomRoad() {
    const features = this.geojsonData.features.filter(
      feature => feature.geometry.type === 'LineString'
    );
    const randomIndex = Math.floor(Math.random() * features.length);
    return features[randomIndex];
  }

  getRandomPointOnLineString(lineString) {
    const length = turf.length(lineString);
    const randomDistance = Math.random() * length;
    return turf.along(lineString, randomDistance);
  }

  generateRandomCars(numCarsPerRoad) {
    const roads = [];

    this.geojsonData.features.forEach((road, index) => {
      if (road.geometry.type === 'LineString') {
        const cars = [];
        for (let i = 0; i < numCarsPerRoad; i++) {
          const randomPoint = this.getRandomPointOnLineString(road);
          const car = {
            id: `car_${index}_${i + 1}`,
            position: randomPoint.geometry.coordinates,
            direction: Math.random() < 0.5 ? 'forward' : 'backward' // Random initial direction
          };
          cars.push(car);
        }

        roads.push({
          id: road.id || `road_${index + 1}`,
          name: road.properties.name || `Road ${index + 1}`,
          cars: cars,
          geometry: road.geometry
        });
      }
    });

    return roads;
  }
}

export default TrafficGenerator;
