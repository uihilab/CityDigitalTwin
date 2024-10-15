import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  wastewater_name: "Name",
  wastewater_city: "City",
  wastewater_address: "Address",
};

export async function getWasteWaterData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/wastewater.geojson`);
    const data = await response.json();

    const result = data.features.map((feature) => {
      const item = {
        wastewater_name: feature.properties.name,
        coordinates: feature.geometry.coordinates,
        wastewater_city: feature.properties.city,
        wastewater_address: feature.properties.address,
      };
      item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
      item.details_data = formatObjectData(item, keyMappings, "details");
      return item;
    });

    return result;

  } catch (error) {
    console.error("Error fetching care facilities data:", error);
  }
}

export const createWasteWaterLayer = (wastewaterData, openDetailsBox) => {
  const wastewaterLayer = new IconLayer({
    id: "wastewater",
    data: wastewaterData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => "s5",
    sizeScale: 5,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3,
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
  return wastewaterLayer;
};
