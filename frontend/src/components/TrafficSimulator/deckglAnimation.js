import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { WebMercatorViewport } from '@deck.gl/core';

class DeckglAnimation {

  isPointInViewport(point, viewport) {
    const [x, y] = viewport.project([point[0], point[1]]);
    return x >= 0 && x <= viewport.width && y >= 0 && y <= viewport.height;
  }

  constructor(setMapLayers, simulator) {
    this.setMapLayers = setMapLayers;
    this.simulator = simulator;
  }

  startAnimation(routeData, options, viewportRef) {
    const MODEL_URL = `${process.env.PUBLIC_URL }/data/CesiumMilkTruck.glb`;
    //const data = routeData;
    let timestamp = 0;
    let animation = null;
    const onAnimationFrame = () => {
      timestamp += 0.02;
      this.simulator.updateCarPositions(timestamp);
      var viewport = viewportRef.current;

      // Calculate the viewport
      const currentViewport = new WebMercatorViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: viewport.longitude,
        latitude: viewport.latitude,
        zoom: viewport.zoom
      });
      
      //console.log(viewport.latitude, viewport.longitude);

      let allTripFrames = [];

      this.simulator.roads.forEach(road => {
        road.cars.forEach(car => {
          if (car.tripBuilder) {
            // Run tripBuilder.getFrame and collect the result
            const frame = car.tripBuilder.getFrame(timestamp);
            allTripFrames.push(frame);
          }
        });
      });

      // Filter frame data to only include points within the viewport
      const visibleFrame = allTripFrames.filter(d => this.isPointInViewport(d.point, currentViewport));
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
          id: "animation-truck",
          data: visibleFrame,
          scenegraph: MODEL_URL,
          sizeScale: 2,
          getPosition: d => d.point,
          getTranslation: [0, 0, 1],
          getOrientation: d => [0, 180 - d.heading, 90],
          _lighting: 'pbr'
        })
      ];
      this.setMapLayers(layers);

      animation = requestAnimationFrame(onAnimationFrame);
    };
    onAnimationFrame();

    return () => cancelAnimationFrame(animation);
  }
}
export default DeckglAnimation;