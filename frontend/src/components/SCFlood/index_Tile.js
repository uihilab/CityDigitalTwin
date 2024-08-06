import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

async function getFloodLayer() {
  const subLayerIds = await fetchAvailableLayerIds();

  if (subLayerIds.length === 0) {
    console.error('No available sublayers found.');
    return null;
  }

  const layerIdsString = subLayerIds.join(',');

  const tileSize = 2048;  // Adjust as needed
  return new TileLayer({
    id: 'arcgis-tile-layer',
    data: [],
    minZoom: 0,
    maxZoom: 23,
    tileSize: tileSize,
    renderSubLayers: props => {
      if (!props || !props.tile || !props.tile._bbox) {
        console.error('Invalid props passed to renderSubLayers:', props);
        return null;
      }

      const {
        tile: { _bbox, x, y, z }
      } = props;

      const west = _bbox.west;
      const south = _bbox.south;
      const east = _bbox.east;
      const north = _bbox.north;
      const imageUrl = `https://worker-floodmap-proxy.baran-account587.workers.dev/?west=${west}&south=${south}&east=${east}&north=${north}&layerIdsString=${layerIdsString}&tileSize=${tileSize}`;
      //https://worker-floodmap-proxy.baran-account587.workers.dev/?west=-93.515625&south=42.03297433244139&east=-92.8125&north=42.5530802889558&layerIdsString=0%2C1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14%2C15%2C16%2C17%2C18%2C19%2C20%2C21%2C22%2C23%2C24%2C25%2C26%2C27%2C28%2C29%2C30%2C31%2C32%2C33%2C34%2C35%2C36%2C37%2C38%2C39%2C40%2C41%2C42%2C43%2C44%2C45%2C46%2C47%2C48%2C49%2C50%2C51%2C52%2C53%2C54%2C55&tileSize=2048

      return new BitmapLayer({
        id: `${props.id}-bitmap-${x}-${y}-${z}`,
        data: null,
        image: imageUrl,
        bounds: [west, south, east, north]
      });
    }
  });
}

async function fetchAvailableLayerIds() {
  const url = 'https://programs.iowadnr.gov/geospatial/rest/services/SurfaceWaters/FloodRisk200yr/MapServer?f=json';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.layers.map(layer => layer.id);
  } catch (error) {
    console.error('Failed to fetch available layers:', error);
    return [];
  }
}

async function fetchImageUrl(west, south, east, north, layerIdsString, tileSize) {
  return new Promise((resolve, reject) => {
    const callbackName = `ags_jsonp_${Math.floor(Math.random() * 100000)}`;
    window[callbackName] = (response) => {
      if (response.href) {
        resolve(response.href);
      } else {
        reject('No image URL in response');
      }
      delete window[callbackName];
    };
    const url = `https://programs.iowadnr.gov/geospatial/rest/services/SurfaceWaters/FloodRisk200yr/MapServer/export?f=json&bbox=${west},${south},${east},${north}&size=${tileSize},${Math.round(tileSize * (north - south) / (east - west))}&imageSR=102113&bboxSR=4326&layers=show:${layerIdsString}&transparent=true&callback=${callbackName}`;

    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  });
}

export { getFloodLayer };
