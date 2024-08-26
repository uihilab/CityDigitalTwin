import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.county !== undefined) {
    tooltipData += `County: ${item.county}\n`;
  }
  if (item.depth !== undefined) {
    tooltipData += `Depth: ${item.depth} meters\n`;
  }
  if (item.well_type !== undefined) {
    tooltipData += `Well Type: ${item.well_type}\n`;
  }
  if (item.location !== undefined) {
    tooltipData += `Location: ${item.location}\n`;
  }
  if (item.owner_name !== undefined) {
    tooltipData += `Owner: ${item.owner_name}\n`;
  }
  if (item.other_info !== undefined) {
    tooltipData += `Other Info: ${item.other_info}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

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
        owner_name: feature.properties.OWNER_NAME,
        other_info: feature.properties.OTHER_INFO,
      };

      item.tooltip_data = formatTooltipData(item);
      return item;
    });
  } catch (error) {
    console.error("Error fetching well data:", error);
  }
}

export const createWellLayer = (wellData, setTooltip) =>
  new IconLayer({
    id: "WellLayer",
    data: wellData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => "well",
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
