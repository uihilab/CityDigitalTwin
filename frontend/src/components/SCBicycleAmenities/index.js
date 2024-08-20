

import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
    let tooltipData = "";
  
    if (item.AMENITY_NAME !== undefined && item.AMENITY_NAME !== null) {
      tooltipData += `Amenity Name: ${item.AMENITY_NAME}\n`;
    }
    if (item.TRAIL_NAME !== undefined && item.TRAIL_NAME !== null) {
      tooltipData += `Trail Name: ${item.TRAIL_NAME}\n`;
    }
    if (item.AMENITIES_WEBSITE !== undefined && item.AMENITIES_WEBSITE !==null) {
        tooltipData += `Amenities Websites: ${item.AMENITIES_WEBSITE}\n`;
      }
    return tooltipData.trim(); // Remove trailing newline
  }

export async function loadBicycleAmetiesLayer() {
    const ameties = await fetch(`${process.env.PUBLIC_URL}/data/bicycleameties.geojson`);
    if (!ameties.ok) {
        throw new Error(`HTTP error! status: ${ameties.status}`);
    }
    const ametiesdata = await ameties.json();
    debugger;
    const processedData = ametiesdata.features.map((feature) => {
        const item = {
        
          coordinates: feature.geometry.coordinates,
          AMENITY_NAME: feature.properties.AMENITY_NAME,
          TRAIL_NAME:feature.properties.TRAIL_NAME,
          AMENITIES_WEBSITE: feature.properties.AMENITIES_WEBSITE
      
        };
        item.tooltip_data = formatTooltipData(item);
        return item;
      });

    const AmetiesLayer = new IconLayer({
        id: "BicycleAmenities",
        data: processedData,
        pickable: true,
        iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
        iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
        getIcon: (d) => "paragon-5-orange",
        sizeScale: 15,
        getPosition: (d) => d.coordinates,
        getSize: (d) => 5,
        getTooltip: ({ object }) => object && object.tooltip_data,
        //getColor: d => [255, 0, 0],
      });
      return AmetiesLayer;
}



