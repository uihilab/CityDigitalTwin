import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function ElectricgridLayer() {

  const response = await fetch("/data/PowerPlants.json");
  const data = await response.json();
  // const layerPower = new GeoJsonLayer({
  //   id: "Electricgrid",
  //   data,
  //   pickable: true,
  //   stroked: false,
  //   filled: true,
  //   extruded: true,
  //   pointType: "circle",
  //   lineWidthScale: 20,
  //   lineWidthMinPixels: 2,
  //   getFillColor: [0, 160, 180, 200],
  //   // getLineColor: d => colorToRGBArray(d.properties.color),
  //   getPointRadius: 100,
  //   getLineWidth: 1,
  //   getElevation: 30,
  // });

  const layerPower = new IconLayer({
    id: 'Electricgrid',
    data: data.features,
    pickable: true,
    iconAtlas: '/icons/icon_atlas.png',
    iconMapping: '/icons/icon_atlas_map.json',
    getIcon: d => 'paragon-1-blue',
    sizeScale: 15,
    getPosition: d => d.geometry.coordinates,
    getSize: d => 5,
    //getColor: d => [255, 0, 0],
  });
  return layerPower;
}