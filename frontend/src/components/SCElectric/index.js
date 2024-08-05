import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = '';

  if (item.plant_name !== undefined) {
    tooltipData += `Plant Name: ${item.plant_name}\n`;
  }
  if (item.city !== undefined) {
    tooltipData += `City: ${item.city}\n`;
  }
  if (item.county !== undefined) {
    tooltipData += `County: ${item.county}\n`;
  }
  if (item.operator_name !== undefined) {
    tooltipData += `Operator: ${item.operator_name}\n`;
  }
  if (item.fuel_type !== undefined) {
    tooltipData += `Fuel Type: ${item.fuel_type}\n`;
  }
  if (item.capacity !== undefined) {
    tooltipData += `Capacity (MW): ${item.capacity}\n`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

export async function ElectricgridLayer() {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/PowerPlants.json`);
  const data = await response.json();

  const processedData = data.features.map((feature) => {
    const item = {
      plant_name: feature.properties.pname,
      coordinates: feature.geometry.coordinates,
      city: feature.properties.cntyname,
      county: feature.properties.cntyname,
      operator_name: feature.properties.oprname,
      fuel_type: feature.properties.plprmfl,
      capacity: feature.properties.namepcap,
    };

    item.tooltip_data = formatTooltipData(item);
    return item;
  });

  const layerPower = new IconLayer({
    id: 'Electricgrid',
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: d => 'paragon-1-blue',
    sizeScale: 15,
    getPosition: d => d.coordinates,
    getSize: d => 5,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
  });

  return layerPower;
}