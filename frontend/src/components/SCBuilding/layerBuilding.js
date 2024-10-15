import { GeoJsonLayer } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  occ_cls: "Occupancy Class",
  prim_occ: "Primary Occupancy",
  prod_date: "Production Date",
  prop_addr: "Address",
  prop_city: "City",
  prop_zip: "ZIP Code",
  sqmeters: "Area (sq meters)",
};

export async function BuildingLayer(openDetailsBox) {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/waterloo_buildings_wgs84.geojson`);
  const data = await response.json();

  const processedData = data.features.map((feature) => {
    const item = {
      name: feature.properties.name,
      address: `${feature.properties["addr:housenumber"]} ${feature.properties["addr:street"]}`,
      city: feature.properties["addr:city"],
      state: feature.properties["addr:state"],
      postcode: feature.properties["addr:postcode"],
      building_use: feature.properties["building:use"],
      website: feature.properties.website,
      phone: feature.properties.phone,
    };

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
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
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
    onClick: (info, event) => {
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });

  return layerBuilding;
}
