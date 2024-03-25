import React, { useState } from "react";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";
import { Deck } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import {ScenegraphLayer} from "@deck.gl/mesh-layers";
import Switch from "@mui/material/Switch";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=beta`;
let map = null;
let overlay = null;
function Map3D() {
  const [loadPowerPlants, setPowerPlants] = useState(false);

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
      id: id,
      data,
    });
    return layer;
  }

  function loadTruck(data) {
    return new ScenegraphLayer({
      id: "truck",
      data: data,//"/data/test.json",
      scenegraph: "/data/CesiumMilkTruck.glb",
      sizeScale: 2,
      getPosition: (d) => d.coordinates,
      getTranslation: [0, 0, 1],
      getOrientation: (d) => [0, 180, 90],
      _lighting: "pbr",
    });
  }

  async function loadPowerPlantData() {
    const response = await fetch("/data/PowerPlants.json");
    const data = await response.json();
    const layerPower = new GeoJsonLayer({
      id: "geojson-layer",
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      pointType: "circle",
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [0, 160, 180, 200],
      //getLineColor: d => colorToRGBArray(d.properties.color),
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
    var coords = specificRoadFeatures[0].geometry.coordinates;

    var truckData = [{"coordinates":coords[0]}];
    debugger;
    const layerTruck = loadTruck(truckData);

    // Create overlay instance
    overlay = new DeckOverlay({
      layers: [layerPower, layerHighways, layerTruck],
    });
    //overlay.props.layers.push(layerPower);
    overlay.setMap(map);
  }

  async function loadPowerPlantsLayer() {
    if (!loadPowerPlants) {
      await loadPowerPlantData();
    } else {
      overlay.setMap(null);
      overlay.finalize();
    }
    setPowerPlants(!loadPowerPlants);
  }
  //
  return (
    <>
      <Sidenav
        color={sidenavColor}
        brand={transparentSidenav && !darkMode}
        brandName="Waterloo"
        routes={layers}
      />
      <div>
        <button onClick={loadMap}>Load Map</button>
        <Switch checked={loadPowerPlants} onChange={() => loadPowerPlantsLayer()} />
        <div id="map" style={{ width: "100%", height: "100vh" }} />
      </div>
    </>
  );
}

export default Map3D;
