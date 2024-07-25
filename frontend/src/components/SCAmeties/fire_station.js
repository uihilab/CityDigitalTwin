import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function getFirestationData() {
  try {
    debugger;
    const response = await fetch(`${process.env.PUBLIC_URL }/data/firestation.geojson`);
    const data = await response.json();
    return data.features.map((feature) => ({
      coordinates: feature.geometry.coordinates,
      firestations_name: feature.properties.name,
      firestations_city: feature.properties.city,
      firestations_address: feature.properties.address,
    }));
  } catch (error) {
    console.error("Error fetching school data:", error);
  }
}

export const createFireStationsLayer = (fireData, setTooltip) => {
  debugger;
  return new IconLayer({
    id: "FireStations",
    data: fireData,
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
          firestations_name: object.firestations_name,
          firestations_city: object.firestations_city,
          firestations_address: object.firestations_address,
        });
      } else {
        setTooltip(null);
      }
    },
  });
};
