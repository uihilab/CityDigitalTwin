import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  name: "Name",
  classType: "Class",
  mass: "Priority",
  year: "Year",
  updateDate: "Update Date",
  route: "Route",
  endTime: "End Time",
  description: "Description",
};

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

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });
  return convertedData;
}

export const createTrafficEventLayer = (trafficEventData, openDetailsBox) =>
  new IconLayer({
    id: "TransEvents",
    data: trafficEventData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => "wa3",
    sizeScale: 10,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 3, // Adjust the icon size
    getTooltip: ({ object }) => object && object.tooltip_data,
    onClick: (info, event) => {
      console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });
