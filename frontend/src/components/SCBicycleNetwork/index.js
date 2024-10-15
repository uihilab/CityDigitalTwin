
import { GeoJsonLayer } from 'deck.gl';

export async function loadBicycleLayer() {
   const bicycleRoute = await fetch(`${process.env.PUBLIC_URL}/data/bicycle.geojson`);
   if (!bicycleRoute.ok) {
       throw new Error(`HTTP error! status: ${bicycleRoute.status}`);
   }
   // Gelen verileri JSON formatında çözümleyin
   const bicycle = await bicycleRoute.json();
    const layers =  new GeoJsonLayer({
        id: 'BicycleNetwork',
        data: bicycle,
        pickable: true,
        getLineColor: [255, 0, 0, 255],
        getPointRadius: 90,
        getLineWidth: 15,
        getElevation: 30,
      });
      return layers;

}
