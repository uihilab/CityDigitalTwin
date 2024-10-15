import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  Name: "Name",
  Number_Student: "Number of Students",
  comment: "Type",
};

export async function getSchoolData() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/Ameties_School.geojson`);
    const data = await response.json();
    return data.features.map((feature) => {
      const item = {
        coordinates: feature.geometry.coordinates,
        Name: feature.properties.name,
        Number_Student: feature.properties.numstudent,
        comment: feature.properties.comment,
      };

      item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
      item.details_data = formatObjectData(item, keyMappings, "details");
      return item;
    });
  } catch (error) {
    console.error("Error fetching school data:", error);
  }
}

export const createSchoolLayer = (schoolData, openDetailsBox) =>
  new IconLayer({
    id: "School",
    data: schoolData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas_ameni.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map_ameni.json`,
    getIcon: (d) => "school_937018",
    sizeScale: 10,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // Adjust the icon size
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
