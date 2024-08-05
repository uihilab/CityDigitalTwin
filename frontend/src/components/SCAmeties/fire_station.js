import { IconLayer } from "@deck.gl/layers";

// Function to format the tooltip data for fire stations
function formatTooltipData(item) {
  let tooltipData = '';

  if (item.firestations_name !== undefined) {
    tooltipData += `Name: ${item.firestations_name}\n`;
  }
  if (item.firestations_city !== undefined) {
    tooltipData += `City: ${item.firestations_city}\n`;
  }
  if (item.firestations_address !== undefined) {
    tooltipData += `Address: ${item.firestations_address}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

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

      item.tooltip_data = formatTooltipData(item);
      return item;
    });
  } catch (error) {
    console.error("Error fetching fire station data:", error);
  }
}

export const createFireStationsLayer = (fireData, setTooltip) => new IconLayer({
  id: "FireStations",
  data: fireData,
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
