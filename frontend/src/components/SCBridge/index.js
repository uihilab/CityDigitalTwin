import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function BridgesgridLayer() {

  const response = await fetch(`${process.env.PUBLIC_URL }/data/iowa_bridges.geojson`);
  const data = await response.json();
  debugger;

  const layerBridges = new IconLayer({
    id: 'Bridges',
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
  return layerBridges;
}