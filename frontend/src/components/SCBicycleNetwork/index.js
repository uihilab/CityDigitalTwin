
import { GeoJsonLayer } from 'deck.gl';
import { IconLayer } from "@deck.gl/layers";

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

// function formatTooltipDataInfo(item) {
//     let tooltipData = "";
  
//     if (item.COUNTY_NAME !== undefined) {
//       tooltipData += `County Name: ${item.COUNTY_NAME}\n`;
//     }
//     if (item.CITY_NAME !== undefined) {
//       tooltipData += `City Name: ${item.CITY_NAME}\n`;
//     }
//     if (item.LENGTH_MILE !== undefined) {
//         tooltipData += `Lenght Mile: ${item.LENGTH_MILE}\n`;
//     }
//     if (item.SURF_DESC !== undefined) {
//         tooltipData += `Surface Description: ${item.SURF_DESC}\n`;
//     }
//     if (item.STATUS_DESC !== undefined) {
//         tooltipData += `Status Description: ${item.STATUS_DESC}\n`;
//     }
//     if (item.Shape__Length !== undefined) {
//         tooltipData += `Shape Length: ${item.Shape__Length}\n`;
//     }

//     return tooltipData.trim(); // Remove trailing newline
//   }

// export async function loadBicycleNetworkInfoLayer() {
//     const bicycle = await fetch(`${process.env.PUBLIC_URL}/data/bicycle.geojson`);
//     if (!bicycle.ok) {
//         throw new Error(`HTTP error! status: ${bicycle.status}`);
//     }
//     const bicyclenetwork = await bicycle.json();
//     debugger;
//     const processedData = bicyclenetwork.features.map((feature) => {
//         const item = {
        
//           coordinates: feature.geometry.coordinates,
//           CITY_NAME: feature.properties.CITY_NAME,
//           COUNTY_NAME: feature.properties.COUNTY_NAME,
//           LENGTH_MILE: feature.properties.LENGTH_MILE,
//           SURF_DESC: feature.properties.SURF_DESC,
//           STATUS_DESC: feature.properties.STATUS_DESC,
//           Shape__Length: feature.properties.Shape__Length
      
//         };
//         item.tooltip_data = formatTooltipDataInfo(item);
//         return item;
//       });

//     const BicycleLayer = new IconLayer({
//         id: "BicycleNetwork",
//         data: processedData,
//         pickable: true,
//         iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
//         iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
//         getIcon: (d) => "paragon-3-blue",
//         sizeScale: 15,
//         getPosition: (d) => d.coordinates,
//         getSize: (d) => 5,
//         getTooltip: ({ object }) => object && object.tooltip_data,
//         //getColor: d => [255, 0, 0],
//       });
//       return BicycleLayer;
// }

