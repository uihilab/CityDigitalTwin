import React, { useState, useEffect, useRef, StrictMode } from "react";
import { DeckGL } from "@deck.gl/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";
import { IconLayer } from "@deck.gl/layers";
import { loadFilteredGeoJsonData, LoadAndFilterLayer } from "../SCHighway/index";
import { getTrafficEventData, convertToMarkers } from "../SCEvents/TrafficEvent";
import { renderAirQualityChart, FetchAirQuality } from "../SCAQ/index";
import { createWeatherIconLayer } from "../SCWeather/Weather";
import Popup from './Popup';
import { createStruct, createStationsStruct, getTrainData, getTrainStationsData } from "../SCTrain/AmtrakData";
import { DroughtLayer, FetchDroughtData } from "../SCDrought/index";
import { ElectricgridLayer } from "../SCElectric/index"
import { fetchDataFromApis, drawBlackHawkCounty, isPointInsidePolygon, handleButtonClick, useChartData } from "components/SCDemographicData"
import { BuildingLayer } from "../SCBuilding/layerBuilding"
import { startTrafficSimulator } from "components/TrafficSimulator";
import { getFloodLayer } from "../SCFlood";
import { point, polygon } from '@turf/helpers';
import { Bar } from 'react-chartjs-2';
import { getWellData, createWellLayer } from "../SCWell/well";
import { fetchRailwayData, CreateRailwayLayer } from "../SCRailway/index";

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";

function Map3D() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [menuContent, setMenuContent] = useState("Loading");
  const [countyName, setCountyName] = useState("Black Hawk County");
  const [showBackButton, setShowBackButton] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [wellData, setWellData] = useState([]);
  const [railwayData, setrailwayData] = useState([]);
  const [clickPosition, setClickPosition] = useState({ x: null, y: null });
  const [clickedObject, setClickedObject] = useState(null);

  // Haritada tıklama olayını dinleyen fonksiyon
  const handleMapClick = async (event) => {
    debugger;
    const isAQualityActive = activeItems[layers.findIndex(item => item.key === "AQuality")];
    const isWeatherActive = activeItems[layers.findIndex(item => item.key === "WForecast")];
    const isDemographicActive = activeItems[layers.findIndex(item => item.key === "DemographicHousingData")];
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

    if (isDemographicActive) {
      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      //setClickPosition({ x: latitude, y: longitude });

      const blackHawkCountyBorder = [
        { lat: 42.642729, lng: -92.508407 },
        { lat: 42.299418, lng: -92.482915 },
        { lat: 42.299418, lng: -92.060234 },
        { lat: 42.642729, lng: -92.060234 },
        { lat: 42.642729, lng: -92.508407 }
      ];

      const poly = polygon([blackHawkCountyBorder]);
      const pt = point([latitude, longitude]);
      const in_or_out = isPointInsidePolygon(pt, poly);

      if (in_or_out) {
        debugger;
        setIsMenuOpen(true);
        const data = await fetchDataFromApis();
        setMenuContent(`Populations and People: ${data.source4.data0} \n Medium Age: ${data.source1.data0} \n Over Age 64: ${data.source2.data0}% \n Number of Employment: ${data.source5.data0} \n  Household median income: ${data.source6.data0}\nPoverty: ${data.source3.data0}%`);
        //setCountyName(data.source1.location);
        setIsChartVisible(false);
      }

    }
    if (isWeatherActive) {
      removeLayer(WeathericonLayer.id);
      setMapLayers(null);
      debugger;
      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      setClickPosition({ x: latitude, y: longitude });
      try {
        // Hava durumu verilerini kullanarak iconları haritaya ekle
        const layer = await createWeatherIconLayer(latitude, longitude, 3);
        setWeatherIconLayer(layer);
        setMapLayers(layer);


      } catch (error) {
        console.error('Error in handleMapClick:', error);
      }
    }
  };

  const initialState = {
    electricGrid: false,
    transEvents: false,
    publicTransitRoutes: false
  };

  const maplayersTestData = [
  ];

  const [viewport, setViewport] = useState({
    longitude: -92.345,
    latitude: 42.4937,
    zoom: 19,
    heading: 1,
    pitch: 45
  });

  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  //Deck element reference to pass and use in animation or other sub components.
  const deckRef = useRef(null);
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, transparentSidenav, darkMode } = controller;
  const [activeItems, setActiveItems] = useState(new Array(layers.length).fill(false));
  const [mapLayers, setMapLayersState] = useState(maplayersTestData);
  const [WeathericonLayer, setWeatherIconLayer] = useState(null);
  const [BlackHawkLayer, setBlackHawkLayer] = useState(null);
  const [layersStatic, setLayersStatic] = useState([]);


  function setMapLayers(newLayers) {
    debugger;
    layersStatic.push(newLayers);
    setLayersStatic(layersStatic);
    const layersCopy = layersStatic.slice();
    //layersCopy.push(layersAnimation);
    setMapLayersState(layersCopy);
  }

  function setAnimationLayers(animationLayers) {
    const allLayers = [];
    //setLayersAnimation(animationLayers);
    allLayers.push(animationLayers);
    const layersCopy = layersStatic.slice();
    allLayers.push(layersCopy);
    setMapLayersState(allLayers);
  }

  function checkLayerExists(layerName) {
    const foundIndex = layersStatic.findIndex((x) => x && x.id === layerName);
    debugger;
    return foundIndex;
  }

  function removeLayer(layerName) {
    debugger;
    const foundIndex = checkLayerExists(layerName);
    if (foundIndex > -1) {
      layersStatic.splice(foundIndex, 1);
      const newLayers = layersStatic.slice();
      setMapLayers(newLayers);
    }
  }

  const [checkboxState, setCheckboxState] = useState(initialState);
  const [isRouteCheckboxMenuOpen, setIsRouteCheckboxMenuOpen] = useState(false);
  const [isHighwayCheckboxMenuOpen, setIsHighwayCheckboxMenuOpen] = useState(false);

  async function loadJsonData(url) {
    const response = await fetch(url);
    return response.json();
  }

  async function CreateGeoJsonLayer(id, data) {
    const layer = new GeoJsonLayer({
      id,
      data,
      lineWidthMinPixels: 2, // Opsiyonel: çizgi kalınlığını belirle
      lineWidthMaxPixels: 5, // Opsiyonel: çizgi kalınlığını belirle
    });
    return layer;
  }

  async function CreateColourfulGeoJsonLayer(id, data, color) {
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
      data, // "./data/test.json",
      scenegraph: "./data/CesiumMilkTruck.glb",
      sizeScale: 2,
      getPosition: (d) => d.coordinates,
      getTranslation: [0, 0, 1],
      getOrientation: (d) => [0, 180, 90],
      _lighting: "pbr",
    });
  }

  async function loadLayer(key, dataPath) {
    const jsonData = await loadJsonData(dataPath);
    const layer = await CreateGeoJsonLayer(key, jsonData);
    setMapLayers(layer);
  }

  async function loadLayerwithData(key, jsonData) {
    const layer = await CreateGeoJsonLayer(key, jsonData);
    setMapLayers(layer);
  }

  async function loadColourfulLayerwithData(key, jsonData, color) {
    const layer = await CreateColourfulGeoJsonLayer(key, jsonData, color);
    setMapLayers(layer);
  }

  async function loadLayerwithLayer(layer) {
    setMapLayers(layer);
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
  // Checkbox durumlarını güncellemek için bir fonksiyon
  const handleCheckboxChange = async (event) => {
    const { name, checked } = event.target;

    setCheckboxState(prevState => ({
      ...prevState,
      [name]: checked
    }));

    // if (checked && name == 'Train') {

    //   const data = await getTrainStationsData();
    //   // Tren istasyonlarının veri yapısını oluştur
    //   const stationsStruct = createStationsStruct(data);

    //   const trainStationsLayer = new ScatterplotLayer({
    //     data: stationsStruct,
    //     getPosition: d => d.path,
    //     getRadius: 1,
    //     getLineColor: [255, 0, 0],
    //   });

    //   debugger;
    //   loadLayerwithLayer(trainStationsLayer);
    // }

    if (checked && name == 'primary') {
      var data_primary = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "primary");
      var primary_link = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "primary_link");

      // Verileri birleştir
      const combinedData = data_primary.concat(primary_link);

      // Yol çizgilerine özgü renk belirleme
      const color = [255, 0, 0]; // Örneğin kırmızı renk
      loadColourfulLayerwithData("primary", combinedData, color);
    }

    if (checked && name == 'secondary') {
      var data_secondary = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "secondary");
      // Yol çizgilerine özgü renk belirleme
      const color = [0, 0, 255]; // mavi renk
      loadColourfulLayerwithData("secondary", data_secondary, color);
    }

    if (checked && name == 'residential') {
      var data_residential = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "residential");
      // Yol çizgilerine özgü renk belirleme
      const color = [95, 95, 95]; // koyu gri
      loadColourfulLayerwithData("residential", data_residential, color);
    }

    if (checked && name == 'service') {
      var data_service = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "service");
      // Yol çizgilerine özgü renk belirleme
      const color = [190, 190, 190]; // Gri renk 
      loadColourfulLayerwithData("service", data_service, color);
    }

    if (checked && name == 'motorway') {
      var data_motorway_link = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "motorway_link");
      var data_motorway = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "motorway");
      // Yol çizgilerine özgü renk belirleme

      // Verileri birleştir
      const combinedData = data_motorway_link.concat(data_motorway);


      const color = [80, 80, 80]; // Gri renk 
      loadColourfulLayerwithData("motorway", combinedData, color);
    }

    if (checked && name == 'cycleway') {
      var data_cycleway = await loadFilteredGeoJsonData("./data/highway_waterloo.geojson", "cycleway");
      // Yol çizgilerine özgü renk belirleme
      const color = [255, 0, 0]; // Gri renk 
      loadColourfulLayerwithData("cycleway", data_cycleway, color);
    }


    if (!checked && name == 'primary') {
      removeLayer("primary");
    }
    if (!checked && name == 'secondary') {
      removeLayer("secondary");
    }

    if (!checked && name == 'residential') {
      removeLayer("residential");
    }

    if (!checked && name == 'service') {
      removeLayer("service");
    }

    if (!checked && name == 'motorway') {
      removeLayer("motorway_link");
      removeLayer("motorway");
    }

    if (!checked && name == 'cycleway') {
      removeLayer("cycleway");
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

  function getViewPort() {
    return viewport;
  }

  async function layerLinkHandler(key, isActive, dataPath) {
    debugger;
    if (isActive) {
      if (key == "Electricgrid") {
        const layerElectric = await ElectricgridLayer();
        setMapLayers(layerElectric);
        return;
      }
      if (key == "TransEvents") {
        await loadTransportationEvents();
        return;
      }
      if (key == "Buildings") {
        const layerBuilding = await BuildingLayer();
        setMapLayers(layerBuilding);
        return;
      }
      if (key == "Drought") {

        try {
          const drData = await FetchDroughtData();
          if (drData) {
            console.log('Drought Data:', drData);
            const layer = await DroughtLayer(drData);
            await loadLayerwithLayer(layer);

          } else {
            console.error('No data returned from Drought function');
          }
        } catch (error) {
          console.error('Error loading drought data:', error);
        }
      }

      if (key == "Flood") {
        var floodLayer = await getFloodLayer();
        setMapLayers(floodLayer);
        return;
      }
      if (key == "AQuality") {
        const AQualiy = await FetchAirQuality();
        await renderAirQualityChart(AQualiy);
        return;
      }
      if (key == "WForecast") {
        removeLayer(WeathericonLayer);
        const layer = await createWeatherIconLayer(42.569663, -92.479646, 3);
        setWeatherIconLayer(layer);
        setMapLayers(layer);
        return;
      }
      if (key == "DemographicHousingData") {
        const layer = await drawBlackHawkCounty();
        setIsMenuOpen(true);
        const data = await fetchDataFromApis();
        setBlackHawkLayer(layer);

        //setCountyName(data.source1.location);
        setMenuContent(`Populations and People: ${data.source4.data0} \n Medium Age: ${data.source1.data0} \n Over Age 64: ${data.source2.data0}% \n Number of Employment: ${data.source5.data0} \n  Household median income: ${data.source6.data0}\nPoverty: ${data.source3.data0}%`);
        setMapLayers(layer);
        //const data= await fetchDataFromApis();
        return;
      }
      if (key == "TrafficFlow") {
        await startTrafficSimulator(setAnimationLayers, viewportRef);
        return;
      }
      if (key == "PublicTransitRoutes") {
        handlePublicTransitRoutesClick(true);
        return;
      }
      if (key == "Flood") {

        return;
      }
      if (key == "Well") {

        const wellData = await getWellData();
        setWellData(wellData);
        const wellLayer = createWellLayer(wellData, setTooltip);
        setMapLayers(wellLayer);

      }
      if(key=="RailwayNetwork")
        {
          const RailwayData = await fetchRailwayData();
          const railLayer = CreateRailwayLayer(RailwayData);
          setMapLayers(railLayer);
          setrailwayData(railLayer);

        }
      if (key == "RoadNetworks" && isHighwayCheckboxMenuOpen == false) {
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
      if (isRouteCheckboxMenuOpen == true) {
        handlePublicTransitRoutesClick(false);
        return;
      }
      if (key === "Drought") {

        removeLayer(layersStatic[0].id);
        setMapLayers(null);
        return;
        //setMapLayers((prevLayers) => prevLayers.filter((layer) => layer.key !== "drought-layer"));
      }
      if (key === "RailwayNetwork") {

        debugger;
        removeLayer(railwayData.id);
        setMapLayers(null);
        return;
        //setMapLayers((prevLayers) => prevLayers.filter((layer) => layer.key !== "drought-layer"));
      }
      if (key == "WForecast") {
        debugger;
        removeLayer(WeathericonLayer.id);
        setMapLayers(null);
        return;
      }
      if (key == "DemographicHousingData") {
        removeLayer(BlackHawkLayer.id);
        setMapLayers(null);
        setIsMenuOpen(false);
        setIsChartVisible(false);
        return;
      }
      if (isHighwayCheckboxMenuOpen == true) {
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
                ref={deckRef}
                initialViewState={viewport}
                onViewStateChange={({ viewState }) => setViewport(viewState)}
                onClick={handleMapClick}
                controller
                layers={[mapLayers]}
                getTooltip={({ object }) => {
                  if (object) {

                    if (object.properties && object.properties.occ_cls !== null && object.properties.prim_occ !== null) {
                      return object.properties && object.properties.occ_cls && object.properties.prim_occ;
                    }
                    else if (object.name != undefined) {
                      return `${object.name}`;
                    }
                    else if (object && object.temperature != undefined) {
                      return `Temperature: ${object.temperature}°C` + `\nHumidity: ${object.humidity}%`;
                    }
                    else if (object.county && object.depth) {
                      return `County: ${object.county}, Depth: ${object.depth}`;
                    }
                  }
                  // object && (`${object.properties.building}` || `${object.name}`)
                }
                }
              >
                <Map mapId={GOOGLE_MAP_ID} defaultCenter={{ lat: 42.4937, lng: -92.345 }} defaultZoom={12} />
                {/* Canvas */}
                <canvas id="airQualityCanvas" style={{ position: "absolute", bottom: 10, left: 10, zIndex: 1, width: 100, height: 100, pointerEvents: "yes", opacity: 0.5, padding: 10 }}></canvas>
                <div>
                  {/* {hoverInfo && renderTooltip(hoverInfo)} */}
                  <Popup clickPosition={clickPosition} object={clickedObject} />
                </div>
                <div id="App"></div>
              </DeckGL>
            </APIProvider>
          </StrictMode>
          {isMenuOpen && (
            <div
              style={{
                position: 'fixed',
                right: 0,
                top: '10px',
                width: '300px',
                height: '400px',
                backgroundColor: 'white',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '15px',
                zIndex: 1000,
                right: '5px',
                overflowY: 'auto',
              }}
            >
              <p style={{ fontSize: '18px', marginBottom: '10px', textAlign: 'center' }}>{countyName} Summary</p>
              <p style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'justify' }}>{menuContent}</p>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  style={{
                    fontSize: '10px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightblue',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: '10px',
                  }}
                  onClick={() => handleButtonClick('language', setChartData, setIsChartVisible, setMenuContent, setShowBackButton)}
                >
                  Language
                </button>
                <button
                  style={{
                    fontSize: '10px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightblue',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleButtonClick('expenses', setChartData, setIsChartVisible, setMenuContent, setShowBackButton)}
                >
                  Expenses
                </button>
                {showBackButton && <button
                  style={{
                    fontSize: '10px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightcoral',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '10px',
                  }}
                  onClick={() => handleButtonClick('back', setChartData, setIsChartVisible, setMenuContent, setShowBackButton)}
                >
                  Back
                </button>
                }
              </div>
              {isChartVisible && (
                <Bar
                  data={chartData}
                  options={{
                    title: {
                      display: true,
                      text: 'Language vs Expenses',
                      fontSize: 16,
                      padding: 10,
                    },
                    legend: {
                      display: true,
                      position: 'bottom',
                    },
                  }}
                />
              )}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  style={{
                    fontSize: '10px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightblue',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Map3D;