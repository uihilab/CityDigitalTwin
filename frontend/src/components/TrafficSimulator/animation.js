// import {ScenegraphLayer} from "@deck.gl/mesh-layers";
// import TripBuilder from '../TrafficSimulator/trip-builder';
// import { PathLayer } from "@deck.gl/layers";

// function startAnimation(routeData, setMapLayers, options, simulator)
// {
//     const MODEL_URL = "./data/CesiumMilkTruck.glb";
//     const data = routeData;//tripData;
//     const trips = data.map((waypoints) => new TripBuilder({ waypoints, loop: true }));
//     let timestamp = 0;
//     let animation = null;
//     const onAnimationFrame = () => {
//       timestamp += 0.02;

//       const frame = trips.map(trip => trip.getFrame(timestamp));

//       // Set the camera to follow the first truck      
//       if (options.tracking) {
//         map.moveCamera({
//           center: {lat: frame[0].point[1], lng: frame[0].point[0]},
//           heading: frame[0].heading
//         });
//       }

//       const layers = [
//         options.showPaths &&
//           new PathLayer({
//             id: 'animation-trip-lines',
//             data: trips,
//             getPath: d => d.keyframes.map(f => f.point),
//             getColor: _ => [128 * Math.random(), 255 * Math.random(), 255],
//             jointRounded: true,
//             opacity: 0.5,
//             getWidth: 10
//           }),
//         new ScenegraphLayer({
//           id: 'animation-truck',
//           data: frame,
//           scenegraph: MODEL_URL,
//           sizeScale: 2,
//           getPosition: d => d.point,
//           getTranslation: [0, 0, 1],
//           getOrientation: d => [0, 180 - d.heading, 90],
//           _lighting: 'pbr'
//         })
//       ];
//       setMapLayers(layers);

//       animation = requestAnimationFrame(onAnimationFrame);
//     };
//     onAnimationFrame();

//     return () => cancelAnimationFrame(animation);
// }

// export {startAnimation}