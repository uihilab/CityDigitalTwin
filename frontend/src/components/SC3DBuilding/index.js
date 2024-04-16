<<<<<<< Updated upstream
import React, { useState, useEffect, useMemo, StrictMode } from "react";
import DeckGL from "@deck.gl/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
=======
import React, { useState, useEffect, useMemo } from "react";
import { GoogleMapsOverlay, GoogleMapsOverlayProps } from "@deck.gl/google-maps";
import { Deck, DeckProps } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
>>>>>>> Stashed changes
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";

import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";
<<<<<<< Updated upstream

function Map3D() {
  const maplayersTestData = [
    new ScatterplotLayer({
      id: "deckgl-circle",
      data: [{ position: [-92.3452489, 42.4935949] }],
      getPosition: (d) => d.position,
      getFillColor: [255, 0, 0, 100],
      getRadius: 100,
    }),
  ];
=======
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=beta`;
>>>>>>> Stashed changes

function Map3D() {
  const map = useMap();
  const overlay = useMemo(() => new GoogleMapsOverlay());
  
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, transparentSidenav, darkMode } = controller;
  const [activeItems, setActiveItems] = useState(new Array(layers.length).fill(false));
<<<<<<< Updated upstream
  const [mapLayers, setMapLayers] = useState(maplayersTestData);
=======
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    async function initializeMap() {
      if (mapLoaded) return; // Map already loaded, no need to reload
      
      setMapLoaded(true);
    }
    initializeMap();
    // Cleanup function
    return () => {
      // Perform cleanup if necessary
    };
  }, [mapLoaded]);

  function loadScript(url) {
    if (typeof google !== "undefined") {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.onload = resolve;
      script.onerror = reject; // Handle script loading error
      document.head.appendChild(script);
    });
  }

  async function loadMap() {
    const container = document.getElementById("map");
    await loadScript(GOOGLE_MAPS_API_URL);
    map = new google.maps.Map(container, {
      center: { lng: -92.3452489, lat: 42.4935949 }, //-92.3452489,42.4935949
      zoom: 19,
      heading: 0,
      tilt: 45,
      isFractionalZoomEnabled: true,
      mapId: GOOGLE_MAP_ID,
      mapTypeControlOptions: {
        mapTypeIds: ["roadmap", "terrain"],
      },
      streetViewControl: false,
    });
    // map.moveCamera({
    //   center: new google.maps.LatLng(37.7893719, -122.3942),
    //   zoom: 16,
    //   heading: 320,
    //   tilt: 15
    // });
  }
>>>>>>> Stashed changes

  async function loadJsonData(url) {
    const response = await fetch(url);
    return response.json();
  }

  async function loadGeoJsonLayer(id, data) {
    const layer = new GeoJsonLayer({
      id,
      data,
    });
    return layer;
  }

  function loadTruck(data) {
    return new ScenegraphLayer({
      id: "truck",
      data, // "/data/test.json",
      scenegraph: "/data/CesiumMilkTruck.glb",
      sizeScale: 2,
      getPosition: (d) => d.coordinates,
      getTranslation: [0, 0, 1],
      getOrientation: (d) => [0, 180, 90],
      _lighting: "pbr",
    });
  }

  async function loadLayer(key, dataPath) {
    const jsonData = await loadJsonData(dataPath);
    const layer = await loadGeoJsonLayer(key, jsonData);
    const newLayers = mapLayers.slice();
    newLayers.push(layer);
    setMapLayers(newLayers);
  }

  async function loadPowerPlantData() {
    const response = await fetch("/data/PowerPlants.json");
    const data = await response.json();
    const layerPower = new GeoJsonLayer({
      id: "powerplant-layer",
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      pointType: "circle",
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [0, 160, 180, 200],
      // getLineColor: d => colorToRGBArray(d.properties.color),
      getPointRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
    });

    const highwayData = await loadJsonData("/data/highway_waterloo.geojson");
    const layerHighways = await loadGeoJsonLayer("highway-layer", highwayData);

    const targetRoadId = "w15820550"; // Replace with your desired road name


    const specificRoadFeatures = highwayData.features.filter(
      (feature) => feature.properties.full_id === targetRoadId
    );
    const coords = specificRoadFeatures[0].geometry.coordinates;

    const truckData = [{ coordinates: coords[0] }];

<<<<<<< Updated upstream
=======
    var truckData = [{ "coordinates": coords[0] }];

>>>>>>> Stashed changes
    const layerTruck = loadTruck(truckData);

    const testLayers = [layerPower, layerHighways, layerTruck];
    setMapLayers(testLayers);
  }

<<<<<<< Updated upstream
  function checkLayerExists(layerName) {
    const foundIndex = mapLayers.findIndex((x) => x.id === layerName);
    return foundIndex;
  }

  function removeLayer(layerName) {
    const foundIndex = checkLayerExists(layerName);
    if (foundIndex > -1) {
      //mapLayers[foundIndex].visible = false;
      mapLayers.splice(foundIndex, 1);
      const newLayers = mapLayers.slice();
      setMapLayers(newLayers);
      // overlay.setProps({ layers: mapLayers });
      // overlay.setMap(null);
      // overlay.setMap(map);
    }
  }

  async function layerLinkHandler(key, isActive, dataPath) {
    if (isActive) {
      await loadLayer(key, dataPath);
    } else {
      removeLayer(key);
    }
=======
  async function loadPowerPlantsLayer() {
    await loadPowerPlantData();
  }

  function removeLayer(layerName) {
    debugger;
    let foundIndex = checkLayerExists(layerName)
    if(foundIndex>-1)
    {
      debugger;
      overlay.props.layers[foundIndex].finalizeState();
      overlay.props.layers.splice(foundIndex, 1);
      const copy = overlay.props.layers.splice();
      overlay.setProps(copy);
      //overlay.setMap(map);
    }
  }

  function checkLayerExists(layerName)
  {
    let foundIndex = overlay.props.layers.findIndex(x => x.id === layerName);
    return foundIndex;
    if (foundIndex > -1) {
        return true;
    }
    else{
      return false;
    }
  }

  function layerLinkHandler(key, isActive) {
    console.log(key, isActive);
    if (key === "Electricgrid") {
      if (isActive === true) {
        console.log("Power plant katmanı yüklendi");
      }
      else {
        console.log("Power plant katmanı kaldırıldı");
      }
    }
    else if (key === "AQuality") {
      if (isActive === true) {
        console.log("AQuality katmanı yüklendi");
      }
      else {

      }
    }
    else if (key === "Waterlevels") {
      if (isActive === true) {
        console.log("Waterlevels katmanı yüklendi");
      }
      else {

      }
    }
    else if (key === "TranspMobility") {
      if (isActive === true) {
        console.log("TranspMobility katmanı yüklendi");
      }
      else {

      }
    }
    else if (key === "RoadNetworks") {
      if (isActive === true) {
        console.log("RoadNetworks katmanı yüklendi");
        loadPowerPlantsLayer();
      }
      else {
        console.log("RoadNetworks katmanı kaldırıldı");
        removeLayer("highway-layer");
        return;

        if (overlay.props.layers) {
          let highwayLayerIndex = -1;
          // Katmanların her birini kontrol et ve "highway-layer" ID'ye sahip olanı bul
          for (let i = 0; i < overlay.props.layers.length; i++) {
            if (overlay.props.layers[i].id === "highway-layer") {
              highwayLayerIndex = i;
              break;
            }
          }
          if (highwayLayerIndex !== -1) {
            overlay.props.layers.splice(highwayLayerIndex, 1); // `layerHighways` katmanını dizi içinden çıkar
            const deck = new Deck({
              initialViewState: {
                longitude: -92.3452489,
                latitude: 42.4935949,
                zoom: 19,
                pitch: 45,
                bearing: 0
              },
              controller: true,
              layers: overlay.layers // Güncellenmiş katmanlarla Deck nesnesini oluşturun
            });
            deck.setProps({ layers: overlay.layers }); // Güncellenmiş katmanlarla Deck nesnesini ayarlayın
            loadMap();
          }
          else {
            console.log("Overlay layers not found or empty");
            debugger;
            overlay.props.layers.splice(1, 0, "highway-layer"); // `layerHighways` katmanını dizi içine sokar. 
            const deck = new Deck({
              initialViewState: {
                longitude: -92.3452489,
                latitude: 42.4935949,
                zoom: 19,
                pitch: 45,
                bearing: 0
              },
              controller: true,
              layers: overlay.layers // Güncellenmiş katmanlarla Deck nesnesini oluşturun
            });
            deck.setProps({ layers: overlay.layers }); // Güncellenmiş katmanlarla Deck nesnesini ayarlayın
            loadMap();
          }
        }
      }
    }
    else if (key === "PublicTransitRoutes") {
      if (isActive === true) {
        console.log("PublicTransitRoutes katmanı yüklendi");
      }
      else {
        overlay.layers.splice(1, 1);
        overlay.props.layers.removeLayer(layerHighways);
        overlay.redraw(); // Haritayı yeniden çiz
      }
    }
    else if (key === "TrafficFlow") {
      if (isActive === true) {
        console.log("TrafficFlow katmanı yüklendi");
      }
      else {

      }
    }
    else if (key === "TransEvents") {
      if (isActive === true) {
        console.log("TransEvents katmanı yüklendi");
      }
      else {

      }
    }

>>>>>>> Stashed changes
  }

  const mydesignLayers = layers.filter((layer) => layer.type === "mydesign");

  mydesignLayers.forEach((element) => {
    element.clickFunc = layerLinkHandler;
  });

  return (
    <>
      <Sidenav
        color={sidenavColor}
        brand={transparentSidenav && !darkMode}
        brandName="Waterloo"
        routes={layers}
        activeItems={activeItems}
        setActiveItems={setActiveItems}
      />
      <div>
<<<<<<< Updated upstream
        <div id="map" style={{ width: "100%", height: "100vh" }}>
          <StrictMode>
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <DeckGL
                initialViewState={{
                  longitude: -92.3452489,
                  latitude: 42.4935949,
                  zoom: 19,
                  heading: 0,
                  pitch: 45,
                }}
                controller
                layers={mapLayers}
              >
                <Map mapId={GOOGLE_MAP_ID} />
              </DeckGL>
            </APIProvider>
          </StrictMode>
        </div>
=======
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
    <Map
      defaultCenter={{lat: 51.47, lng: 0.45}}
      defaultZoom={11}
      mapId={mapId} >
      <DeckGLOverlay layers={layers} />
    </Map>
  </APIProvider>
        <div id="map" style={{ width: "100%", height: "100vh" }} />
>>>>>>> Stashed changes
      </div>
    </>
  );
}

export default Map3D;
