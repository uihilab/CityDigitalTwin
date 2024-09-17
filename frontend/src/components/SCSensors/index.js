import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { getStreamSensors, getCommunitySensors, getRainSensors } from './sensorData'; // Import your sensor functions here

export const createSensorLayer = (id, sensorData, setTooltip) => new IconLayer({
  id: id,
  data: sensorData,
  pickable: true,
  iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
  iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
  getIcon: (d) => "stream_gauge",
  sizeScale: 10,
  getPosition: (d) => [d.longitude, d.latitude], // Adjusted to your data's latitude/longitude format
  getSize: (d) => 4, // Adjust the icon size as needed
  onHover: ({ object, x, y }) => {
    if (object) {
      setTooltip({
        x,
        y,
        tooltip_data: `Sensor Type: ${object.sensorType}, Value: ${object.value1}`, // Customize tooltip content
      });
    } else {
      setTooltip(null);
    }
  },
});

// Function to create the Stream Sensor layer and set it
export async function createStreamSensorLayer(setMapLayer, lat, long, milesRange) {
  try {
    const streamSensorsData = await getStreamSensors(lat, long, milesRange);
    // const streamLayer = new GeoJsonLayer({
    //   id: 'stream-sensor-layer',
    //   data: streamSensorsData,
    //   pickable: true,
    //   stroked: false,
    //   filled: true,
    //   pointRadiusMinPixels: 5,
    //   getFillColor: [255, 0, 0], // Red color for stream sensors
    // });
    const layer = createSensorLayer("stream-sensors", streamSensorsData, null);
    setMapLayer(layer);
  } catch (error) {
    console.error('Error fetching or creating stream sensor layer:', error);
  }
}

// Function to create the Community Sensor layer and set it
export async function createCommunitySensorLayer(setMapLayer, lat, long, milesRange) {
  try {
    const communitySensorsData = await getCommunitySensors(lat, long, milesRange);
    const communityLayer = new GeoJsonLayer({
      id: 'community-sensor-layer',
      data: communitySensorsData,
      pickable: true,
      stroked: false,
      filled: true,
      pointRadiusMinPixels: 5,
      getFillColor: [0, 255, 0], // Green color for community sensors
    });
    setMapLayer(communityLayer);
  } catch (error) {
    console.error('Error fetching or creating community sensor layer:', error);
  }
}

// Function to create the Rain Sensor layer and set it
export async function createRainSensorLayer(setMapLayer, lat, long, milesRange) {
  try {
    const rainSensorsData = await getRainSensors(lat, long, milesRange);
    const rainLayer = new GeoJsonLayer({
      id: 'rain-sensor-layer',
      data: rainSensorsData,
      pickable: true,
      stroked: false,
      filled: true,
      pointRadiusMinPixels: 5,
      getFillColor: [0, 0, 255], // Blue color for rain sensors
    });
    setMapLayer(rainLayer);
  } catch (error) {
    console.error('Error fetching or creating rain sensor layer:', error);
  }
}
