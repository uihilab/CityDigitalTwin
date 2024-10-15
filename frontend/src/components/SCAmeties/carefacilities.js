import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "components/SC3DBuilding/formatObjectData";

const keyMappings = {
  carefacilities_name: "Name",
  carefacilities_city: "City",
  carefacilities_address: "Address",
  carefacilities_phonenumber: "Phone Number",
  carefacilities_numbeds: "Number of Beds",
};

export async function getCareFacilitiesData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/carefacilities.geojson`);
    const data = await response.json();
    return data.features.map((feature) => {
      const item = {
        coordinates: feature.geometry.coordinates,
        carefacilities_name: feature.properties.name,
        carefacilities_city: feature.properties.city,
        carefacilities_address: feature.properties.address,
        carefacilities_phonenumber: feature.properties.phonenumbe,
        carefacilities_numbeds: feature.properties.numbeds,
      };

      item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
      item.details_data = formatObjectData(item, keyMappings, "details");
      return item;
    });
  } catch (error) {
    console.error("Error fetching care facilities data:", error);
  }
}

export const createCareFacilitiesLayer = (careData, openDetailsBox) =>
  new IconLayer({
    id: "CareFacilities",
    data: careData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas_ameni.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map_ameni.json`,
    getIcon: (d) => "care-facilities",
    sizeScale: 10,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // Adjust the icon size
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
