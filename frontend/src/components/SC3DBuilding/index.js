import React, { useState, useEffect, useMemo, StrictMode } from "react";
import DeckGL from "@deck.gl/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import Sidenav from "examples/Sidenav";
import { useMaterialUIController } from "context";
import layers from "layers";
import { IconLayer } from "@deck.gl/layers";
import { getTrafficEventData, convertToMarkers } from "/Users/sumeyye/Documents/GitHub/SmartCity/frontend/src/components/SCEvents/TrafficEvent";
import Popup from './Popup';

const GOOGLE_MAPS_API_KEY = "AIzaSyA7FVqhmGPvuhHw2ibTjfhpy9S1ZY44o6s";
const GOOGLE_MAP_ID = "c940cf7b09635a6e";

function Map3D() {
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
  const [isCheckboxMenuOpen, setIsCheckboxMenuOpen] = useState(false);

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

  // function renderTooltip(hoverInfo) {
  //   const { object, x, y } = hoverInfo;
  //   if (hoverInfo.object) {
  //     debugger;
  //     return (
  //       <div className="tooltip interactive" style={{ left: x, top: y }}>
  //         <div key={hoverInfo.object.name}>
  //           <h5>{hoverInfo.object.name}</h5>

  //         </div>
  //         {/* {hoverInfo.object.map(({ name, year, mass, class: meteorClass }) => {
  //           return (
  //             <div key={name}>
  //               <h5>{name}</h5>
  //               <div>Year: {year || "unknown"}</div>
  //               <div>Class: {meteorClass}</div>
  //               <div>Mass: {mass}g</div>
  //             </div>
  //           );
  //         })} */}
  //       </div>
  //     );
  //   }

  //   if (!object) {
  //     return null;
  //   }

  //   return object.cluster ? (
  //     <div className="tooltip" style={{ left: x, top: y }}>
  //       {object.point_count} records
  //     </div>
  //   ) : (
  //     <div className="tooltip" style={{ left: x, top: y }}>
  //       {object.name} {object.year ? `(${object.year})` : ""}
  //     </div>
  //   );
  // }
  // const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

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

      const newLayers = mapLayers.slice();
      newLayers.push(layerEvent);
      setMapLayers(newLayers);

      // debugger;
      // return (
      //   <DeckGL >
      //     <Map reuseMaps mapLib={maplibregl} mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      //     {hoverInfo && renderTooltip(hoverInfo)}
      //   </DeckGL>
      // );
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  }

  const CheckboxLayer = ({ handleCheckboxChange, checkboxState }) => {
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
            name="electricGrid"
            checked={checkboxState.electricGrid}
            onChange={handleCheckboxChange}
          />
          Electric Grid
        </label>
        <br />
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            name="transEvents"
            checked={checkboxState.transEvents}
            onChange={handleCheckboxChange}
          />
          Transportation Events
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            name="publicTransitRoutes"
            checked={checkboxState.publicTransitRoutes}
            onChange={handleCheckboxChange}
          />
          Public Transit Routes
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
      //mapLayers[foundIndex].visible = false;
      mapLayers.splice(foundIndex, 1);
      const newLayers = mapLayers.slice();
      setMapLayers(newLayers);
      // overlay.setProps({ layers: mapLayers });
      // overlay.setMap(null);
      // overlay.setMap(map);
    }
  }

  // Checkbox durumlarını güncellemek için bir fonksiyon
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxState(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  // PublicTransitRoutes linkine tıklandığında checkbox menüsünü açacak fonksiyon
  const handlePublicTransitRoutesClick = (open) => {
    setIsCheckboxMenuOpen(open);
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
      if (key == "PublicTransitRoutes" && isCheckboxMenuOpen ==false) {
        debugger;
        handlePublicTransitRoutesClick(true);
        return;
      }

      await loadLayer(key, dataPath);

    } else {
      if(isCheckboxMenuOpen ==true)
      {
        debugger;
        handlePublicTransitRoutesClick(false);
        return;
      }
      
      removeLayer(key);
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
     
       {/* CheckboxLayer bileşeni sadece isCheckboxMenuOpen true olduğunda */}
  { isCheckboxMenuOpen && (

    <CheckboxLayer handleCheckboxChange={handleCheckboxChange} checkboxState={checkboxState} />
  )}
        <div id="map" style={{ width: "100%", height: "90vh" }}>
          <StrictMode>
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <DeckGL
                initialViewState={{
                  longitude: -92.3452489,
                  latitude: 42.4935949,
                  zoom: 19,
                  heading: 100,
                  pitch: 45,
                }}
                controller
                layers={[mapLayers, scatterplotLayer]}
                getTooltip={({ object }) => object && `${object.name}`}
              >
                <Map mapId={GOOGLE_MAP_ID} />
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