
import { GeoJsonLayer } from 'deck.gl';

export async function loadBusLayer() {
   const response = await fetch(`${process.env.PUBLIC_URL}/data/Bus_Route_4326.geojson`);
   if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   // Gelen verileri JSON formatında çözümleyin
   const data = await response.json();
    const layers =  new GeoJsonLayer({
        id: 'Bus_Info',
        data: data,
        pickable: true,
        getLineColor: [255, 0, 0, 255],
        getPointRadius: 90,
        getLineWidth: 2,
        getElevation: 30,
      });
      return layers;

}

export async function removeBusLayer() {
   console.log("içinden çıktı");
}

