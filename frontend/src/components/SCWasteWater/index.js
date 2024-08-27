import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.wastewater_name !== undefined) {
    tooltipData += `Name: ${item.wastewater_name}\n`;
  }
  if (item.wastewater_city !== undefined) {
    tooltipData += `City: ${item.wastewater_city}\n`;
  }
  if (item.wastewater_address !== undefined) {
    tooltipData += `Address: ${item.wastewater_address}\n`;
  }
  return tooltipData.trim(); // Remove trailing newline
}

export async function getWasteWaterData() {
  try {
    debugger;
    const response = await fetch(`${process.env.PUBLIC_URL}/data/wastewater.geojson`);
    const data = await response.json();

    const result = data.features.map((feature) => {
      const item = {
        wastewater_name: feature.properties.name,
        coordinates: feature.geometry.coordinates,
        wastewater_city: feature.properties.city,
        wastewater_address: feature.properties.address,
      };
      item.tooltip_data = formatTooltipData(item);
      return item;
    });

    return result;

  } catch (error) {
    console.error("Error fetching care facilities data:", error);
  }
}

export const createWasteWaterLayer = (wastewaterData, setTooltip) => {
  const wastewaterLayer = new IconLayer({
    id: "wastewater",
    data: wastewaterData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => "s5",
    sizeScale: 10,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // İkon boyutunu ayarlayın
    onHover: ({ object, x, y }) => {
      if (object) {
        const tooltipData = formatTooltipData(object);
        setTooltip({
          x,
          y,
          tooltip_data: tooltipData,
        });
      } else {
        setTooltip(null);
      }
    },
  });
  return wastewaterLayer;
};
