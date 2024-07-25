import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function getPolicestationData() {
  try {
    debugger;
    const response = await fetch(`${process.env.PUBLIC_URL }/data/policestation.geojson`);
    const data = await response.json();
    return data.features.map((feature) => ({
      coordinates: feature.geometry.coordinates,
      policestations_name: feature.properties.name,
      policestations_city: feature.properties.city,
      policestations_phonenumber: feature.properties.phonenumbe,
    }));
  } catch (error) {
    console.error("Error fetching school data:", error);
  }
}

export const createPoliceStationsLayer = (policeData, setTooltip) => {
  debugger;
  return new IconLayer({
    id: "PoliceStations",
    data: policeData,
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
          policestations_name: object.policestations_name,
          policestations_city: object.policestations_city,
          policestations_phonenumber: object.policestations_phonenumber,
        });
      } else {
        setTooltip(null);
      }
    },
  });
};
