
import { GeoJsonLayer } from "@deck.gl/layers";
export async function BuildingLayer() {
  const response = await fetch(`${process.env.PUBLIC_URL  }/data/waterloo_buildings_wgs84.geojson`);
    const data = await response.json();

    //var filteredData = data.features.filter(feature => feature.properties && feature.properties.occ_cls && feature.properties.prim_occ);

    const layerBuilding = new GeoJsonLayer({
      id: "Buildings",
      data: data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [140, 170, 180, 200],
      getLineColor: [0, 0, 0],
      getLineWidth: 1,
      getElevation: 30,
      onHover: ({ object, x, y }) => {
      }
    });
    return layerBuilding;
  }