import RandomRouteTrafficGenerator, { createPointFeature } from "./trafficRandomRouteTraffic";
import TripBuilder from "./trip-builder";

class TrainSimulator {
  constructor(roadDataRaw, roadData) {
    this.routes = roadData;
    this.routeGenerator = new RandomRouteTrafficGenerator(roadDataRaw, roadData);
    this.routes = this.routeGenerator.generateRoutes(this.getRoutes());
    //console.log(this.routes);
    // this.routes = [
    //   {
    //     coordinates: [
    //       [-92.407386253237547, 42.543651277187941],
    //       [-92.398567025006557, 42.543563084905628],
    //       [-92.394069218608749, 42.543298508058704],
    //       [-92.389924181340191, 42.542769354364843],
    //       [-92.387190220588579, 42.542240200670982],
    //       [-92.383662529296188, 42.540917316436335],
    //       [-92.380487607133034, 42.539241663072445],
    //       [-92.376783531276018, 42.536595894603145],
    //       [-92.370521879232015, 42.532803626463824],
    //       [-92.365142150011081, 42.529143646747961],
    //       [-92.363201919800275, 42.527864858654468],
    //       [-92.361261689589455, 42.526630166702127],
    //       [-92.358241103920335, 42.524645840350153],
    //       [-92.337912782847908, 42.511394949933091],
    //       [-92.331562938521586, 42.507338104946832],
    //       [-92.330306198498675, 42.506764855111818],
    //       [-92.324309123301603, 42.502906442760761],
    //       [-92.321112153067858, 42.50037091464435],
    //       [-92.315666279635224, 42.496777079140223],
    //       [-92.304024898370329, 42.489104350579261],
    //       [-92.299218418984438, 42.485951476486683],
    //       [-92.297432525267666, 42.48493726524012],
    //       [-92.293552064846025, 42.483570284864314],
    //       [-92.286518730331807, 42.481255237453681],
    //       [-92.275163973984405, 42.477529113526089],
    //     ],
    //   },
    // ]; // Hardcoded route for testing
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
      start: [-92.287873, 42.481739],
      end: [-92.310451, 42.493333],
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

        // Define spacing between cars
        const spacingDistance = 70; // Adjust this value for desired car spacing
        const timePerCar = spacingDistance / train.speed;

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

      train.speed = 30; // Store train speed

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
