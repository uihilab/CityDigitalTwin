import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function getElectricData() {
  console.log(process.env.PUBLIC_URL);
  debugger;
  const response = await fetch(`${process.env.PUBLIC_URL }/data/electiricpowerfacilities.geojson`);
  const data = await response.json();

  return data.features.map(feature => ({
    e_name: feature.properties.name,
    coordinates: feature.geometry.coordinates,
    e_city: feature.properties.city,
    e_owner: feature.properties.owner,
    e_contact: feature.properties.contact,
    e_capacity: feature.properties.capacity,
    e_cost: feature.properties.cost,
    e_comment: feature.properties.comment
  }));

}

export const createElectricPowerLayer = (powerData, setTooltip) => {
  debugger;
  const powerLayer = new IconLayer({
    id: 'Electricpower',
    data: powerData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL }/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL }/icons/icon_atlas_map.json`,
    getIcon: d => 'paragon-3-blue',
    sizeScale: 10,
    getPosition: d => d.coordinates,
    getSize: d => 3, // İkon boyutunu ayarlayın
    onHover: ({ object, x, y }) => {
      if (object) {
        setTooltip({
          x,
          y,
          e_name: object.name,
          e_city: object.city,
          e_owner: object.owner,
          e_contact: object.contact,
          e_capacity: object.capacity,
          e_cost: object.cost,
          e_comment: object.comment
        });
      } else {
        setTooltip(null);
      }
    },
  });
  return powerLayer;
};