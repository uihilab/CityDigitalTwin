
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import { geoJSON } from 'leaflet';

const INITIAL_VIEW_STATE = {
  longitude: -93.5,
  latitude: 41.6,
  zoom: 6,
  pitch: 0,
  bearing: 0,
};
const risk005url = "https://programs.iowadnr.gov/geospatial/rest/services/SurfaceWaters/FloodRisk005yr/MapServer?f=pjson";

 export async function loadArcGISData() {
   const response = await fetch(risk005url);
   debugger;
   const json = await response.json();
   const layers = json.layers.map(layer => ({
     ...layer,
     url: `https://programs.iowadnr.gov/geospatial/rest/services/SurfaceWaters/FloodRisk005yr/MapServer/${layer.id}`,
   }));
   const floodplainLayer = layers.find(layer => layer.name === 'Floood Depth 5 Year');
   debugger;
   FloodLayer(floodplainLayer);
   return floodplainLayer;
 }

//  export async function loadFloodRiskData(data) {
//    try {

//      // Process the data as needed
//      console.log('Flood Risk Data:', data);
//      return FloodLayer(data);
//      return data;
//    } catch (error) {
//      console.error('Error loading flood risk data:', error);
//      throw error;
//    }
//  }


export async function FloodLayer(floodplainLayer) {

  const floodlayer = new TileLayer({
    id: 'Flood',
    data: floodplainLayer.url,
    minZoom: 0,
    maxZoom: 23,
    tileSize: 256,

    renderSubLayers: props => {
      const {
        bbox: { west, south, east, north }
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: `${floodplainLayer.url}/export?bbox=${west},${south},${east},${north}&bboxSR=3857&size=256,256&imageSR=3857&format=png32&transparent=true&f=image`,
        bounds: [west, south, east, north]
      });
    },
    pickable: true
  });
  return floodlayer;
  debugger;
};



