import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { IconLayer } from "@deck.gl/layers";
import { getWeatherData, convertToMarkers } from "./WeatherData.js"; // WeatherData.js dosyasını kullanıyorum. Değiştirin
import { FetchWeatherData} from "./Weather.js";

import IconClusterLayer from "./icon-cluster-layer.js";

const MAP_VIEW = new MapView({ repeat: true });
const INITIAL_VIEW_STATE = {
  longitude: -92.34208776485049,
  latitude: 42.493790878436535,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
};
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

function renderTooltip(info) {
  const { object, x, y } = info;

  if (info) {
    return (
      <div className="tooltip interactive" style={{ left: x, top: y }}>
        {info.map(({ coordinates, relative_humidity_2m, temperature_2m, time: time }) => {
          return (
            <div key={coordinates}>
              <h5>{coordinates}</h5>
              <div>relative_humidity_2m: {relative_humidity_2m || "unknown"}</div>
              <div>temperature_2m: {temperature_2m}</div>
              <div>time: {time}g</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (!object) {
    return null;
  }

  return object.cluster ? (
    <div className="tooltip" style={{ left: x, top: y }}>
      {object.point_count} records
    </div>
  ) : (
    <div className="tooltip" style={{ left: x, top: y }}>
      {object.coordinates} {object.time ? `(${object.time})` : ""}
    </div>
  );
}

/* eslint-disable react/no-deprecated */
export default function App({
  data = FetchWeatherData(latitude = 42.569663, longitude = -92.479646), // Bu alanı güncelleyebilirsiniz
  iconAtlas = "./data/location-icon-atlas.png",
  showCluster = true,
  mapStyle = MAP_STYLE,
}) {
  const [hoverInfo, setHoverInfo] = useState({});
  const [weatherData, setWeatherData] = useState({}); // WeatherData.js dosyasından gelen verileri saklamak için state

  const hideTooltip = () => {
    setHoverInfo({});
  };

  const expandTooltip = (info) => {
    if (info.picked && showCluster) {
      setHoverInfo(info);
    } else {
      setHoverInfo({});
    }
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getWeatherData(); // WeatherData.js dosyasından verileri al

      setWeatherData([data]);
    }
    fetchData();
  }, []);

  const layerProps = {
    data: weatherData, // WeatherData.js dosyasındaki verileri işleyin
    pickable: true,
    getPosition: (d) => d.coordinates,
    iconAtlas,
    iconMapping: {
      marker: { x: 0, y: 0, width: 128, height: 128 }
    },
    onHover: !hoverInfo.objects && setHoverInfo,
  };

  const layer = showCluster
    ? new IconClusterLayer({ ...layerProps, id: "icon-cluster", sizeScale: 40 })
    : new IconLayer({
        ...layerProps,
        id: "icon",
        getIcon: (d) => "marker",
        sizeUnits: "meters",
        sizeScale: 2000,
        sizeMinPixels: 6,
      });

  return (
    <DeckGL
      layers={[layer]}
      views={MAP_VIEW}
      initialViewState={INITIAL_VIEW_STATE}
      controller={{ dragRotate: false }}
      onViewStateChange={hideTooltip}
      onClick={expandTooltip}
      height="100vh"
      width="100vw"
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />

      {renderTooltip(hoverInfo)}
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
