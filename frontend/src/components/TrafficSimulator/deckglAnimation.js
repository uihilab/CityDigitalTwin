import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { WebMercatorViewport } from "@deck.gl/core";

class DeckglAnimation {
  static isPointInViewport(point, viewport) {
    const [x, y] = viewport.project([point[0], point[1]]);
    return x >= 0 && x <= viewport.width && y >= 0 && y <= viewport.height;
  }

  constructor(setMapLayers, simulator, modelUrls, simulationType) {
    this.setMapLayers = setMapLayers;
    this.simulator = simulator;
    this.animationId = null; // Keep track of the animation frame ID
    this.isAnimating = false; // Flag to indicate whether animation is running
    this.modelUrls = modelUrls; // Should have modelUrl and sizeScale for each type
    this.simulationType = simulationType; // Type of simulation
  }

  startAnimation(routeData, options, viewportRef) {
    let timestamp = 0;
    const onAnimationFrame = () => {
      // If the animation is stopped, don't continue
      if (!this.isAnimating) return;

      timestamp += 0.02;
      this.simulator.updatePositions(timestamp); // Changed from updateCarPositions

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

      const allTripFrames = [];

      // Set default simulationType if undefined
      const simType = this.simulationType || 'default';

      if (this.simulator.cars) {
        this.simulator.cars.forEach((car) => {
          if (car.tripBuilder) {
            const frame = car.tripBuilder.getFrame(timestamp);
            frame.type = simType; // Use specific type instead of simulationType
            allTripFrames.push(frame);
          }
        });
      }

      if (this.simulator.trains) {
        this.simulator.trains.forEach((train) => {
          if (train.tripBuilder) {
            const frame = train.tripBuilder.getFrame(timestamp);
            frame.type = "trainLocomotive"; // Assign type
            allTripFrames.push(frame);

            train.cars.forEach((car) => {
              const carFrame = {
                point: car.position,
                heading: car.heading,
                type: "trainCar", // Assign type
              };
              allTripFrames.push(carFrame);
            });
          }
        });
      }

      if (this.simulator.roads) {
        this.simulator.roads.forEach((road) => {
          road.cars.forEach((car) => {
            if (car.tripBuilder) {
              const frame = car.tripBuilder.getFrame(timestamp);
              frame.type = "roadCar"; // Use specific type
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

      // Group frames by type
      const framesByType = {};
      visibleFrame.forEach((frame) => {
        const type = frame.type || "default";
        if (!framesByType[type]) {
          framesByType[type] = [];
        }
        framesByType[type].push(frame);
      });

      // Create layers for each type
      const layers = Object.keys(framesByType).map((type) => {
        const modelConfig = this.modelUrls[type] || this.modelUrls['default'];
        return new ScenegraphLayer({
          id: `animation-layer-${type}`,
          data: framesByType[type],
          scenegraph: modelConfig.modelUrl,
          sizeScale: modelConfig.sizeScale,
          getPosition: (d) => d.point,
          getTranslation: [0, 0, 1],
          getOrientation: (d) => [0, 180 - d.heading, 90],
          _lighting: "pbr",
        });
      });

      this.setMapLayers(layers);

      // Request the next animation frame if still animating
      if (this.isAnimating) {
        this.animationId = requestAnimationFrame(onAnimationFrame);
      }
      //this.animationId = requestAnimationFrame(onAnimationFrame);
    };
    // Start animation loop
    this.isAnimating = true;
    this.animationId = requestAnimationFrame(onAnimationFrame);

    //return () => cancelAnimationFrame(animation);
  }

  stopAnimation() {

    try {
      if (this && this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.isAnimating = false;
      this.animationId = null;
      this.setMapLayers([]);
      }
    } catch (error) {
      console.error("Error stopping animation:", error);
      debugger;
    }
  }
}
export default DeckglAnimation;
