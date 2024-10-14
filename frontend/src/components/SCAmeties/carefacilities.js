import { IconLayer } from "@deck.gl/layers";

// Function to format the tooltip data for care facilities
function formatTooltipData(item) {
  let tooltipData = "";

  if (item.carefacilities_name !== undefined) {
    tooltipData += `Name: ${item.carefacilities_name}\n`;
  }
  if (item.carefacilities_city !== undefined) {
    tooltipData += `City: ${item.carefacilities_city}\n`;
  }
  if (item.carefacilities_address !== undefined) {
    tooltipData += `Address: ${item.carefacilities_address}\n`;
  }
  if (item.carefacilities_phonenumber !== undefined) {
    tooltipData += `Phone Number: ${item.carefacilities_phonenumber}\n`;
  }
  if (item.carefacilities_numbeds !== undefined) {
    tooltipData += `Number of Beds: ${item.carefacilities_numbeds}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

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

      item.tooltip_data = formatTooltipData(item);
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
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.tooltip_data);
      }
    },
  });
