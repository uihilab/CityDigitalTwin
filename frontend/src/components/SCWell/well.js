import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  county: "County",
  depth: "Depth (meters)",
  well_type: "Well Type",
  location: "Location",
  owner_name: "Owner",
};

export async function getWellData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/BlackHawkWell.geojson`);
    const data = await response.json();
    return data.features.map((feature) => {
      const item = {
        coordinates: feature.geometry.coordinates,
        county: feature.properties.COUNTY,
        depth: feature.properties.DEPTH,
        well_type: feature.properties.WELL_TYPE,
        location: feature.properties.LOCATION,
        owner_name: feature.properties.OWNER_NAME
      };

      item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
      item.details_data = formatObjectData(item, keyMappings, "details");
      return item;
    });
  } catch (error) {
    console.error("Error fetching well data:", error);
  }
}

export const createWellLayer = (wellData, openDetailsBox) =>
  new IconLayer({
    id: "WellLayer",
    data: wellData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => {
      // Check if the well type contains the word "private"
      if (d.well_type && d.well_type.toLowerCase().includes("private")) {
        return "well_red"; // Use the red icon for private wells
      }
      return "well"; // Default icon for other wells
    },
    sizeScale: 7,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // Adjust the icon size
    onClick: (info, event) => {
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
