import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  policestations_name: "Name",
  policestations_city: "City",
  policestations_phonenumber: "Phone Number",
};

export async function getPolicestationData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/policestation.geojson`);
    const data = await response.json();
    return data.features.map((feature) => {
      const item = {
        coordinates: feature.geometry.coordinates,
        policestations_name: feature.properties.name,
        policestations_city: feature.properties.city,
        policestations_phonenumber: feature.properties.phonenumbe,
      };

      item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
      item.details_data = formatObjectData(item, keyMappings, "details");
      return item;
    });
  } catch (error) {
    console.error("Error fetching police station data:", error);
  }
}

export const createPoliceStationsLayer = (policeData, openDetailsBox) =>
  new IconLayer({
    id: "PoliceStations",
    data: policeData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas_ameni.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map_ameni.json`,
    getIcon: (d) => "police station",
    sizeScale: 10,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // Adjust the icon size
    onClick: (info, event) => {
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
