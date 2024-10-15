import React, { useState, useEffect, useRef, StrictMode, useMemo } from "react";
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { GeoJsonLayer, IconLayer } from "@deck.gl/layers";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";
import {
  fetchDataFromApis,
  drawBlackHawkCounty,
  isPointInsidePolygon,
  SCDemographicData,
  handleButtonClick,
} from "components/SCDemographicData";
import { startTrafficSimulator } from "components/TrafficSimulator";
import { point, polygon } from "@turf/helpers";
import { Bar } from "react-chartjs-2";
import HighwayCheckboxComponent from "../SCHighway/index";
import { createTrafficEventLayer, getTrafficEventData } from "../SCEvents/TrafficEvent";
import { renderAirQualityChart, FetchAirQuality, createMenu, addIconToMap, removeMenu, showDailyDetails } from "../SCAQ/index";
import { getWeatherLayer, getWeatherLayersForAllLocations } from "../SCWeather/index";
import Popup from "./Popup";
import { DroughtLayer, FetchDroughtData, createLegendHTML } from "../SCDrought/index";
import { ElectricgridLayer } from "../SCElectric/index";
import { BridgesgridLayer } from "../SCBridge/index";
import { BuildingLayer } from "../SCBuilding/layerBuilding";
import { getFloodLayer, FloodMenu, createFloodDamageIconLayer } from "../SCFlood/index";
import { getWellData, createWellLayer } from "../SCWell/well";
import { fetchRailwayData, CreateRailwayLayer, FetchRailwayStations, CreateRailwayStations } from "../SCRailway/index";
import { RailwayBridgesLayer } from "../SCRailwayBridge/index";
import { createSchoolLayer, getSchoolData } from "../SCAmeties/school_index";
import { getPolicestationData, createPoliceStationsLayer } from "../SCAmeties/police_station";
import { getFirestationData, createFireStationsLayer } from "../SCAmeties/fire_station";
import { getCareFacilitiesData, createCareFacilitiesLayer } from "../SCAmeties/carefacilities";
import { getCommunicationData, createCommunicationLayer } from "../SCAmeties/communication";
import { getWasteWaterData, createWasteWaterLayer } from "../SCWasteWater/index";
import { getElectricData, createElectricPowerLayer } from "../SCElectricPower/index";
import { loadBusLayer, loadBusStopLayer } from "../SCPublicTransitRoute/bus.js";
import { AddRailwayCrossingLayer } from "../SCRailwayCrossing/index.js";
import { loadBicycleLayer } from "../SCBicycleNetwork/index.js";
import { loadBicycleAmetiesLayer } from "../SCBicycleAmenities/index.js";
import SCSimulation from "components/SCSimulation";
import { createRainSensorLayer } from "components/SCSensors";
import { createStreamSensorLayer } from "components/SCSensors";
import { createSoilMoistureSensorLayer } from "components/SCSensors";
import DetailsBox from "../DetailsBox/index";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAP_ID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
const defaultCoords = {lat:  42.4942408813, long: -92.34170190987821 };

function DeckGLOverlay(props: DeckProps) {
  const map = useMap();

  // Yeni overlay'i useMemo ile sadece props değiştiğinde yaratıyoruz.
  const overlay = useMemo(() => new GoogleMapsOverlay(props), [props]);

  // Map yüklendiğinde ve props değiştiğinde overlay güncelleniyor.
  useEffect(() => {
    if (map) {
      overlay.setMap(map);
      return () => overlay.setMap(null);
    }
  }, [map, overlay]);

  // Overlay'in propslarını güncelliyoruz.
  useEffect(() => {
    overlay.setProps(props);
  }, [overlay, props.layers]);

  return null;
}
//
function Map3D() {
  const [isMenuOpenFlood, setIsMenuOpenFlood] = useState(false);
  const [isMenuOpenDemographic, setIsMenuOpenDemographic] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  //const [mapLayersFlood, setMapLayersFlood] = useState([]);
  //const [chartData, setChartData] = useState(null);
  const [menuContent, setMenuContent] = useState("Loading");
  const [countyName, setCountyName] = useState("Black Hawk County");
  const [showBackButton, setShowBackButton] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipHtml, setTooltipHtml] = useState(null);
  const [wellData, setWellData] = useState([]);
  const [railwayData, setrailwayData] = useState([]);
  const [clickPosition, setClickPosition] = useState({ x: null, y: null });
  const [clickedObject, setClickedObject] = useState(null);
  const [iconlayerFlood, seticonlayerFlood] = useState(null);
  const [WeathericonLayer, setWeatherIconLayer] = useState(null);
  const [mapTiltAngle, setMapTiltAngle] = useState(0);

   // Central state for the details box
   const [isDetailsBoxOpen, setIsDetailsBoxOpen] = useState(false);
   const [detailsContent, setDetailsContent] = useState(null);
 
   // Function to open the details box with content
   const openDetailsBox = (content) => {
    setDetailsContent(content);
    if(content)
    {
      setIsDetailsBoxOpen(true);
    } 
   };
 
   const closeDetailsBox = () => {
     setIsDetailsBoxOpen(false);
   };

  const [checkboxStateTransit, setCheckboxStateTransit] = useState({
    train: false,
    bus: false,
    tram: false,
  });

  const [map, setMap] = useState(null); // State to track the map instance

  const handleMapLoad = (mapInstance) => {
    //console.log("Map has fully loaded");
    setMap(mapInstance);  // Store the map instance in state
  };

  const blackHawkBorderDataPath = `${process.env.PUBLIC_URL}/data/black_hawk_county.geojson`;

  const [borderLoaded, setBorderLoaded] = useState(false);
  useEffect(() => {
    if (map && !borderLoaded) {
      const loadBlackHawkCounty = async () => {
        const response = await fetch(blackHawkBorderDataPath);
        const data = await response.json();
        const blackHawkLayer = new GeoJsonLayer({
          id: 'black-hawk-county-borders',
          data,
          stroked: true,
          filled: false,
          lineWidthMinPixels: 2,
          lineWidthMaxPixels: 5,
          getLineColor: [0, 0, 0],
        });
  
        const layerExists = layersStatic.some(layer => layer.id === 'black-hawk-county-borders');
        if (!layerExists) {
          setMapLayers(blackHawkLayer);
          setBorderLoaded(true);
        }
      };
  
      loadBlackHawkCounty();
    }
  }, [map, borderLoaded]);  // Ensure this only runs after map is loaded
  


  // Haritada tıklama olayını dinleyen fonksiyon
  const handleMapClick = async (event) => {
    // event.coordinate veya event.lngLat'in tanımlı olup olmadığını kontrol edin
    console.log('event:', event); // event nesnesinin yapısını görmek için

    const latLng = event.detail.latLng;

    if (latLng) {
      const latitude = latLng.lat;
      const longitude = latLng.lng;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      setClickPosition({ x: latitude, y: longitude });

      const isAQualityActiveItem = activeItems.find(item => item.key === "AQuality");
      const isAQualityActive = isAQualityActiveItem ? isAQualityActiveItem.value : undefined;

      const isWeatherActiveItem = activeItems.find(item => item.key === "WForecast");
      const isWeatherActive = isWeatherActiveItem ? isWeatherActiveItem.value : undefined;

      if (isAQualityActive) {
        try {
          // Haritaya yeni tıklama yapıldığında önceki verileri ve ikonları temizle
          const canvas = document.getElementById("airQualityCanvas");
          if (canvas) {
            canvas.remove(); // Var olan canvas elementini kaldır
          }
          removeMenu();
          if (AQiconLayer !== null) {
            removeLayer(AQiconLayer.id); // Eski ikonu kaldır
          }

           // Eğer detaylar açık ise, gösterilen içerik güncellenmeli
           let existingDetailsDiv = document.getElementById('detailsDiv');
           if (existingDetailsDiv) {
            console.log("detay sayfasındasın")
           }
          const airQualityData = await FetchAirQuality(latitude, longitude);
          renderAirQualityChart(airQualityData);
          debugger;
          //createMenu();
          const iconLayer = addIconToMap(latitude, longitude);
          
          setAQIconLayer(iconLayer);
          setMapLayers(iconLayer);
         
        }
        catch (error) {
          console.error("Hava kalitesi verileri alınırken bir hata oluştu:", error);
        }
      }
      if (isWeatherActive) {
        try {
          if(WeathericonLayer !==null)
          {
            removeLayer(WeathericonLayer.id);
          }
          // Hava durumu verilerini kullanarak iconları haritaya ekle
          const layer = await getWeatherLayer(latitude, longitude, openDetailsBox);
          setMapLayers(layer);
          setWeatherIconLayer(layer);
        } catch (error) {
          console.error("Error in handleMapClick:", error);
        }
      }
    } else {
      console.error("Koordinatlar bulunamadı!");
    }

    // if (isDemographicActive) {
    //   const longitude = event.coordinate[0];
    //   const latitude = event.coordinate[1];
    //   // setClickPosition({ x: latitude, y: longitude });

    //   const blackHawkCountyBorder = [
    //     { lat: 42.642729, lng: -92.508407 },
    //     { lat: 42.299418, lng: -92.482915 },
    //     { lat: 42.299418, lng: -92.060234 },
    //     { lat: 42.642729, lng: -92.060234 },
    //     { lat: 42.642729, lng: -92.508407 },
    //   ];

    //   const poly = polygon([blackHawkCountyBorder]);
    //   const pt = point([latitude, longitude]);
    //   const in_or_out = isPointInsidePolygon(pt, poly);

    //   if (in_or_out) {
    //     setIsMenuOpen(true);
    //     const data = await fetchDataFromApis();
    //     setMenuContent(
    //       `Populations and People: ${data.source4.data0} \n Medium Age: ${data.source1.data0} \n Over Age 64: ${data.source2.data0}% \n Number of Employment: ${data.source5.data0} \n  Household median income: ${data.source6.data0}\nPoverty: ${data.source3.data0}%`
    //     );
    //     // setCountyName(data.source1.location);
    //     setIsChartVisible(false);
    //   }
    // }
  };

  const initialState = {
    electricGrid: false,
    transEvents: false,
    publicTransitRoutes: false,
  };

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
  const [mapLayers, setMapLayersState] = useState([]);
  const [AQiconLayer, setAQIconLayer] = useState(null);
  const [BlackHawkLayer, setBlackHawkLayer] = useState(null);
  const [layersStatic, setLayersStatic] = useState([]);
  const [isFloodLayerSelected, setIsFloodLayerSelected] = useState(false);
  const [currentLayerFlood, setCurrentLayerFlood] = useState("50");
  //const [isMenuFloodOpen, setIsMenuFloodOpen] = useState(false); // Menü durumu

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
      //const layersCopy = JSON.parse(JSON.stringify(layersStatic)); // Create a deep copy
      //const filtered = layersStatic.filter((layer) => layer.id !== layerName);
      layersStatic.splice(foundIndex, 1);
      // const newLayers = filtered.slice();
      // layersStatic = new
      //setLayersStatic(newLayers);
      setLayersStatic(layersStatic);
      const layersCopy = layersStatic.slice();
      // layersCopy.push(layersAnimation);
      setMapLayersState(layersCopy);
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


  async function loadLayer(key, dataPath) {
    const jsonData = await loadJsonData(dataPath);
    const layer = await CreateGeoJsonLayer(key, jsonData);
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

  // PublicTransitRoutes linkine tıklandığında checkbox menüsünü açacak fonksiyon
  const handlePublicTransitRoutesClick = (isRouteLayer) => {
    setIsRouteCheckboxMenuOpen(isRouteLayer);
  };

  const handleHighwayClick = (open) => {
    setIsHighwayCheckboxMenuOpen(open);
  };

  async function layerLinkHandler(key, isActive, dataPath) {
    if (isActive) {
      // if(key.startsWith("Simulation"))
      // {
      //   setSimulationFloodyears(0);
      //   return;
      // }
      const lat = viewportRef.current.latitude;
      const long = viewportRef.current.longitude;
      if (key === "RainGauges") {
        await createRainSensorLayer(setMapLayers, 
          lat,
          long,
          5
        );
        return;
      }
      if (key === "StreamGauges") {
        await createStreamSensorLayer(setMapLayers, 
          lat,
          long,
          30,
          setTooltip
        );
        return;
      }
      if (key === "SoilMoistureSensors") {
        await createSoilMoistureSensorLayer(setMapLayers, 
          lat,
          long,
          30,
          setTooltip
        );
        return;
      }
      if (key === "Electricgrid") {
        const Layer = await ElectricgridLayer(openDetailsBox);
        setMapLayers(Layer);
        return;
      }

      if (key === "Electricpower") {
        const data = await getElectricData();
        const powerLayer = createElectricPowerLayer(data, openDetailsBox);
        setMapLayers(powerLayer);
        return;
      }

      if (key === "RailwayCross") {
        const RailwayCrossingLayer = await AddRailwayCrossingLayer(openDetailsBox);
        setMapLayers(RailwayCrossingLayer);
        return;
      }

      if (key === "Bridges") {
        const layerBridges = await BridgesgridLayer(openDetailsBox);
        setMapLayers(layerBridges);
        return;
      }

      if (key === "TransEvents") {
        debugger;
        const data = await getTrafficEventData();
        const layer = createTrafficEventLayer(data, openDetailsBox);
        setMapLayers(layer);
        return;
      }

      if (key === "Buildings") {
        const layerBuilding = await BuildingLayer(openDetailsBox);
        setMapLayers(layerBuilding);
        setMapTiltAngle(45);
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
        const FloodDamageIconLayer = await createFloodDamageIconLayer(1036040, openDetailsBox);
        setMapLayers(FloodDamageIconLayer);
        setIsMenuOpenFlood(true);
        return;
      }
      if (key === "AQuality") {
        // Hava kalitesi verilerini al ve grafiği render et
        createMenu();
        var data = await FetchAirQuality(defaultCoords.lat, defaultCoords.long);
        renderAirQualityChart(data);
        const iconlayer = addIconToMap(defaultCoords.lat, defaultCoords.long);
        setMapLayers(iconlayer);
        setAQIconLayer(iconlayer);
        return;
      }
      if (key === "WForecast") {
        //removeLayer("WForecast");
        const weatherLayer = await getWeatherLayersForAllLocations(openDetailsBox);
        setMapLayers(weatherLayer); // Tek bir katman olarak ekliyoruz
        setWeatherIconLayer(weatherLayer);
        return;
      }
      if (key === "DemographicHousingData") {
        debugger;
        //const layer = await drawBlackHawkCounty();
        setIsMenuOpenDemographic(true);
        const data = await fetchDataFromApis();
        //setBlackHawkLayer(layer);
        // setCountyName(data.source1.location);
        setMenuContent(
          <div>
            <div>Populations and People: {data.source4.data0}</div>
            <div>Medium Age: {data.source1.data0}</div>
            <div>Over Age 64: {data.source2.data0}%</div>
            <div>Number of Employment: {data.source5.data0}</div>
            <div>Household median income: {data.source6.data0}</div>
            <div>Poverty: {data.source3.data0}%</div>
          </div>
        );
        //setMapLayers(layer);
        setIsChartVisible(false);
        // const data= await fetchDataFromApis();
        return;
      }
      if (key === "TrafficFlow") {
        await startTrafficSimulator(setAnimationLayers, setMapLayers, viewportRef);
        return;
      }
      if (key === "wells") {
        const wellData = await getWellData();
        setWellData(wellData);
        const wellLayer = createWellLayer(wellData, openDetailsBox);
        setMapLayers(wellLayer);
      }
      // if (key === "PublicTransitRoutes") {
      //   handlePublicTransitRoutesClick(true);
      //   return;
      // }
      if (key === "Bus_Info") {
        const busLayer = await loadBusLayer();
        const busStop = await loadBusStopLayer(openDetailsBox);
        setMapLayers(busLayer);
        setMapLayers(busStop);
        return;
      }
      if (key === "Train_Info") {
        debugger;
        const RailwayData = await fetchRailwayData();
        const railLayer = CreateRailwayLayer(RailwayData);
        setMapLayers(railLayer);
        setrailwayData(railLayer);

        const railwaystations = await FetchRailwayStations();
        const stationslayer= await CreateRailwayStations(railwaystations, openDetailsBox);
        setMapLayers(stationslayer);

        return;
      }

      if (key === "BicycleNetwork") {
        const BicycleLayer = await loadBicycleLayer(openDetailsBox);
        setMapLayers(BicycleLayer);
        return;
      }

      if (key === "BicycleAmenities") {
        const BicycleAmenities = await loadBicycleAmetiesLayer(openDetailsBox);
        setMapLayers(BicycleAmenities);
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
        const schoolLayer = createSchoolLayer(Data, openDetailsBox);
        setMapLayers(schoolLayer);
        return;
      }
      if (key === "RailBridge") {
        const Data = await RailwayBridgesLayer(openDetailsBox);
        setMapLayers(Data);
        return;
      }
      if (key === "PoliceStations") {
        const Data = await getPolicestationData();
        const policeLayer = createPoliceStationsLayer(Data, openDetailsBox);
        setMapLayers(policeLayer);
        return;
      }
      if (key === "FireStations") {
        const Data = await getFirestationData();
        const fireLayer = createFireStationsLayer(Data, openDetailsBox);
        setMapLayers(fireLayer);
        return;
      }
      if (key === "CareFacilities") {
        const Data = await getCareFacilitiesData();
        const careLayer = createCareFacilitiesLayer(Data, openDetailsBox);
        setMapLayers(careLayer);
        return;
      }
      if (key === "Communication") {
        const Data = await getCommunicationData();
        const communicationLayer = createCommunicationLayer(Data, openDetailsBox);
        setMapLayers(communicationLayer);
        return;
      }
      if (key === "wastewater") {
        const Data = await getWasteWaterData();
        const wastewaterLayer = createWasteWaterLayer(Data, openDetailsBox);
        setMapLayers(wastewaterLayer);
        return;
      }
      await loadLayer(key, dataPath);
    } else {
      closeDetailsBox();
      if (isRouteCheckboxMenuOpen === true) {
        handlePublicTransitRoutesClick(false);
        return;
      }

      if (key === "RoadNetworks" && isHighwayCheckboxMenuOpen === false) {
        checkboxStateHighway.primary = true;
        checkboxStateHighway.secondary = true;
        checkboxStateHighway.residential = true;
        checkboxStateHighway.service = true;
        checkboxStateHighway.motorway = true;
        checkboxStateHighway.cycleway = true;
        removeLayer(checkboxStateHighway.primary);
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

      if (key === "Buildings") {
        setMapTiltAngle(0);
      }

      if (key === "Train_Info") {
        removeLayer("RailwayNetwork");
        removeLayer("RailwayStations");
        debugger;
        return;
      }

      if (key === "Bus_Info") {
        removeLayer("BusRoute");
        removeLayer("BusStop");
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
      if (key === "BicycleNetwork") {
        removeLayer("BicycleNetwork");
        removeLayer("BicycleAmenities");
        return;
      }
      if (key === "BicycleAmenities") {
        removeLayer("BicycleAmenities");
        return;
      }

      if (key === "wells") {
        removeLayer("WellLayer");
        return;
      }

      if (key === "WForecast") {
        removeLayer("WForecast_AllLocations");
        removeLayer(WeathericonLayer.id);
        return;
      }

      if (key === "DemographicHousingData") {
        setMapLayers(null);
        setIsMenuOpenDemographic(false);
        setIsChartVisible(false);
        return;
      }
      if (key === "Flood") {
        setIsFloodLayerSelected(false);
        //setMapLayersFlood(prevLayers => prevLayers.filter(layer => layer.id !== key));
        removeLayer("flood");
        removeLayer("icon-layer-flood");
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
      if (key === "AQuality") {
        removeLayer("AQuality");
        removeMenu();
        return;
      }
      removeLayer(key);
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
      //debugger;
      // if (typeof object.getData === 'function') {
      //   const htmlContent = await object.getData();
      //   setTooltipHtml(htmlContent);
      // }
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

  const isSimulationActive = () => {
    const item = activeItems.find(item => item.key.startsWith("Simulation"));
    return item ? item.value : false; // If the item exists, return its boolean value, otherwise return false
  };
  
  //const mydesignLayers = layers.filter((layer) => layer.type === "mydesign");
  layers[0].clickFunc = layerLinkHandler;

  const handleLayerSelectChangeFlood = async (event) => {
    removeLayer("flood");

    //if(iconlayerFlood!==null)
    {
      removeLayer("icon-layer-flood");
    }
    const selectedLayer = event.target.value;
    var mapid = null;
    if (selectedLayer === "500") {
      mapid = "1036053"; // Örnek mapid
    } else if (selectedLayer === "100") {
      mapid = "1036044";
    } else if (selectedLayer === "50") {
      mapid = "1036040";
    } else if (selectedLayer === "25") {
      mapid = "1036035";
    } else mapid = null;

    const layer = await getFloodLayer("flood", selectedLayer);
    setMapLayers(layer);

    if (mapid !== null) {
      const iconLayer = await createFloodDamageIconLayer(mapid, openDetailsBox); // IconLayer'ı oluştur
      setMapLayers(iconLayer);
      //seticonlayerFlood(iconLayer);
    }
  };

  return (
    <>
      <FloodMenu
        isFloodLayerSelected={isFloodLayerSelected}
        isMenuOpenFlood={isMenuOpenFlood}
        setIsMenuOpenFlood={setIsMenuOpenFlood}
        handleLayerSelectChangeFlood={handleLayerSelectChangeFlood}
      />

      <Sidenav
        color={sidenavColor}
        brandName="Black Hawk County"
        routes={layers}
        activeItems={activeItems}
        setActiveItems={setActiveItems}
      />
      <DetailsBox isOpen={isDetailsBoxOpen} details={detailsContent} onClose={closeDetailsBox} />
      {isMenuOpenDemographic && (
        <SCDemographicData
          isChartVisible={isChartVisible}
          menuContent={menuContent}
          setIsMenuOpenDemographic={setIsMenuOpenDemographic}
          setIsChartVisible={setIsChartVisible}
          setMenuContent={setMenuContent}
        />
      )}
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

        <div id="checkbox-area" style={{ width: "100%", height: "10vh", visible: "none" }}>
          {/* CheckboxLayer bileşeni sadece isCheckboxMenuOpen true olduğunda */}
          {isHighwayCheckboxMenuOpen && (
            <HighwayCheckboxComponent setMapLayers={setMapLayers} removeLayer={removeLayer} />
          )}
        </div>
        <div id="map" >
          {/* <StrictMode> */}
            <div
              id="map-container"
              style={{
                width: "100vw", // Viewport'un tamamını kaplayacak şekilde genişlik
                height: "100vh", // Viewport'un tamamını kaplayacak şekilde yükseklik
                position: "fixed", // Sabit konumlandırma, tüm ekranı kaplar
                top: 0, // Üstten sıfır konumlandırma
                left: 0, // Soldan sıfır konumlandırma
                zIndex: 0, // Haritayı diğer öğelerin altında tutmak için
              }}
            >
              { isSimulationActive() ?
            (<SCSimulation/>)  :
              (<APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  mapId={GOOGLE_MAP_ID}
                  defaultCenter={{ lat: 42.4937, lng: -92.345 }}
                  defaultZoom={12}
                  // style={{ width: '100%', height: '100%' }}
                  tilt={mapTiltAngle}
                  onClick={handleMapClick}
                  options={{streetViewControl: false}}
                  onIdle={handleMapLoad}
                >
                  {map && (
                  <DeckGLOverlay
                    layers={[mapLayers]}
                    getTooltip={getTooltipContent}
                    interleaved={true}
                  />
                )}
                </Map>
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
                {/* <div>
                {tooltipHtml && (
                  <>
                    <div
                      id="tooltip-container"
                      style={{
                        position: "fixed", // Fixed positioning relative to the viewport
                        top: "10px", // Adjust distance from the top of the page
                        right: "10px", // Align to the right side of the page
                        backgroundColor: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                        zIndex: 9999, // Ensure it's above the map
                      }}
                      //dangerouslySetInnerHTML={{ __html: tooltipHtml}} // Inject the HTML content
                    />
                    </>
                  )
                }
                  </div> */}
                <div id="App" />
              </APIProvider>)
            }
              
            </div>
          {/* </StrictMode> */}
        </div>
      </div>
    </>
  );
}

export default Map3D;
