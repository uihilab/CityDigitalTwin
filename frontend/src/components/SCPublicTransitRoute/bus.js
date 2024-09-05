import { GeoJsonLayer } from "deck.gl";
import { IconLayer } from "@deck.gl/layers";

export async function loadBusLayer() {
  const busRoute = await fetch(`${process.env.PUBLIC_URL}/data/Bus_Route_4326.geojson`);
  if (!busRoute.ok) {
    throw new Error(`HTTP error! status: ${busRoute.status}`);
  }
  // Gelen verileri JSON formatında çözümleyin
  const bus = await busRoute.json();
  const layers = new GeoJsonLayer({
    id: "BusRoute",
    data: bus,
    pickable: true,
    getLineColor: [255, 0, 0, 255],
    getPointRadius: 90,
    getLineWidth: 8,
    getElevation: 30,
  });
  return layers;
}

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.stop_name !== undefined) {
    tooltipData += `Stop Name: ${item.stop_name}\n`;
  }
  if (item.wheelchair !== undefined) {
    tooltipData += `wheelchair: ${item.wheelchair}\n`;
  }
  return tooltipData.trim(); // Remove trailing newline
}

export async function loadBusStopLayer() {
  const busStop = await fetch(`${process.env.PUBLIC_URL}/data/busstop.geojson`);
  if (!busStop.ok) {
    throw new Error(`HTTP error! status: ${busRoute.status}`);
  }
  const stop = await busStop.json();
  const processedData = stop.features.map((feature) => {
    const item = {
      stop_name: feature.properties.stop_name,
      coordinates: feature.geometry.coordinates,
      wheelchair: feature.properties.wheelchair,
    };
    item.tooltip_data = formatTooltipData(item);
    return item;
  });

  const StopLayer = new IconLayer({
    id: "BusStop",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_map.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_publictransportation.json`,
    getIcon: (d) => "icons8-bus-100",
    sizeScale: 15,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
  });
  return StopLayer;
}

export async function removeBusLayer() {
  console.log("içinden çıktı");
}
