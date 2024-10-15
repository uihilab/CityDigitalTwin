import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  AMENITY_NAME: "Amenity Name",
  TRAIL_NAME: "Trail Name",
  AMENITIES_WEBSITE: "Amenities Website",
};

export async function loadBicycleAmetiesLayer(openDetailsBox) {
  const ameties = await fetch(`${process.env.PUBLIC_URL}/data/bicycleameties.geojson`);
  if (!ameties.ok) {
    throw new Error(`HTTP error! status: ${ameties.status}`);
  }
  const ametiesdata = await ameties.json();
  const processedData = ametiesdata.features.map((feature) => {
    const item = {
      coordinates: feature.geometry.coordinates,
      AMENITY_NAME: feature.properties.AMENITY_NAME,
      TRAIL_NAME: feature.properties.TRAIL_NAME,
      AMENITIES_WEBSITE: feature.properties.AMENITIES_WEBSITE,
    };
    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });

  const AmetiesLayer = new IconLayer({
    id: "BicycleAmenities",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_map.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_publictransportation.json`,
    getIcon: (d) => "icons8-bicycle-48",
    sizeScale: 5,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 6,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
    onClick: (info, event) => {
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
  return AmetiesLayer;
}
