import { IconLayer } from "@deck.gl/layers";

// Function to format the tooltip data for schools
function formatTooltipData(item) {
  let tooltipData = '';

  if (item.Name !== undefined) {
    tooltipData += `Name: ${item.Name}\n`;
  }
  if (item.Number_Student !== undefined) {
    tooltipData += `Number of Students: ${item.Number_Student}\n`;
  }
  if (item.comment !== undefined) {
    tooltipData += `Comment: ${item.comment}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

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

      item.tooltip_data = formatTooltipData(item);
      return item;
    });
  } catch (error) {
    console.error("Error fetching school data:", error);
  }
}

export const createSchoolLayer = (schoolData, setTooltip) => new IconLayer({
  id: "School",
  data: schoolData,
  pickable: true,
  iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas_ameni.png`,
  iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map_ameni.json`,
  getIcon: (d) => "school_937018",
  sizeScale: 10,
  getPosition: (d) => d.coordinates,
  getSize: (d) => 3, // Adjust the icon size
  onHover: ({ object, x, y }) => {
    if (object) {
      setTooltip({
        x,
        y,
        tooltip_data: object.tooltip_data,
      });
    } else {
      setTooltip(null);
    }
  },
});
