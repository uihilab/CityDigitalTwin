import length from '@turf/length';
import along from '@turf/along';

const turf = {
  length,
  along
};

class TrafficGenerator {
  constructor(roadData) {
    this.roadData = roadData;
  }

  getRandomRoad() {
    const randomIndex = Math.floor(Math.random() * roadData.length);
    return features[randomIndex];
  }

  getRandomPointOnLineString(geojson) {
    const length = turf.length(geojson);
    const randomDistance = Math.random() * length;
    return turf.along(geojson, randomDistance);
  }

  generateRandomCars(numCarsPerRoad) {
    //const roads = [];

    this.roadData.forEach((road, index) => {
      if (road.geometry.type === 'LineString') {
        const cars = [];
        for (let i = 0; i < numCarsPerRoad; i++) {
          const randomPoint = this.getRandomPointOnLineString(road.geometry);
          const car = {
            id: `car_${index}_${i + 1}`,
            position: randomPoint.geometry.coordinates,
            direction: Math.random() < 0.5 ? 'forward' : 'backward' // Random initial direction
          };
          cars.push(car);
        }
        road.cars = cars;
        // roads.push({
        //   id: road.id || `road_${index + 1}`,
        //   name: road.properties.name || `Road ${index + 1}`,
        //   cars: cars,
        //   geometry: road.geometry
        // });
      }
    });

    return this.roadData;
  }
}

export default TrafficGenerator;
