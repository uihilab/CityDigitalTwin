import along from "@turf/along";

const turf = {
  along,
};

const numCarsPerMiles = {
  motorway: 39.6,
  trunk: 13.2,
  primary: 6.6,
  secondary: 4.9,
  tertiary: 2.6,
  unclassified: 3.3,
  residential: 2.2
};

class TrafficGenerator {
  constructor(roadData) {
    this.roadData = roadData;
  }

  getRandomRoad() {
    const randomIndex = Math.floor(Math.random() * roadData.length);
    return features[randomIndex];
  }

  getRandomPointOnLineString(roadLength, geojson) {
    const randomDistance = Math.random() * roadLength;
    return turf.along(geojson, randomDistance);
  }

  generateRandomCars() {
    this.roadData.forEach((road, index) => {
      if (road.geometry.type === "LineString") {
        const numCars = numCarsPerMiles[road.roadType] || 0;
        const cars = [];
        for (let i = 0; i < numCars; i++) {
          const randomPoint = this.getRandomPointOnLineString(road.roadLength, road.geometry);
          const car = {
            id: `car_${index}_${i + 1}`,
            position: randomPoint.geometry.coordinates,
            direction: Math.random() < 0.5 ? "forward" : "backward", // Random initial direction
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
