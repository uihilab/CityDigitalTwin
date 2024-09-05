import { GeoJsonLayer } from "@deck.gl/layers";
import {COORDINATE_SYSTEM} from '@deck.gl/core';

function formatTooltipData(item) {
  if(item)
  {
    let tooltipData = "";
  
    if (item.occ_cls !== undefined) {
      tooltipData += `Occupancy Class: ${item.occ_cls}\n`;
    }
    if (item.prim_occ !== undefined) {
      tooltipData += `Primary Occupancy: ${item.prim_occ}\n`;
    }
    if (item.prod_date !== undefined) {
      tooltipData += `Production Date: ${item.prod_date}\n`;
    }
    if (item.prop_addr !== undefined) {
      tooltipData += `Address: ${item.prop_addr}\n`;
    }
    if (item.prop_city !== undefined) {
      tooltipData += `City: ${item.prop_city}\n`;
    }
    if (item.prop_zip !== undefined) {
      tooltipData += `ZIP Code: ${item.prop_zip}\n`;
    }
    if (item.sqmeters !== undefined) {
      tooltipData += `Area (sq meters): ${item.sqmeters}`;
    }
  
    return tooltipData.trim(); // Remove trailing newline
  }
 return null;
}

export async function BuildingLayer() {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/waterloo_buildings_wgs84.geojson`);
  const data = await response.json();

  const processedData = data.features.map((feature) => {
    const item = {
      name: feature.properties.name,
      address: `${feature.properties['addr:housenumber']} ${feature.properties['addr:street']}`,
      city: feature.properties['addr:city'],
      state: feature.properties['addr:state'],
      postcode: feature.properties['addr:postcode'],
      building_use: feature.properties['building:use'],
      website: feature.properties.website,
      phone: feature.properties.phone,
    };

    item.tooltip_data = formatTooltipData(item);
    return { ...feature, properties: { ...feature.properties, tooltip_data: item.tooltip_data } };
  });

  const layerBuilding = new GeoJsonLayer({
    id: "Buildings",
    data: { ...data, features: processedData },
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
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    coordinateOrigin: [42.4942408813, -92.34170190987821], // Haritanın referans noktası
    wireframe: true,
  });

  return layerBuilding;
}
