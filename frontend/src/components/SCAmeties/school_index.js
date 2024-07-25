import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function getSchoolData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/Ameties_School.geojson`);
    const data = await response.json();
    return data.features.map((feature) => ({
      coordinates: feature.geometry.coordinates,
      Name: feature.properties.name,
      Number_Student: feature.properties.numstudent,
      comment: feature.properties.comment,
    }));
  } catch (error) {
    console.error("Error fetching school data:", error);
  }
}

export const createSchoolLayer = (schoolData, setTooltip) => new IconLayer({
    id: "School",
    data: schoolData,
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
          comment: object.comment,
          number_student: object.Number_Student,
          name: object.Name,
        });
      } else {
        setTooltip(null);
      }
    },
  });
