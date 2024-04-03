import React, { useState } from "react";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";
import { Deck } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import Switch from "@mui/material/Switch";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";
import { forEach } from "@loaders.gl/core";

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";

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

  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [activeItems, setActiveItems] = useState(new Array(layers.length).fill(false));

  function loadScript(url) {
    if (typeof google !== "undefined") {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.onload = resolve;
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

    var truckData = [{ "coordinates": coords[0] }];
    debugger;
    const layerTruck = loadTruck(truckData);

    // Create overlay instance
    overlay = new DeckOverlay({
      layers: [layerPower, layerHighways, layerTruck], //
    });
    //overlay.props.layers.push(layerPower);
    overlay.setMap(map);
  }

  async function layerLinkHandler(key, isActive, dataPath) {
    if (isActive) {
      await loadLayer(key, dataPath);
    } else {
      removeLayer(key);
    }
    setPowerPlants(!loadPowerPlants);
  }
  function layerLinkHandler(key, isActive) {
    console.log(key, isActive);
    if (key === "Electricgrid") {
      if (isActive === true) {
        console.log("Power plant katmanı yüklendi");
        loadPowerPlantsLayer();
      }
      else {
        overlayPower.setMap(null);
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
      }
      else {

      }
    }
    else if (key === "PublicTransitRoutes") {
      if (isActive === true) {
        console.log("PublicTransitRoutes katmanı yüklendi");
      }
      else {

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

  }

  const mydesignLayers = layers.filter(layer => layer.type === "mydesign");

  mydesignLayers.forEach(element => {
    element.clickFunc = layerLinkHandler;
  })


  return (
    <>
      <Sidenav
        color={sidenavColor}
        brand={transparentSidenav && !darkMode}
        brandName="Waterloo"
        routes={layers}
        activeItems={activeItems} setActiveItems={setActiveItems}
      />
      <div>
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
      </div>
    </>
  );
}

export default Map3D;
