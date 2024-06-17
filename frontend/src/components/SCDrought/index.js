import { KMLLoader } from "@loaders.gl/kml";
import { load } from "@loaders.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";

// Initial viewport settings
const INITIAL_VIEW_STATE = {
  latitude: 37.7749,
  longitude: -122.4194,
  zoom: 10,
  bearing: 0,
  pitch: 0,
};
//const dataPath = 'https://droughtmonitor.unl.edu/data/kmz/usdm_current.kmz';
//const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(dataPath);
export async function FetchDroughtData()
{
    const response = await fetch("./data/drought_map.geojson");
    const data = await response.json();
    return data;
}
// Function to convert hex color to [R, G, B, A]
const hexToRGBA = (hex, alpha = 255) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b, alpha];
    };

export async function DroughtLayer(JsonData)
{
    return new GeoJsonLayer({
        id: 'Drought',
        data: JsonData,
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: f => 10,
        getFillColor: d => hexToRGBA(d.properties.fillColor, 200), // 200 for alpha
getLineColor: d => hexToRGBA(d.properties.lineColor, 255), // 255 for full opacity

        pickable: true,
        autoHighlight: true,
        onClick: info => {
          if (info.object) {
            alert(`Clicked on ${info.object.properties.name}`);
          }
        }
      });
}