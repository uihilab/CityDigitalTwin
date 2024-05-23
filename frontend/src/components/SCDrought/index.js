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
    const response = await fetch("/data/drought_map.geojson");
    debugger;
    const data = await response.json();
    return data;
    // try {
    //     const response = await fetch(proxyUrl);
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok');
    //     }
    //     const arrayBuffer = await response.arrayBuffer();
        
    //     // Debug: KML dosyasının içeriğini kontrol edin
    // const textDecoder = new TextDecoder();
    // const textContent = textDecoder.decode(arrayBuffer);
    // console.log('KML File Content:', textContent); // İçeriği kontrol edin

    //  // KML içeriğinin XML formatında olduğunu doğrulayın
    //  if (!textContent.startsWith('<?xml') && !textContent.includes('<kml')) {
    //     throw new Error('Invalid KML format');
    //   }

    //     const data = await load(arrayBuffer, KMLLoader);
    //     return data;
    //   } catch (error) {
    //     console.error('Error loading or parsing KML:', error);
    //   }
}
export async function DroughtLayer(JsonData)
{
    debugger;
    return new GeoJsonLayer({
        id: 'Drought',
        data: JsonData,
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: f => 10,
        getFillColor: [255, 0, 0, 180],
        getLineColor: [255, 255, 255, 200],
        pickable: true,
        autoHighlight: true,
        onClick: info => {
          if (info.object) {
            alert(`Clicked on ${info.object.properties.name}`);
          }
        }
      });
      return geoJsonLayer;
}

//  const  Drought = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     async function fetchData() {
//       const response = await fetch('https://droughtmonitor.unl.edu/data/kmz/usdm_current.kmz'); // KMZ dosyasının yolu
//       const arrayBuffer = await response.arrayBuffer();
//       debugger;
      
//       // KMZ dosyasını açma ve içeriğini işleme
//       const zip = new JSZip();
//       const zipData = await zip.loadAsync(arrayBuffer);
      
//       // KML dosyasını bulma ve içeriğini alıp işleme
//       const kmlFile = Object.values(zipData.files).find(file => file.name.endsWith('.kml'));
//       if (kmlFile) {
//         const kmlContent = await kmlFile.async('text');
//         // KML içeriğini burada işleyin
//         console.log(kmlContent);
//         setData(kmlContent);
//       }
//     }

//     fetchData();
//   }, []);

//   const getTileUrl = (coord, zoom, id) => {
//     const use_y = (1 << zoom) - coord.y - 1;
//     return `https://iowawis.org/layers/map_tiles/res_png_img.php?src=${zoom}_${coord.x}_${use_y}&a=1&show=${id}`;
//   };

//   const layers = [
//     new TileLayer({
//       data: data,
//       minZoom: 0,
//       maxZoom: 19,
//       tileSize: 256,
//       getTileData: ({ x, y, z }) => {
//         const tileUrl = getTileUrl({ x, y }, z, 'Drought'); // Burada `YOUR_ID` ile ihtiyacınıza göre id'yi değiştirin
//         return fetch(tileUrl).then(response => response.blob());
//       },
//       renderSubLayers: props => {
//         const {
//           bbox: { west, south, east, north }
//         } = props.tile;

//         return new deck.BitmapLayer(props, {
//           data: null,
//           image: props.data,
//           bounds: [west, south, east, north]
//         });
//       }
//     })
//   ];

//   return (
//     <DeckGL
//       initialViewState={INITIAL_VIEW_STATE}
//       controller={true}
//       layers={layers}
//     >
//       <Map
//         reuseMaps
//         mapStyle="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//     </DeckGL>
//   );
// };