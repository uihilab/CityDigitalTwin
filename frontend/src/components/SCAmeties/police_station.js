import { IconLayer } from "@deck.gl/layers";

// Function to format the tooltip data for police stations
function formatTooltipData(item) {
  let tooltipData = '';

  if (item.policestations_name !== undefined) {
    tooltipData += `Name: ${item.policestations_name}\n`;
  }
  if (item.policestations_city !== undefined) {
    tooltipData += `City: ${item.policestations_city}\n`;
  }
  if (item.policestations_phonenumber !== undefined) {
    tooltipData += `Phone Number: ${item.policestations_phonenumber}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

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

      item.tooltip_data = formatTooltipData(item);
      return item;
    });
  } catch (error) {
    console.error("Error fetching police station data:", error);
  }
}

export const createPoliceStationsLayer = (policeData, setTooltip) => new IconLayer({
  id: "PoliceStations",
  data: policeData,
  pickable: true,
  iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
  iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
  getIcon: (d) => "paragon-3-blue",
  sizeScale: 10,
  getPosition: (d) => d.coordinates,
  getSize: (d) => 3, // Adjust the icon size
  onHover: ({ object, x, y }) => {
    if (object) {
      setTooltip({
        x,
        y,
        tooltip_data: object.tooltip_data,
      });
    } else {
      setTooltip(null);
    }
  },
});

