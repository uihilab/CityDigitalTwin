import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { IconLayer } from "@deck.gl/layers";
import { getTrafficEventData, convertToMarkers } from "./TrafficEvent.js";

import IconClusterLayer from "./icon-cluster-layer";

const MAP_VIEW = new MapView({ repeat: true });
const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

function renderTooltip(info) {
  const { object, x, y } = info;

  if (info.objects) {
    return (
      <div className="tooltip interactive" style={{ left: x, top: y }}>
        {info.objects.map(({ name, year, mass, class: meteorClass }) => {
          return (
            <div key={name}>
              <h5>{name}</h5>
              <div>Year: {year || "unknown"}</div>
              <div>Class: {meteorClass}</div>
              <div>Mass: {mass}g</div>
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
      {object.name} {object.year ? `(${object.year})` : ""}
    </div>
  );
}

/* eslint-disable react/no-deprecated */
export default function App({
  data = "data/events.json",
  iconMapping = "data/location-icon-mapping.json",
  iconAtlas = "data/location-icon-atlas.png",
  showCluster = true,
  mapStyle = MAP_STYLE,
}) {
  const [hoverInfo, setHoverInfo] = useState({});
  const [eventData, setEventData] = useState({});
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
      const data = await getTrafficEventData();

      setEventData(data);
    }
    fetchData();
  }, []);

  const layerProps = {
    data,
    pickable: true,
    getPosition: (d) => d.coordinates,
    iconAtlas,
    iconMapping,
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
      controller={{ dragRotate: false }}ts/index.
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
