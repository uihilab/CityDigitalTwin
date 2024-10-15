import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  firestations_name: "Name",
  firestations_city: "City",
  firestations_address: "Address",
};

export async function getFirestationData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/firestation.geojson`);
    const data = await response.json();
    return data.features.map((feature) => {
      const item = {
        coordinates: feature.geometry.coordinates,
        firestations_name: feature.properties.name,
        firestations_city: feature.properties.city,
        firestations_address: feature.properties.address,
      };

      item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
      item.details_data = formatObjectData(item, keyMappings, "details");
      return item;
    });
  } catch (error) {
    console.error("Error fetching fire station data:", error);
  }
}

export const createFireStationsLayer = (fireData, openDetailsBox) => new IconLayer({
  id: "FireStations",
  data: fireData,
  pickable: true,
  iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas_ameni.png`,
  iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map_ameni.json`,
  getIcon: (d) => "Fire Station",
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
