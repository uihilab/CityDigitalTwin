import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.e_name !== undefined) {
    tooltipData += `Name: ${item.e_name}\n`;
  }
  if (item.e_city !== undefined) {
    tooltipData += `City: ${item.e_city}\n`;
  }
  if (item.e_owner !== undefined) {
    tooltipData += `Owner: ${item.e_owner}\n`;
  }
  if (item.e_contact !== undefined) {
    tooltipData += `Contact: ${item.e_contact}\n`;
  }
  if (item.e_capacity !== undefined) {
    tooltipData += `Capacity: ${item.e_capacity}\n`;
  }
  if (item.e_cost !== undefined) {
    tooltipData += `Cost: ${item.e_cost}\n`;
  }
  if (item.e_comment !== undefined) {
    tooltipData += `Comment: ${item.e_comment}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

export async function getElectricData() {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/electiricpowerfacilities.geojson`);
  const data = await response.json();

  const result = data.features.map((feature) => {
    const item = {
      e_name: feature.properties.name,
      coordinates: feature.geometry.coordinates,
      e_city: feature.properties.city,
      e_owner: feature.properties.owner,
      e_contact: feature.properties.contact,
      e_capacity: feature.properties.capacity,
      e_cost: feature.properties.cost,
      e_comment: feature.properties.comment,
    };
    item.tooltip_data = formatTooltipData(item);
    return item;
  });

  return result;
}

export const createElectricPowerLayer = (powerData, setTooltip) => {
  const powerLayer = new IconLayer({
    id: "Electricpower",
    data: powerData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => "s4",
    sizeScale: 10,
    getPosition: d => d.coordinates,
    getSize: d => 3, // İkon boyutunu ayarlayın
    onHover: ({ object, x, y }) => {
      if (object) {
        const tooltipData = formatTooltipData(object);
        setTooltip({
          x,
          y,
          tooltip_data: tooltipData,
        });
      }
    },
  });
  return powerLayer;
};
