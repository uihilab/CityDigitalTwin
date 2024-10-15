import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  plant_name: "Plant Name",
  city: "City",
  county: "County",
  operator_name: "Operator",
  fuel_type: "Fuel Type",
  capacity: "Capacity (MW)",
};

export async function ElectricgridLayer(openDetailsBox) {
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

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
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
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });

  return layerPower;
}