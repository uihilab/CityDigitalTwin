import { GeoJsonLayer, IconLayer, ColumnLayer } from "@deck.gl/layers";
import {
  getStreamSensors,
  getCommunitySensors,
  getRainSensors,
  getStreamData,
  getSoilMoistureSensors,
} from "./sensorData"; // Import your sensor functions here

const createIconLayer = (id, sensorData, iconName, openDetailsBox) =>
  new IconLayer({
    id: id,
    data: sensorData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
    getIcon: (d) => iconName,
    sizeScale: 10,
    getPosition: (d) => [d.longitude, d.latitude], // Adjusted to your data's latitude/longitude format
    getSize: (d) => 4, // Adjust the icon size as needed
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
    onClick: (info, event) => {
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });

export const createSensorColumnLayer = (id, sensorData, setTooltip) => {
  return new ColumnLayer({
    id: id,
    data: sensorData,
    diskResolution: 20,
    radius: 100, // Adjust as needed
    elevationScale: 1, // Adjust as needed
    extruded: true,
    pickable: true,
    getPosition: (d) => [d.longitude, d.latitude], // Longitude and Latitude for positioning
    getElevation: (d) => (d.data.today !== null ? d.data.today : 0), // Use value for elevation, default to 0 if null
    getFillColor: (d) => {
      if (d.data.today === null) {
        return [200, 200, 200]; // Grey for null values
      }
      return d.data.today > 1000 ? [255, 0, 0] : [0, 128, 0]; // Red if value > 1000, Green otherwise
    },
    // onHover: ({ object, x, y }) => {
    //   //debugger;
    //   if (object) {
    //     setTooltip({
    //       x,
    //       y,
    //       tooltip_data: "test", //`Sensor Type: ${object.sensorType}, Sensor id: ${object.id}`, // Customize tooltip content
    //     });
    //   } else {
    //     setTooltip(null);
    //   }
    // },
    getLineColor: [0, 0, 0], // Black outlines for columns
    lineWidthMinPixels: 1,
  });
};

// Function to create the Stream Sensor layer and set it
export async function createStreamSensorLayer(setMapLayer, lat, long, milesRange, openDetailsBox) {
  try {
    const streamSensorsData = await getStreamSensors(lat, long, milesRange);
    //console.log(JSON.stringify(streamSensorsData));
    //const layer = createSensorColumnLayer("stream-sensors", streamSensorsData, setTooltip, "stream_gauge");
    const layer = createIconLayer("StreamGauges", streamSensorsData, "stream_gauge", openDetailsBox);

    setMapLayer(layer);
  } catch (error) {
    console.error("Error fetching or creating stream sensor layer:", error);
  }
}

export async function createSoilMoistureSensorLayer(
  setMapLayer,
  lat,
  long,
  milesRange,
  openDetailsBox
) {
  try {
    const communitySensorsData = await getSoilMoistureSensors(lat, long, milesRange);
    const layer = createIconLayer("SoilMoistureSensors", communitySensorsData, "soil", openDetailsBox);
    setMapLayer(layer);
  } catch (error) {
    console.error("Error fetching or creating community sensor layer:", error);
  }
}

// Function to create the Rain Sensor layer and set it
export async function createRainSensorLayer(setMapLayer, lat, long, milesRange, openDetailsBox) {
  try {
    const rainSensorsData = await getRainSensors(lat, long, milesRange);
    const rainLayer = new GeoJsonLayer({
      id: "rain-sensor-layer",
      data: rainSensorsData,
      pickable: true,
      stroked: false,
      filled: true,
      pointRadiusMinPixels: 5,
      getFillColor: [0, 0, 255], // Blue color for rain sensors
    });
    setMapLayer(rainLayer);
  } catch (error) {
    console.error("Error fetching or creating rain sensor layer:", error);
  }
}
