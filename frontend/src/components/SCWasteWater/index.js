import { IconLayer } from "@deck.gl/layers";

export async function getWasteWaterData() {
  try {
    debugger;
    const response = await fetch(`${process.env.PUBLIC_URL}/data/wastewater.geojson`);
    const data = await response.json();
    return data.features.map((feature) => ({
      wastewater_name: feature.properties.name,
      coordinates: feature.geometry.coordinates,
      wastewater_city: feature.properties.city,
      wastewater_address: feature.properties.address,
    }));
  } catch (error) {
    console.error("Error fetching care facilities data:", error);
  }
}

export const createWasteWaterLayer = (wastewaterData, setTooltip) => {
  debugger;
  const wastewaterLayer = new IconLayer({
    id: "wastewater",
    data: wastewaterData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: (d) => "paragon-3-blue",
    sizeScale: 10,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // İkon boyutunu ayarlayın
    onHover: ({ object, x, y }) => {
      debugger;
      if (object) {
        setTooltip({
          x,
          y,
          wastewater_name: object.name,
          wastewater_city: object.city,
          wastewater_address: object.address,
        });
      } else {
        setTooltip(null);
      }
    },
  });
  return wastewaterLayer;
};
