class RoadModel {
  constructor(id, coordinates, roadType, maxSpeed, isOneway, laneCount, name, geometry) {
    this.id = id; // Unique identifier for the road
    this.coordinates = coordinates; // Array of coordinates representing the LineString
    this.roadType = roadType; // Type of the road (e.g., highway, residential)
    this.maxSpeed = maxSpeed; // Maximum speed allowed on the road
    this.isOneway = isOneway; // Boolean indicating if the road is one-way
    this.laneCount = laneCount; // Number of lanes on the road
    this.name = name;
    this.geometry = geometry;
  }

  addCar(car) {
    this.cars.push(car);
  }

  // Method to display road information
  displayInfo() {
    console.log(`Road ID: ${this.id}`);
    console.log(`Coordinates: ${JSON.stringify(this.coordinates)}`);
    console.log(`Road Type: ${this.roadType}`);
    console.log(`Max Speed: ${this.maxSpeed} km/h`);
    console.log(`One-way: ${this.isOneway ? 'Yes' : 'No'}`);
    console.log(`Lane Count: ${this.laneCount}`);
  }

  // Method to add a coordinate to the LineString
  addCoordinate(coord) {
    this.coordinates.push(coord);
  }

  // Method to remove a coordinate from the LineString
  removeCoordinate(index) {
    if (index >= 0 && index < this.coordinates.length) {
      this.coordinates.splice(index, 1);
    } else {
      console.log('Invalid index');
    }
  }
}

export default RoadModel;