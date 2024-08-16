import React, { useState, useEffect, useRef, StrictMode } from "react";
import { DeckGL } from "@deck.gl/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";
import {
  fetchDataFromApis,
  drawBlackHawkCounty,
  isPointInsidePolygon,
  handleButtonClick,
  useChartData,
} from "components/SCDemographicData";
import { startTrafficSimulator } from "components/TrafficSimulator";
import { point, polygon } from "@turf/helpers";
import { Bar } from "react-chartjs-2";
import HighwayCheckboxComponent from "../SCHighway/index";
import { getTrafficEventData, convertToMarkers } from "../SCEvents/TrafficEvent";
import { renderAirQualityChart, FetchAirQuality, createMenu, addIconToMap } from "../SCAQ/index";
import { createWeatherIconLayer } from "../SCWeather/Weather";
import Popup from "./Popup";
import {
  createStruct,
  createStationsStruct,
  getTrainData,
  getTrainStationsData,
} from "../SCTrain/AmtrakData";
import { DroughtLayer, FetchDroughtData, createLegendHTML } from "../SCDrought/index";
import { ElectricgridLayer } from "../SCElectric/index";
import { BridgesgridLayer } from "../SCBridge/index";
import { BuildingLayer } from "../SCBuilding/layerBuilding";
import { getFloodLayer } from "../SCFlood/index";
import { getWellData, createWellLayer } from "../SCWell/well";
import { fetchRailwayData, CreateRailwayLayer } from "../SCRailway/index";
import { RailwayBridgesLayer } from "../SCRailwayBridge/index";
import { createSchoolLayer, getSchoolData } from "../SCAmeties/school_index";
import { getPolicestationData, createPoliceStationsLayer } from "../SCAmeties/police_station";
import { getFirestationData, createFireStationsLayer } from "../SCAmeties/fire_station";
import { getCareFacilitiesData, createCareFacilitiesLayer } from "../SCAmeties/carefacilities";
import { getCommunicationData, createCommunicationLayer } from "../SCAmeties/communication";
import { getWasteWaterData, createWasteWaterLayer } from "../SCWasteWater/index";
import { getElectricData, createElectricPowerLayer } from "../SCElectricPower/index";
import {  loadBusLayer, loadBusStopLayer }from "../SCPublicTransitRoute/bus.js";

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";

function Map3D() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  //const [mapLayersFlood, setMapLayersFlood] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [menuContent, setMenuContent] = useState("Loading");
  const [countyName, setCountyName] = useState("Black Hawk County");
  const [showBackButton, setShowBackButton] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [wellData, setWellData] = useState([]);
  const [railwayData, setrailwayData] = useState([]);
  const [clickPosition, setClickPosition] = useState({ x: null, y: null });
  const [clickedObject, setClickedObject] = useState(null);

  const [checkboxStateTransit, setCheckboxStateTransit] = useState({
    train: false,
    bus: false,
    tram: false,
  });

  // Haritada tıklama olayını dinleyen fonksiyon
  const handleMapClick = async (event) => {
    const isAQualityActive = activeItems[layers.findIndex((item) => item.key === "AQuality")];
    const isWeatherActive = activeItems[layers.findIndex((item) => item.key === "WForecast")];
    const isDemographicActive =
      activeItems[layers.findIndex((item) => item.key === "DemographicHousingData")];
    if (isAQualityActive) {
      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      setClickPosition({ x: latitude, y: longitude });

      if (AQiconLayer !== null) {
        removeLayer(AQiconLayer.id);
        setMapLayers(null);
      }

      try {
        const canvas = document.getElementById("airQualityCanvas");
        canvas.remove();

        const airQualityData = await FetchAirQuality(latitude, longitude);
        renderAirQualityChart(airQualityData);

        const iconlayer = addIconToMap(latitude, longitude);
        setMapLayers(iconlayer);
        setAQIconLayer(iconlayer);
      } catch (error) {
        console.error("Hava kalitesi verileri alınırken bir hata oluştu:", error);
      }
    }

    if (isDemographicActive) {
      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      // setClickPosition({ x: latitude, y: longitude });

      const blackHawkCountyBorder = [
        { lat: 42.642729, lng: -92.508407 },
        { lat: 42.299418, lng: -92.482915 },
        { lat: 42.299418, lng: -92.060234 },
        { lat: 42.642729, lng: -92.060234 },
        { lat: 42.642729, lng: -92.508407 },
      ];

      const poly = polygon([blackHawkCountyBorder]);
      const pt = point([latitude, longitude]);
      const in_or_out = isPointInsidePolygon(pt, poly);

      if (in_or_out) {
        setIsMenuOpen(true);
        const data = await fetchDataFromApis();
        setMenuContent(
          `Populations and People: ${data.source4.data0} \n Medium Age: ${data.source1.data0} \n Over Age 64: ${data.source2.data0}% \n Number of Employment: ${data.source5.data0} \n  Household median income: ${data.source6.data0}\nPoverty: ${data.source3.data0}%`
        );
        // setCountyName(data.source1.location);
        setIsChartVisible(false);
      }
    }
    if (isWeatherActive) {
      removeLayer(WeathericonLayer.id);
      setMapLayers(null);
      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      setClickPosition({ x: latitude, y: longitude });
      try {
        // Hava durumu verilerini kullanarak iconları haritaya ekle
        const layer = await createWeatherIconLayer(latitude, longitude, 3);
        setWeatherIconLayer(layer);
        setMapLayers(layer);
      } catch (error) {
        console.error("Error in handleMapClick:", error);
      }
    }
  };

  const initialState = {
    electricGrid: false,
    transEvents: false,
    publicTransitRoutes: false,
  };

  const maplayersTestData = [];

  const [viewport, setViewport] = useState({
    longitude: -92.345,
    latitude: 42.4937,
    zoom: 13,
    heading: 1,
    pitch: 45,
  });

  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // Deck element reference to pass and use in animation or other sub components.
  const deckRef = useRef(null);
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, transparentSidenav, darkMode } = controller;
  const [activeItems, setActiveItems] = useState([]);
  const [mapLayers, setMapLayersState] = useState(maplayersTestData);
  const [WeathericonLayer, setWeatherIconLayer] = useState(null);
  const [AQiconLayer, setAQIconLayer] = useState(null);
  const [BlackHawkLayer, setBlackHawkLayer] = useState(null);
  const [layersStatic, setLayersStatic] = useState([]);
  const [isFloodLayerSelected, setIsFloodLayerSelected] = useState(false);
  const [currentLayerFlood, setCurrentLayerFlood] = useState("50");
  //const [isselectedTransit, setSelectedTransit] = useState(false);

  function setMapLayers(newLayers) {
    layersStatic.push(newLayers);
    setLayersStatic(layersStatic);
    const layersCopy = layersStatic.slice();
    // layersCopy.push(layersAnimation);
    setMapLayersState(layersCopy);
  }

  function setAnimationLayers(animationLayers) {
    const allLayers = [];
    // setLayersAnimation(animationLayers);
    allLayers.push(animationLayers);
    const layersCopy = layersStatic.slice();
    allLayers.push(layersCopy);
    setMapLayersState(allLayers);
  }

  function checkLayerExists(layerName) {
    const foundIndex = layersStatic.findIndex((x) => x && x.id === layerName);
    return foundIndex;
  }

  function removeLayer(layerName) {
    const foundIndex = checkLayerExists(layerName);
    if (foundIndex > -1) {
      layersStatic.splice(foundIndex, 1);
      const newLayers = layersStatic.slice();
      setMapLayers(newLayers);
    }
  }

  const [checkboxStateHighway, setCheckboxStateHighway] = useState(initialState);
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

  // function loadTruck(data) {
  //   return new ScenegraphLayer({
  //     id: "truck",
  //     data, // "./data/test.json",
  //     scenegraph: `${process.env.PUBLIC_URL}/data/CesiumMilkTruck.glb`,
  //     sizeScale: 2,
  //     getPosition: (d) => d.coordinates,
  //     getTranslation: [0, 0, 1],
  //     getOrientation: (d) => [0, 180, 90],
  //     _lighting: "pbr",
  //   });
  // }

  async function loadLayer(key, dataPath) {
    const jsonData = await loadJsonData(dataPath);
    const layer = await CreateGeoJsonLayer(key, jsonData);
    setMapLayers(layer);
  }

  // async function loadLayerwithData(key, jsonData) {
  //   const layer = await CreateGeoJsonLayer(key, jsonData);
  //   setMapLayers(layer);
  // }

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
        id: "TransEvents",
        data: trafficEventData,
        pickable: true,
        iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
        iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
        getIcon: (d) => "paragon-5-red",
        sizeScale: 1,
        getPosition: (d) => d.coordinates,
        getSize: (d) => 50,
        getColor: (d) => [255, 255, 255],
        getAngle: (d) => 0,
        onClick: (info) => {
          expandTooltip(info);
        },
      });

      loadLayerwithLayer(layerEvent);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  }
  // PublicTransitRoutes linkine tıklandığında checkbox menüsünü açacak fonksiyon
  const handlePublicTransitRoutesClick = (isRouteLayer) => {
    setIsRouteCheckboxMenuOpen(isRouteLayer);
  };

  const handleHighwayClick = (open) => {
    setIsHighwayCheckboxMenuOpen(open);
  };

  async function layerLinkHandler(key, isActive, dataPath) {
    if (isActive) {
      if (key === "Electricgrid") {
        const Layer = await ElectricgridLayer();
        setMapLayers(Layer);
        return;
      }

      if (key === "Electricpower") {
        const Data = await getElectricData();
        const powerLayer = createElectricPowerLayer(Data, setTooltip);
        setMapLayers(powerLayer);
        return;
      }

      if (key === "Bridges") {
        const layerBridges = await BridgesgridLayer();
        setMapLayers(layerBridges);
        return;
      }

      if (key === "RailBridge") {
        const layerBridges = await RailwayBridgesLayer();
        setMapLayers(layerBridges);
        return;
      }

      if (key === "TransEvents") {
        await loadTransportationEvents();
        return;
      }

      if (key === "Buildings") {
        const layerBuilding = await BuildingLayer();
        setMapLayers(layerBuilding);
        return;
      }
      if (key === "Drought") {
        try {
          const drData = await FetchDroughtData();
          if (drData) {
            console.log("Drought Data:", drData);
            const layer = await DroughtLayer(drData);
            await loadLayerwithLayer(layer);

            // Legend HTML oluşturma ve ekleme
            const legendHTML = createLegendHTML();
            const mapContainer = document.getElementById("map-container");
            if (mapContainer) {
              mapContainer.insertAdjacentHTML("beforeend", legendHTML);
            }
          } else {
            console.error("No data returned from Drought function");
          }
        } catch (error) {
          console.error("Error loading drought data:", error);
        }
      }
      if (key === "Flood") {
        setIsFloodLayerSelected(true);
        const layer = await getFloodLayer("flood", currentLayerFlood);
        setMapLayers(layer);
        return;
      }
      if (key === "AQuality") {
        // Hava kalitesi verilerini al ve grafiği render et
        createMenu();
        var data = await FetchAirQuality(42.4942408813, -92.34170190987821);
        renderAirQualityChart(data);
        const iconlayer = addIconToMap(42.4942408813, -92.34170190987821);
        setMapLayers(iconlayer);
        setAQIconLayer(iconlayer);
        return;
      }
      if (key === "WForecast") {
        removeLayer("WForecast");
        const layer = await createWeatherIconLayer(42.569663, -92.479646, 3);
        setWeatherIconLayer(layer);
        setMapLayers(layer);
        return;
      }
      if (key === "DemographicHousingData") {
        const layer = await drawBlackHawkCounty();
        setIsMenuOpen(true);
        const data = await fetchDataFromApis();
        setBlackHawkLayer(layer);
        // setCountyName(data.source1.location);
        setMenuContent(
          `Populations and People: ${data.source4.data0} \n Medium Age: ${data.source1.data0} \n Over Age 64: ${data.source2.data0}% \n Number of Employment: ${data.source5.data0} \n  Household median income: ${data.source6.data0}\nPoverty: ${data.source3.data0}%`
        );
        setMapLayers(layer);
        // const data= await fetchDataFromApis();
        return;
      }
      if (key === "TrafficFlow") {
        await startTrafficSimulator(setAnimationLayers, viewportRef);
        return;
      }
      if (key === "wells") {
        const wellData = await getWellData();
        setWellData(wellData);
        const wellLayer = createWellLayer(wellData, setTooltip);
        setMapLayers(wellLayer);
      }
      // if (key === "PublicTransitRoutes") {
      //   handlePublicTransitRoutesClick(true);
      //   return;
      // }
      if (key === "Bus_Info") {
        debugger;
        const busLayer= await loadBusLayer();  
        const busStop= await loadBusStopLayer();  
        debugger;
        setMapLayers(busStop);    
        setMapLayers(busLayer);
        return;
      }
      if (key === "RailwayNetwork") {
        const RailwayData = await fetchRailwayData();
        const railLayer = CreateRailwayLayer(RailwayData);
        setMapLayers(railLayer);
        setrailwayData(railLayer);
        return;
      }
      if (key === "RoadNetworks" && isHighwayCheckboxMenuOpen === false) {
        handleHighwayClick(true);
        checkboxStateHighway.primary = false;
        checkboxStateHighway.secondary = false;
        checkboxStateHighway.residential = false;
        checkboxStateHighway.service = false;
        checkboxStateHighway.motorway = false;
        checkboxStateHighway.cycleway = false;
        return;
      }
      if (key === "School") {
        const Data = await getSchoolData();
        const schoolLayer = createSchoolLayer(Data, setTooltip);
        setMapLayers(schoolLayer);
        return;
      }
      if (key === "PoliceStations") {
        const Data = await getPolicestationData();
        const policeLayer = createPoliceStationsLayer(Data, setTooltip);
        setMapLayers(policeLayer);
        return;
      }
      if (key === "FireStations") {
        const Data = await getFirestationData();
        const fireLayer = createFireStationsLayer(Data, setTooltip);
        setMapLayers(fireLayer);
        return;
      }
      if (key === "CareFacilities") {
        const Data = await getCareFacilitiesData();
        const careLayer = createCareFacilitiesLayer(Data, setTooltip);
        setMapLayers(careLayer);
        return;
      }
      if (key === "Communication") {
        const Data = await getCommunicationData();
        const communicationLayer = createCommunicationLayer(Data, setTooltip);
        setMapLayers(communicationLayer);
        return;
      }
      if (key === "wastewater") {
        const Data = await getWasteWaterData();
        const wastewaterLayer = createWasteWaterLayer(Data, setTooltip);
        setMapLayers(wastewaterLayer);
        return;
      }
      await loadLayer(key, dataPath);
    } else {
      if (isRouteCheckboxMenuOpen === true) {
        handlePublicTransitRoutesClick(false);
        return;
      }

      if (key === "Drought") {
        removeLayer("Drought");
        const legendElement = document.querySelector(".legend-container");
        if (legendElement) {
          legendElement.remove();
        }
        return;
      }

      if (key === "Electricgrid") {
        removeLayer("Electricgrid");
        return;
      }

      if (key === "RailwayNetwork") {
        removeLayer("RailwayNetwork");
        return;
      }

      if (key === "Electricpower") {
        removeLayer("Electricpower");
        return;
      }

      if (key === "wells") {
        removeLayer("WellLayer");
        return;
      }

      // if (key === "RailwayNetwork") {
      //   removeLayer(railwayData.id);
      //   setMapLayers(null);
      //   return;
      //   // setMapLayers((prevLayers) => prevLayers.filter((layer) => layer.key !== "drought-layer"));
      // }

      if (key === "WForecast") {
        removeLayer(WeathericonLayer.id);
        setMapLayers(null);
        return;
      }

      if (key === "DemographicHousingData") {
        removeLayer(BlackHawkLayer.id);
        setMapLayers(null);
        setIsMenuOpen(false);
        setIsChartVisible(false);
        return;
      }
      if (key === "Flood") {
        setIsFloodLayerSelected(false);
        //setMapLayersFlood(prevLayers => prevLayers.filter(layer => layer.id !== key));
        removeLayer("flood");
        return;
      }

      if (isHighwayCheckboxMenuOpen === true) {
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
        const menu = document.getElementById("rightmenu");
        menu.remove();
      }
    }
  }

  // Capitalize function
  // function capitalizeWords(str) {
  //   return str
  //     .split(" ")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //     .join(" ");
  // }

  function getTooltipContent({ object }) {
    if (object) {
      console.log(object);
      // Check for tooltip_data directly on the object first
      if (object.tooltip_data) {
        return `${object.tooltip_data}`;
      }
      // If not found, check within object.properties
      if (object.properties && object.properties.tooltip_data) {
        return `${object.properties.tooltip_data}`;
      }
    }
    // Return a default or empty string if no tooltip data is found
    return null;
  }

  //const mydesignLayers = layers.filter((layer) => layer.type === "mydesign");
  layers[0].clickFunc = layerLinkHandler;

  const handleLayerSelectChangeFlood = async (event) => {
    removeLayer("flood");
    const selectedLayer = event.target.value;
    setCurrentLayerFlood(selectedLayer);
    const layer = await getFloodLayer("flood", selectedLayer);
    //setMapLayersFlood(prevLayers => [...prevLayers, layer]);

    setMapLayers(layer);
  };

  // function CheckboxLayerTransit({ checkboxStateTransit, setCheckboxStateTransit }) {
  //   const handleCheckboxChange = async (event) => {
  //     const { name, checked } = event.target;
  //     setCheckboxStateTransit((prevState) => ({
  //       ...prevState,
  //       [name]: checked,
  //     }));

  //     if (checked) {
  //       switch (name) {
  //         case 'train':
  //           await import('../SCPublicTransitRoute/train.js').then(({ loadTrainLayer }) => loadTrainLayer());
  //           break;
  //         case 'bus':
  //           const layerbus = await loadBusLayer();
  //           setMapLayers(layerbus);
  //           break;
  //         case 'tram':
  //           await import('../SCPublicTransitRoute/tram.js').then(({ loadTramLayer }) => loadTramLayer());
  //           break;
  //         default:
  //           break;
  //       }
  //     } else {
  //       switch (name) {
  //         case 'train':
  //           await import('../SCPublicTransitRoute/train.js').then(({ removeTrainLayer }) => removeTrainLayer());
  //           break;
  //         case 'bus':
  //           await import('../SCPublicTransitRoute/bus.js').then(({ removeBusLayer }) => removeBusLayer());
  //           break;
  //         case 'tram':
  //           await import('../SCPublicTransitRoute/tram.js').then(({ removeTramLayer }) => removeTramLayer());
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   };
  //   return (
  //     <div
  //       style={{
  //         position: 'absolute',
  //         top: '0',
  //         left: '0',
  //         padding: '10px',
  //         boxSizing: 'border-box',
  //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
  //         zIndex: 999,
  //         display: 'flex',
  //         flexDirection: 'row',
  //         alignItems: 'center',
  //         borderRadius: '5px',
  //       }}
  //     >
  //       <label style={{ marginRight: '10px' }}>
  //         <input
  //           type="checkbox"
  //           name="train"
  //           checked={checkboxStateTransit.train}
  //           onChange={handleCheckboxChange}
  //         />
  //         Train Stations and Amtract Train Routes
  //       </label>
  //       <br />
  //       <label style={{ marginRight: '10px' }}>
  //         <input
  //           type="checkbox"
  //           name="bus"
  //           checked={checkboxStateTransit.bus}
  //           onChange={handleCheckboxChange}
  //         />
  //         Bus stops and routes
  //       </label>
  //       <br />
  //       <label>
  //         <input
  //           type="checkbox"
  //           name="tram"
  //           checked={checkboxStateTransit.tram}
  //           onChange={handleCheckboxChange}
  //         />
  //         Tram stops and routes
  //       </label>
  //     </div>
  //   );
  // }

  return (
    <>
      {isFloodLayerSelected && (
        <div
          id="layerSelector"
          style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000 }}
        >
          <label htmlFor="layerSelect">Select Flood Risk Layer:</label>
          <select id="layerSelect" defaultValue="5" onChange={handleLayerSelectChangeFlood}>
            <option value="2">Flood Risk 2yr</option>
            <option value="5">Flood Risk 5yr</option>
            <option value="25">Flood Risk 25yr</option>
            <option value="50">Flood Risk 50yr</option>
            <option value="100">Flood Risk 100yr</option>
            <option value="200">Flood Risk 200yr</option>
            <option value="500">Flood Risk 500yr</option>
          </select>
        </div>
      )}
      <Sidenav
        color={sidenavColor}
        //brand="AKLDNDKLN"
        brandName="Waterloo"
        routes={layers}
        activeItems={activeItems}
        setActiveItems={setActiveItems}
      />
      <div>

        {isRouteCheckboxMenuOpen && (
          <CheckboxLayerTransit
            checkboxStateTransit={checkboxStateTransit}
            setCheckboxStateTransit={setCheckboxStateTransit}
          />
        )}
        {/* CheckboxLayer bileşeni sadece isCheckboxMenuOpen true olduğunda  */}
        {/* <div id="checkbox-area" style={{ width: "100%", height: "10vh" }}>
          {}
          {isRouteCheckboxMenuOpen && (
            <CheckboxLayerEvent
              handleCheckboxChange={(event) => setCheckboxState(event.target.checked)}
              checkboxState={checkboxState}
            />
          )}
        </div> */}

        <div id="checkbox-area" style={{ width: "100%", height: "10vh" }}>
          {/* CheckboxLayer bileşeni sadece isCheckboxMenuOpen true olduğunda */}
          {isHighwayCheckboxMenuOpen && (
            <HighwayCheckboxComponent setMapLayers={setMapLayers} removeLayer={removeLayer} />
          )}
        </div>
        <div id="map" style={{ width: "100%", height: "90vh" }}>
          <StrictMode>
            <div
              id="map-container"
              style={{ width: "100%", height: "90vh", position: "relative" }}
            />
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <DeckGL
                ref={deckRef}
                initialViewState={viewport}
                onViewStateChange={({ viewState }) => setViewport(viewState)}
                onClick={handleMapClick}
                controller
                layers={[mapLayers]}
                getTooltip={getTooltipContent}
              >
                <Map
                  mapId={GOOGLE_MAP_ID}
                  defaultCenter={{ lat: 42.4937, lng: -92.345 }}
                  defaultZoom={12}
                />
                {/* Canvas */}
                <canvas
                  id="airQualityCanvas"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    zIndex: 1,
                    width: 100,
                    height: 100,
                    pointerEvents: "yes",
                    opacity: 0.5,
                    padding: 10,
                  }}
                />
                <div>
                  {/* {hoverInfo && renderTooltip(hoverInfo)} */}
                  <Popup clickPosition={clickPosition} object={clickedObject} />
                </div>
                <div id="App" />
              </DeckGL>
            </APIProvider>
          </StrictMode>
          {isMenuOpen && (
            <div
              style={{
                position: "fixed",
                right: 0,
                top: "10px",
                width: "300px",
                height: "400px",
                backgroundColor: "white",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "15px",
                zIndex: 1000,
                right: "5px",
                overflowY: "auto",
              }}
            >
              <p style={{ fontSize: "18px", marginBottom: "10px", textAlign: "center" }}>
                {countyName} Summary
              </p>
              <p style={{ fontSize: "14px", marginBottom: "20px", textAlign: "justify" }}>
                {menuContent}
              </p>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                  style={{
                    fontSize: "10px",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    backgroundColor: "lightblue",
                    border: "none",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  onClick={() =>
                    handleButtonClick(
                      "language",
                      setChartData,
                      setIsChartVisible,
                      setMenuContent,
                      setShowBackButton
                    )
                  }
                >
                  Language
                </button>
                <button
                  style={{
                    fontSize: "10px",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    backgroundColor: "lightblue",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleButtonClick(
                      "expenses",
                      setChartData,
                      setIsChartVisible,
                      setMenuContent,
                      setShowBackButton
                    )
                  }
                >
                  Expenses
                </button>
                {showBackButton && (
                  <button
                    style={{
                      fontSize: "10px",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      backgroundColor: "lightcoral",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                    onClick={() =>
                      handleButtonClick(
                        "back",
                        setChartData,
                        setIsChartVisible,
                        setMenuContent,
                        setShowBackButton
                      )
                    }
                  >
                    Back
                  </button>
                )}
              </div>
              {isChartVisible && (
                <Bar
                  data={chartData}
                  options={{
                    title: {
                      display: true,
                      text: "Language vs Expenses",
                      fontSize: 16,
                      padding: 10,
                    },
                    legend: {
                      display: true,
                      position: "bottom",
                    },
                  }}
                />
              )}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  style={{
                    fontSize: "10px",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    backgroundColor: "lightblue",
                    border: "none",
                    cursor: "pointer",
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
