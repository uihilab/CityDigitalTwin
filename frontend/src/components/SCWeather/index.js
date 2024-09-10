
import { IconLayer } from "@deck.gl/layers";
import { icon } from "leaflet";

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.temperature !== undefined) {
    tooltipData += `Temperature: ${item.temperature}°C\n`;
  }
  if (item.windspeed !== undefined) {
    tooltipData += `Wind Speed: ${item.windspeed}km/h\n`;
  }
  if (item.winddirection !== undefined) {
    tooltipData += `Wind Direction: ${item.winddirection}°\n`;
  }
  if (item.time !== undefined) {
    tooltipData += `Time: ${item.time}\n`;
  }
  if (item.elevation !== undefined) {
    tooltipData += `Elevation: ${item.elevation}m\n`;
  }
  if (item.timezone !== undefined) {
    tooltipData += `Time Zone: ${item.timezone}`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

// Coordinates for Waterloo, IA
const test = [
  { position:[-92.3426, 42.4928]  } // Longitude, Latitude
];

const test2 = [{
  "temperature": 34.92147812927493,
  "windspeed": 18.11165902823697,
  "winddirection": 60,
  "time": "2024-08-28T19:50:05.125146",
  "elevation": 533.5197202407716,
  "timezone": "America/Chicago",
  "coordinates": [-92.3426, 42.4928],
  "tooltip_data": "Temp: 34.92147812927493, Wind: 18.11165902823697 km/h, Direction: 60°"
}];

// Define the icon atlas and mapping
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true }
};

export async function getWeatherLayer(latitude, longitude ) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
  const data = await response.json();

  const processedData = (() => {
    const item = { 
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      winddirection: data.current_weather.winddirection,
      time: data.current_weather.time,
      elevation: data.elevation,
      timezone: data.timezone,
      coordinates: [data.longitude, data.latitude]//[-92.3426, 42.4928]//
    };

    item.tooltip_data = formatTooltipData(item);
    return [item]; // Wrap the item in an array
  })();
  

  const layerWeather = new IconLayer({
    id: `WForecast_${latitude}_${longitude}`,
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: d => 'paragon-1-blue',
    sizeScale: 5,
    getPosition: d =>  d.coordinates ,
    getSize: d => 8,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
  });

  const iconLayer = new IconLayer({
    id: 'icon-layer',
    data,
    pickable: true,
    iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',
    sizeScale: 15,
    getPosition: d => d.position,
    getSize: d => 50,
    getColor: d => [255, 0, 0]
  });
  return layerWeather;
}
export async function getWeatherLayersForAllLocations() {
  const locations = [
    { name: "Cedar Falls", latitude: 42.534899, longitude: -92.445316 },
    { name: "Dewar", latitude: 42.470271, longitude: -92.213508 },
    { name: "Raymond", latitude: 42.469423, longitude: -92.223089 },
    { name: "Hudson", latitude: 42.406482, longitude: -92.454357 },
    { name: "Dunkerton", latitude: 42.570989, longitude: -92.158785 },
    { name: "Gilbertville", latitude: 42.418319, longitude: -92.214351 },
    { name: "Blessing", latitude: 42.561486, longitude: -92.312137 },
    { name: "La Porte City", latitude: 42.314428, longitude: -92.189625 },
  ];
  const weatherDataPromises = locations.map(async (location) => {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`);
    const data = await response.json();

    return {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      winddirection: data.current_weather.winddirection,
      time: data.current_weather.time,
      tooltip_data: formatTooltipData({
        name: location.name,
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        winddirection: data.current_weather.winddirection,
        time: data.current_weather.time,
      }),
    };
  });

  // Tüm hava durumu verilerini almak için Promise.all kullanıyoruz
  const weatherData = await Promise.all(weatherDataPromises);

  // Tek bir IconLayer ile tüm konumları ekleyelim
  const layerWeather = new IconLayer({
    id: 'WForecast_AllLocations', // Tek katman ID'si
    data: weatherData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: d => 'paragon-1-blue',
    sizeScale: 5,
    getPosition: d => [d.longitude, d.latitude],
    getSize: d => 8,
    getTooltip: ({ object }) => object && object.tooltip_data,
  });

  return layerWeather;
}
