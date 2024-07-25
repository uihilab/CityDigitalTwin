import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function RailwayBridgesLayer() {

  const response = await fetch(`${process.env.PUBLIC_URL }/data/railwaybridge.geojson`);
  const data = await response.json();
  debugger;

  const layerRailwayBridges = new IconLayer({
    id: 'RailBridge',
    data: data.features,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL }/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL }/icons/icon_atlas_map.json`,
    getIcon: d => 'paragon-5-orange',
    sizeScale: 15,
    getPosition: d => d.geometry.coordinates,
    getSize: d => 5,
    //getColor: d => [255, 0, 0],
  });
  return layerRailwayBridges;
}