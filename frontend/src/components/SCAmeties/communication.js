import { IconLayer } from "@deck.gl/layers";

// Function to format the tooltip data for communication facilities
function formatTooltipData(item) {
  let tooltipData = '';

  if (item.comm_city !== undefined) {
    tooltipData += `City: ${item.comm_city}\n`;
  }
  if (item.comm_owner !== undefined) {
    tooltipData += `Owner: ${item.comm_owner}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

export async function getCommunicationData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/communicationfacilities.geojson`);
    const data = await response.json();
    return data.features.map((feature) => {
      const item = {
        coordinates: feature.geometry.coordinates,
        comm_city: feature.properties.city,
        comm_owner: feature.properties.owner,
      };

      item.tooltip_data = formatTooltipData(item);
      return item;
    });
  } catch (error) {
    console.error("Error fetching communication facilities data:", error);
  }
}

export const createCommunicationLayer = (communicationData, setTooltip) => new IconLayer({
  id: "Communication",
  data: communicationData,
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
