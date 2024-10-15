import { IconLayer } from "@deck.gl/layers";

const keyMappings = {
  e_name: "Name",
  e_city: "City",
  e_owner: "Owner",
  e_contact: "Contact",
  e_capacity: "Capacity",
  e_cost: "Cost",
  e_comment: "Comment",
};

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
    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });

  return result;
}

export const createElectricPowerLayer = (powerData, openDetailsBox) => {
  const powerLayer = new IconLayer({
    id: "Electricpower",
    data: powerData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => "s4",
    sizeScale: 5,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3,
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
  return powerLayer;
};
