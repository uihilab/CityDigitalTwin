import { IconLayer } from "@deck.gl/layers";

// Function to format the tooltip data for traffic events
function formatTooltipData(item) {
  let tooltipData = "";

  if (item.name !== undefined) {
    tooltipData += `Name: ${item.name}\n`;
  }
  if (item.classType !== undefined) {
    tooltipData += `Class: ${item.classType}\n`;
  }
  if (item.mass !== undefined) {
    tooltipData += `Priority: ${item.mass}\n`;
  }
  if (item.year !== undefined) {
    tooltipData += `Year: ${item.year}\n`;
  }
  if (item.updateDate !== undefined) {
    tooltipData += `Update Date: ${item.updateDate}\n`;
  }
  if (item.route !== undefined) {
    tooltipData += `Route: ${item.route}\n`;
  }
  if (item.endTime !== undefined) {
    tooltipData += `End Time: ${item.endTime}\n`;
  }
  if (item.description !== undefined) {
    tooltipData += `Description: ${item.description}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

export async function getTrafficEventData() {
  try {
    const response = await fetch(
      "https://services.arcgis.com/8lRhdTsQyJpO52F1/arcgis/rest/services/CARS511_Iowa_View/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
    );
    const data = await response.json();
    const result = convertToMarkers(data);
    return result;
  } catch (error) {
    console.error("Error fetching traffic event data:", error);
  }
}

export function convertToMarkers(jsonData) {
  const features = jsonData.features;
  const convertedData = features.map((feature) => {
    const coordinates = feature.geometry.coordinates;
    const name = feature.properties.headline || "";
    const classType = feature.properties.STYLE || "";
    const mass = feature.properties.Priority || "";
    const year = new Date(feature.properties.UpdateDate).getFullYear() || "";
    const route = feature.properties.Route || "";
    const endTime = feature.properties.EndTime || "";
    const description = feature.properties.Desc0 || "";

    const item = {
      coordinates,
      name,
      classType,
      mass,
      year,
      updateDate: feature.properties.UpdateDate,
      route,
      endTime,
      description,
    };

    item.tooltip_data = formatTooltipData(item);
    return item;
  });
  return convertedData;
}

export const createTrafficEventLayer = (trafficEventData, setTooltip) =>
  new IconLayer({
    id: "TrafficEventLayer",
    data: trafficEventData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: (d) => "paragon-5-blue",
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
