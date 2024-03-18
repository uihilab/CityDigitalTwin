import React, { useState } from "react";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";
import { Deck } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import {ScenegraphLayer} from "@deck.gl/mesh-layers";
import Switch from "@mui/material/Switch";

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=beta`;
let map = null;
let overlay = null;
function Map3D() {
  const [loadPowerPlants, setPowerPlants] = useState(false);

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

  async function loadHighways() {
    const response = await fetch("/data/highway_waterloo.geojson");
    const data = await response.json();
    const layer = new GeoJsonLayer({
      id: "highways-layer",
      data,
    });
    return layer;
  }

  function loadTruck() {
    return new ScenegraphLayer({
      id: "truck",
      data: "/data/test.json",
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
    const highways = await loadHighways();
    const trucks = loadTruck();
    // Create overlay instance
    overlay = new DeckOverlay({
      layers: [layerPower, highways, trucks],
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
    <div>
      <button onClick={loadMap}>Load Map</button>
      <Switch checked={loadPowerPlants} onChange={() => loadPowerPlantsLayer()} />
      <div id="map" style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}

export default Map3D;
