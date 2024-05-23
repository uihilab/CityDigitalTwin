// import React, { useState, useEffect } from 'react';
// import { getTrainData, createStruct } from './AmtrakData.js'; 
// import {Map} from 'react-map-gl';
// import maplibregl from 'maplibre-gl';
// import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
// import DeckGL from '@deck.gl/react';
// import {PolygonLayer} from '@deck.gl/layers';
// import {TripsLayer} from '@deck.gl/geo-layers';

// const ambientLight = new AmbientLight({
//     color: [255, 255, 255],
//     intensity: 1.0
//   });
  
//   const pointLight = new PointLight({
//     color: [255, 255, 255],
//     intensity: 2.0,
//     position: [-74.05, 40.7, 8000]
//   });
  
//   const lightingEffect = new LightingEffect({ambientLight, pointLight});
  
//   const material = {
//     ambient: 0.1,
//     diffuse: 0.6,
//     shininess: 32,
//     specularColor: [60, 64, 70]
//   };
  
//   const DEFAULT_THEME = {
//     buildingColor: [74, 80, 87],
//     trailColor0: [253, 128, 93],
//     trailColor1: [23, 184, 190],
//     material,
//     effects: [lightingEffect]
//   };
  
//   const INITIAL_VIEW_STATE = {
//     longitude: -77.006422,
//     latitude: 38.896993,
//     zoom: 13,
//     pitch: 45,
//     bearing: 0
//   };
  
//   const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
  
//   const landCover = [
//     [
//       [-74.0, 40.7],
//       [-74.02, 40.7],
//       [-74.02, 40.72],
//       [-74.0, 40.72]
//     ]
//   ];

// function SCTrain({
//   trailLength = 180,
//   initialViewState = INITIAL_VIEW_STATE,
//   mapStyle = MAP_STYLE,
//   theme = DEFAULT_THEME,
//   loopLength = 1800, // unit corresponds to the timestamp in source data
//   animationSpeed = 1
// }) {

//     const [time, setTime] = useState(0);
//     const [animation] = useState({});
  
//     const animate = () => {
//       setTime(t => (t + animationSpeed) % loopLength);
//       animation.id = window.requestAnimationFrame(animate);
//     };

    
//   const [trainData, setTrainData] = useState([]);

//   useEffect(() => {
    
//     // Component yüklendiğinde tren verilerini çek
//     const fetchData = async () => {
//       try {
//         const data = await getTrainData();
//       if (data) {
//         var structData=createStruct(data);
//         debugger;
//         setTrainData(structData); // Veri yapısına göre "trains" dizisini kullanın
//       } else {
//         console.error('Train data or train array is missing.');
//       }
//       } catch (error) {
//         console.error('Error fetching train data:', error);
//       }
//     };

//     fetchData();
//     animation.id = window.requestAnimationFrame(animate);
//     return () => window.cancelAnimationFrame(animation.id);
//   }, [animation]);

//   // Eğer trainData dizisi boş ise veya undefined ise, ekrana bir yükleme mesajı gösterin
//   if (!trainData || trainData.length === 0) {
//     return <div>Loading...</div>;
//   }


//   const layers = [
//     // This is only needed when using shadow effects
//     new PolygonLayer({
//       id: 'ground',
//       data: landCover,
//       getPolygon: f => f,
//       stroked: false,
//       getFillColor: [0, 0, 0, 0]
//     }),
//     new TripsLayer({
//       id: 'trips',
//       data: trainData,
//       getPath: d => d.path,
//       getTimestamps: d => d.timestamps,
//       getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
//       opacity: 0.3,
//       widthMinPixels: 2,
//       rounded: true,
//       trailLength,
//       currentTime: time,
//       shadowEnabled: false
//     })
//   ];

//   return (
//     <DeckGL
//       layers={layers}
//       effects={theme.effects}
//       initialViewState={initialViewState}
//       controller={true}
//       height="100vh"
//       width="100vw"
//     >
//       <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} height="100%"
//         width="100%" />
//     </DeckGL>
//   );
//   return (
//     <div>
//       <h1>Amtrak Train Schedule</h1>
//       {trainData.map((item, index) => (
//         <div key={index}>
//           <h2>Vendor: {item.vendor}</h2>
//           <ul>
//             {item.path.map((coords, idx) => (
//               <li key={idx}>[ {coords[0]}, {coords[1]} ]</li>
//             ))}
//           </ul>
//           <ul>
//             {item.timestamps.map((timestamp, idx) => (
//               <li key={idx}>{timestamp}</li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// }


// export default SCTrain;
