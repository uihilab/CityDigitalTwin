import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { WebMercatorViewport } from "@deck.gl/core";

class DeckglAnimation {
  isPointInViewport(point, viewport) {
    const [x, y] = viewport.project([point[0], point[1]]);
    return x >= 0 && x <= viewport.width && y >= 0 && y <= viewport.height;
  }

  constructor(setMapLayers, simulator, modelUrl) {
    this.setMapLayers = setMapLayers;
    this.simulator = simulator;
    this.animationId = null; // Keep track of the animation frame ID
    this.isAnimating = false; // Flag to indicate whether animation is running
    this.modelUrl = modelUrl;
  }

  startAnimation(routeData, options, viewportRef) {
    //const MODEL_URL = `${process.env.PUBLIC_URL}/data/CesiumMilkTruck.glb`;
    //const MODEL_URL = `${process.env.PUBLIC_URL}/data/car_green.glb`;
    const MODEL_URL = `${process.env.PUBLIC_URL}/data/Old_Rusty_Bus.glb`;
    //const data = routeData;
    let timestamp = 0;
    //let animation = null;
    const onAnimationFrame = () => {
      // If the animation is stopped, don't continue
      if (!this.isAnimating) return;

      timestamp += 0.02;
      this.simulator.updateCarPositions(timestamp);

      let currentViewport = null;
      if (viewportRef) {
        const viewport = viewportRef.current;

        // Calculate the viewport
        currentViewport = new WebMercatorViewport({
          width: window.innerWidth,
          height: window.innerHeight,
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom,
        });

        //console.log(viewport.latitude, viewport.longitude);
      }

      let allTripFrames = [];

      if (this.simulator.cars) {
        this.simulator.cars.forEach((car) => {
          if (car.tripBuilder) {
            // Run tripBuilder.getFrame and collect the result
            const frame = car.tripBuilder.getFrame(timestamp);
            allTripFrames.push(frame);
          }
        });
      }

      if (this.simulator.roads) {
        this.simulator.roads.forEach((road) => {
          road.cars.forEach((car) => {
            if (car.tripBuilder) {
              // Run tripBuilder.getFrame and collect the result
              const frame = car.tripBuilder.getFrame(timestamp);
              allTripFrames.push(frame);
            }
          });
        });
      }

      let visibleFrame = null;
      if (currentViewport) {
        // Filter frame data to only include points within the viewport
        visibleFrame = allTripFrames.filter((d) =>
          this.isPointInViewport(d.point, currentViewport)
        );
      } else {
        visibleFrame = allTripFrames;
      }
      // // Set the camera to follow the first truck
      // if (options.tracking) {
      //   map.moveCamera({
      //     center: { lat: frame[0].point[1], lng: frame[0].point[0] },
      //     heading: frame[0].heading
      //   });
      // }

      const layers = [
        // options.showPaths &&
        // new PathLayer({
        //   id: 'animation-trip-lines',
        //   data: trips,
        //   getPath: d => d.keyframes.map(f => f.point),
        //   getColor: _ => [128 * Math.random(), 255 * Math.random(), 255],
        //   jointRounded: true,
        //   opacity: 0.5,
        //   getWidth: 10
        // }),
        new ScenegraphLayer({
          id: "animation-layer",
          data: visibleFrame,
          scenegraph: this.modelUrl,
          sizeScale: 20,
          getPosition: (d) => d.point,
          getTranslation: [0, 0, 1],
          getOrientation: (d) => [0, 180 - d.heading, 90],
          _lighting: "pbr",
        }),
      ];
      this.setMapLayers(layers);

      // Request the next animation frame if still animating
      this.animationId = requestAnimationFrame(onAnimationFrame);
    };
    // Start animation loop
    this.isAnimating = true;
    this.animationId = requestAnimationFrame(onAnimationFrame);

    //return () => cancelAnimationFrame(animation);
  }

  stopAnimation = () => {  // Converted to an arrow function
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.isAnimating = false;
      this.animationId = null;
      this.setMapLayers([]);
    }
  };
}
export default DeckglAnimation;
