export default function generateRandomPaths(roads, numPaths = 10, minDistance = 0.1) {
  const paths = [];

  for (let i = 0; i < numPaths; i++) {
    const startRoad = roads[Math.floor(Math.random() * roads.length)];
    const endRoad = roads[Math.floor(Math.random() * roads.length)];

    // Ensure start and end roads are not the same and have a minimum distance apart
    if (startRoad.id !== endRoad.id && getDistance(startRoad, endRoad) > minDistance) {
      const startPoint = getRandomPointOnRoad(startRoad);
      const endPoint = getRandomPointOnRoad(endRoad);
      paths.push({ start: startPoint, end: endPoint });
    } else {
      i--; // Retry if roads are too close or the same
    }
  }

  return paths;
}

function getRandomPointOnRoad(road) {
  const coordinates = road.coordinates;
  const randomIndex = Math.floor(Math.random() * (coordinates.length - 1));
  const startCoord = coordinates[randomIndex];
  const endCoord = coordinates[randomIndex + 1];

  // Linear interpolation between two coordinates to find a random point
  const t = Math.random();
  const randomPoint = [
    startCoord[0] + t * (endCoord[0] - startCoord[0]),
    startCoord[1] + t * (endCoord[1] - startCoord[1]),
  ];

  return randomPoint;
}

function getDistance(road1, road2) {
  // Calculate the Euclidean distance between the midpoints of the two roads
  const midpoint1 = getMidpoint(road1.coordinates);
  const midpoint2 = getMidpoint(road2.coordinates);
  const dx = midpoint1[0] - midpoint2[0];
  const dy = midpoint1[1] - midpoint2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(coordinates) {
  const totalCoords = coordinates.length;
  const midpointIndex = Math.floor(totalCoords / 2);
  return coordinates[midpointIndex];
}

// Example usage:
// const randomPaths = generateRandomPaths(importedRoads, 20, 0.2);
// console.log(randomPaths);
