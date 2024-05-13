import React, { useState, useEffect, useMemo, StrictMode } from "react";
import DeckGL from "@deck.gl/react";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";
import { IconLayer } from "@deck.gl/layers";
import { loadFilteredGeoJsonData, LoadAndFilterLayer } from "/Users/sumeyye/Documents/GitHub/SmartCity/frontend/src/components/SCHighway/index";
import { getTrafficEventData, convertToMarkers } from "/Users/sumeyye/Documents/GitHub/SmartCity/frontend/src/components/SCEvents/TrafficEvent";
import { renderAirQualityChart, FetchAirQuality } from "/Users/sumeyye/Documents/GitHub/SmartCity/frontend/src/components/SCAQ/index";
import Popup from './Popup';
import { createStruct, createStationsStruct, getTrainData, getTrainStationsData } from "/Users/sumeyye/Documents/GitHub/SmartCity/frontend/src/components/SCTrain/AmtrakData";

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";

function Map3D() {
  const mydesignLayers = layers.filter((layer) => layer.type === "mydesign");
  // Haritada tıklama olayını dinleyen fonksiyon
  const handleMapClick = (event) => {
    debugger;
    const isAQualityActive = activeItems[layers.findIndex(item => item.key === "AQuality")];
    if (isAQualityActive) {
      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      setClickPosition({ x: latitude, y: longitude });

      FetchAirQuality(latitude, longitude)
        .then(airQualityData => {
          renderAirQualityChart(airQualityData);
        })
        .catch(error => {
          console.error("Hava kalitesi verileri alınırken bir hata oluştu:", error);
        });
    }
  };


  const initialState = {
    electricGrid: false,
    transEvents: false,
    publicTransitRoutes: false
  };

  const maplayersTestData = [
  ];

  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, transparentSidenav, darkMode } = controller;
  const [activeItems, setActiveItems] = useState(new Array(layers.length).fill(false));
  const [mapLayers, setMapLayers] = useState(maplayersTestData);

  const [clickPosition, setClickPosition] = useState({ x: null, y: null });
  const [clickedObject, setClickedObject] = useState(null);
  const [checkboxState, setCheckboxState] = useState(initialState);
  const [isRouteCheckboxMenuOpen, setIsRouteCheckboxMenuOpen] = useState(false);
  const [isHighwayCheckboxMenuOpen, setIsHighwayCheckboxMenuOpen] = useState(false);
  const [selectedHighway, setSelectedHighway] = useState(null);

  const data = getTrafficEventData();
  // DeckGL ScatterplotLayer
  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data,
    getPosition: d => d.position,
    getFillColor: [255, 0, 0],
    getRadius: 100,
  });


  async function loadJsonData(url) {
    debugger;
    const response = await fetch(url);
    return response.json();
  }

  async function CreateGeoJsonLayer(id, data) {
    debugger;
    const layer = new GeoJsonLayer({
      id,
      data,
      lineWidthMinPixels: 2, // Opsiyonel: çizgi kalınlığını belirle
      lineWidthMaxPixels: 5, // Opsiyonel: çizgi kalınlığını belirle
    });
    return layer;
  }

  async function CreateColourfulGeoJsonLayer(id, data, color) {
    debugger;
    const layer = new GeoJsonLayer({
      id,
      data,
      getLineColor: color, // Çizgi rengini belirle
      lineWidthMinPixels: 2, // Opsiyonel: çizgi kalınlığını belirle
      lineWidthMaxPixels: 5, // Opsiyonel: çizgi kalınlığını belirle
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
    debugger;
    const jsonData = await loadJsonData(dataPath);
    const layer = await CreateGeoJsonLayer(key, jsonData);
    const newLayers = mapLayers.slice();
    newLayers.push(layer);
    setMapLayers(newLayers);
  }

  async function loadLayerwithData(key, jsonData) {
    const layer = await CreateGeoJsonLayer(key, jsonData);
    const newLayers = mapLayers.slice();
    newLayers.push(layer);
    setMapLayers(newLayers);
  }
  async function loadColourfulLayerwithData(key, jsonData, color) {
    const layer = await CreateColourfulGeoJsonLayer(key, jsonData, color);
    const newLayers = mapLayers.slice();
    newLayers.push(layer);
    setMapLayers(newLayers);
  }

  async function loadLayerwithLayer(layer) {
    const newLayers = mapLayers.slice();
    newLayers.push(layer);
    setMapLayers(newLayers);
  }

  async function BuildingLayer() {
    const response = await fetch("/data/waterloo_buildings.geojson");
    const data = await response.json();

    debugger;
    var filteredData = data.features.filter(feature => feature.properties && feature.properties.building);

    const layerBuilding = new GeoJsonLayer({
      id: "Buildings",
      data: filteredData,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [140, 170, 180, 200],
      getLineColor: [0, 0, 0],
      getLineWidth: 1,
      getElevation: 30,
      onHover: ({ object, x, y }) => {
      }
    });

    const newLayers = mapLayers.slice();
    newLayers.push(layerBuilding);
    setMapLayers(newLayers);

  }

  async function loadPowerPlantData() {
    const response = await fetch("/data/PowerPlants.json");
    const data = await response.json();
    const layerPower = new GeoJsonLayer({
      id: "Electricgrid",
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

    const newLayers = mapLayers.slice();
    newLayers.push(layerPower);
    setMapLayers(newLayers);
  }

  const [hoverInfo, setHoverInfo] = useState({});
  const expandTooltip = (info) => {
    if (info.picked && true) {
      setHoverInfo(info);
    } else {
      setHoverInfo({});
    }
  };

  async function loadTransportationEvents() {

    try {
      const trafficEventData = await getTrafficEventData();

      const layerEvent = new IconLayer({
        id: 'TransEvents',
        data: trafficEventData,
        pickable: true,
        iconAtlas: 'data/location-icon-atlas.png', // Replace with the path to your icon atlas
        iconMapping: 'data/location-icon-mapping.json',
        getIcon: d => 'marker',
        sizeScale: 1,
        getPosition: d => d.coordinates,
        getSize: d => 50,
        getColor: d => [255, 255, 255],
        getAngle: d => 0,
        onClick: info => {
          expandTooltip(info)
        }
      })

      loadLayerwithLayer(layerEvent);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  }

  const CheckboxLayerEvent = ({ handleCheckboxChange, checkboxState }) => {
    return (
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        padding: "10px",
        boxSizing: "border-box",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 999,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '5px'
      }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="Train"
            checked={checkboxState.electricGrid}
            onChange={handleCheckboxChange}
          />
          Train Stations and Amtract Train Routes
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="Bus"
            checked={checkboxState.transEvents}
            onChange={handleCheckboxChange}
          />
          Bus stops and routes
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            name="Tram"
            checked={checkboxState.publicTransitRoutes}
            onChange={handleCheckboxChange}
          />
          Tram stops and routes
        </label>
      </div>
    );
  };

  const CheckboxLayerHighway = ({ handleCheckboxChange, checkboxState }) => {
    return (
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        padding: "10px",
        boxSizing: "border-box",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 999,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '5px'
      }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="primary"
            checked={checkboxState.primary}
            onChange={handleCheckboxChange}
          />
          Primary
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="secondary"
            checked={checkboxState.secondary}
            onChange={handleCheckboxChange}
          />
          Secondary
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="residential"
            checked={checkboxState.residential}
            onChange={handleCheckboxChange}
          />
          Residential
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="service"
            checked={checkboxState.service}
            onChange={handleCheckboxChange}
          />
          Service
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="motorway"
            checked={checkboxState.motorway}
            onChange={handleCheckboxChange}
          />
          Motorway
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="cycleway"
            checked={checkboxState.cycleway}
            onChange={handleCheckboxChange}
          />
          Cycleway
        </label>
      </div>
    );
  };
  function checkLayerExists(layerName) {
    const foundIndex = mapLayers.findIndex((x) => x.id === layerName);
    return foundIndex;
  }

  function removeLayer(layerName) {
    const foundIndex = checkLayerExists(layerName);
    if (foundIndex > -1) {
      mapLayers.splice(foundIndex, 1);
      const newLayers = mapLayers.slice();
      setMapLayers(newLayers);
    }
  }

  // Checkbox durumlarını güncellemek için bir fonksiyon
  const handleCheckboxChange = async (event) => {
    const { name, checked } = event.target;

    setCheckboxState(prevState => ({
      ...prevState,
      [name]: checked
    }));

    if (checked && name == 'Train') {

      const data = await getTrainStationsData();
      // Tren istasyonlarının veri yapısını oluştur
      const stationsStruct = createStationsStruct(data);

      const trainStationsLayer = new ScatterplotLayer({
        data: stationsStruct,
        getPosition: d => d.path,
        getRadius: 1,
        getLineColor: [255, 0, 0],
      });

      debugger;
      loadLayerwithLayer(trainStationsLayer);
    }

    if (checked && name == 'primary') {
      var data_primary = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "primary");
      var primary_link = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "primary_link");

      // Verileri birleştir
      const combinedData = data_primary.concat(primary_link);

      // Yol çizgilerine özgü renk belirleme
      const color = [255, 0, 0]; // Örneğin kırmızı renk
      loadColourfulLayerwithData("primary", combinedData, color);
      debugger;
    }

    if (checked && name == 'secondary') {
      var data_secondary = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "secondary");
      // Yol çizgilerine özgü renk belirleme
      const color = [0, 0, 255]; // mavi renk
      loadColourfulLayerwithData("secondary", data_secondary, color);
      debugger;
    }

    if (checked && name == 'residential') {
      var data_residential = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "residential");
      // Yol çizgilerine özgü renk belirleme
      const color = [95, 95, 95]; // koyu gri
      loadColourfulLayerwithData("residential", data_residential, color);
      debugger;
    }

    if (checked && name == 'service') {
      var data_service = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "service");
      // Yol çizgilerine özgü renk belirleme
      const color = [190, 190, 190]; // Gri renk 
      loadColourfulLayerwithData("service", data_service, color);
      debugger;
    }

    if (checked && name == 'motorway') {
      var data_motorway_link = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "motorway_link");
      var data_motorway = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "motorway");
      // Yol çizgilerine özgü renk belirleme

      // Verileri birleştir
      const combinedData = data_motorway_link.concat(data_motorway);


      const color = [80, 80, 80]; // Gri renk 
      loadColourfulLayerwithData("motorway", combinedData, color);
      debugger;
    }

    if (checked && name == 'cycleway') {
      var data_cycleway = await loadFilteredGeoJsonData("/data/highway_waterloo.geojson", "cycleway");
      // Yol çizgilerine özgü renk belirleme
      const color = [255, 0, 0]; // Gri renk 
      loadColourfulLayerwithData("cycleway", data_cycleway, color);
      debugger;
    }


    if (!checked && name == 'primary') {
      removeLayer("primary");
      debugger;
    }
    if (!checked && name == 'secondary') {
      removeLayer("secondary");
      debugger;
    }

    if (!checked && name == 'residential') {
      removeLayer("residential");
      debugger;
    }

    if (!checked && name == 'service') {
      removeLayer("service");
      debugger;
    }

    if (!checked && name == 'motorway') {
      removeLayer("motorway_link");
      removeLayer("motorway")
      debugger;
    }

    if (!checked && name == 'cycleway') {
      removeLayer("cycleway")
      debugger;
    }
  }
  // PublicTransitRoutes linkine tıklandığında checkbox menüsünü açacak fonksiyon
  const handlePublicTransitRoutesClick = (open) => {
    setIsRouteCheckboxMenuOpen(open);
  };

  const handleHighwayClick = (open) => {
    setIsHighwayCheckboxMenuOpen(open);
    removeLayer("primary");
  };


  async function layerLinkHandler(key, isActive, dataPath) {

    if (isActive) {
      if (key == "Electricgrid") {
        await loadPowerPlantData();
        return;
      }
      if (key == "TransEvents") {
        await loadTransportationEvents();
        return;
      }
      if (key == "Buildings") {
        await BuildingLayer();
        return;
      }
      if (key == "AQuality") {
        const AQualiy = await FetchAirQuality();
        await renderAirQualityChart(AQualiy);
        return;
      }

      if (key == "PublicTransitRoutes" && isRouteCheckboxMenuOpen == false) {
        debugger;
        handlePublicTransitRoutesClick(true);
        return;
      }

      if (key == "RoadNetworks" && isHighwayCheckboxMenuOpen == false) {
        debugger;
        handleHighwayClick(true);
        checkboxState.primary = false;
        checkboxState.secondary = false;
        checkboxState.residential = false;
        checkboxState.service = false;
        checkboxState.motorway = false;
        checkboxState.cycleway = false;
        return;
      }
      await loadLayer(key, dataPath);

    } else {

      debugger;
      if (isRouteCheckboxMenuOpen == true) {
        debugger;
        handlePublicTransitRoutesClick(false);
        return;
      }
      if (isHighwayCheckboxMenuOpen == true) {
        debugger;
        handleHighwayClick(false);
        removeLayer("primary");
        removeLayer("secondary");
        removeLayer("residential");
        removeLayer("service");
        removeLayer("motorway_link");
        removeLayer("motorway");
        removeLayer("cycleway");
        return;
      }
      removeLayer(key);
      if (key === "AQuality") {
        const canvas = document.getElementById('airQualityCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    }
  }

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
      <div id="checkbox-area" style={{ width: "100%", height: "10vh" }}>
        {/* CheckboxLayer bileşeni sadece isCheckboxMenuOpen true olduğunda */}
        {isRouteCheckboxMenuOpen && (

          <CheckboxLayerEvent handleCheckboxChange={handleCheckboxChange} checkboxState={checkboxState} />
        )}
      </div>
      <div id="checkbox-area" style={{ width: "100%", height: "10vh" }}>
        {/* CheckboxLayer bileşeni sadece isCheckboxMenuOpen true olduğunda */}
        {isHighwayCheckboxMenuOpen && (

          <CheckboxLayerHighway handleCheckboxChange={handleCheckboxChange} checkboxState={checkboxState} />
        )}
      </div>
      <div id="map" style={{ width: "100%", height: "90vh" }}>
        <StrictMode>
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <DeckGL
              initialViewState={{
                longitude: -92.345,
                latitude: 42.4939,
                zoom: 19,
                heading: 1,
                pitch: 45,
              }}
              onClick={handleMapClick}
              controller
              layers={[mapLayers, scatterplotLayer]}
              getTooltip={({ object }) => {
                if (object) {
                  if (object.properties && object.properties.building === "yes") {
                    return "building";
                  }
                  else if (object.properties && object.properties.building !== "yes" && object.properties && object.properties.building !==null ) {
                    return object.properties && object.properties.building;
                  }
                  else if(`${object.name}` != undefined)
                  {
                    return `${object.name}`;
                  }

                }
               // object && (`${object.properties.building}` || `${object.name}`)
              }
              }
            >
              <Map mapId={GOOGLE_MAP_ID} />
              {/* Canvas */}
              <canvas id="airQualityCanvas" style={{ position: "absolute", bottom: 10, left: 10, zIndex: 1, width: 100, height: 100, pointerEvents: "yes", opacity: 0.5, padding: 10 }}></canvas>
              <div>
                {/* {hoverInfo && renderTooltip(hoverInfo)} */}
                <Popup clickPosition={clickPosition} object={clickedObject} />
              </div>
            </DeckGL>
          </APIProvider>
        </StrictMode>
      </div>
    </>
  );
}

export default Map3D;