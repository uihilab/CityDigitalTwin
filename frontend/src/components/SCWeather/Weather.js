import { CreatelayerWeather } from "../SCWeather/layerWeather";
export async function FetchWeatherData(latitude = 42.569663, longitude = -92.479646) {
  const lat = latitude;
  const lon = longitude;
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`,
      options
    );
    const data = await response.json();
    var result = WconvertToMarkers(data);
    return result;
  } catch (error) {
    console.error("Error fetching train schedule:", error);
  }
}
export function WconvertToMarkers(jsonData) {
  const coordinates = [jsonData.longitude, jsonData.latitude];
  const interval = jsonData.current.interval || "";
  const humidity = jsonData.current.relative_humidity_2m || "";
  const temperature = jsonData.current.temperature_2m || "";
  const year = new Date(jsonData.current.time).getFullYear() || "";

  return {
    coordinates,
    interval,
    humidity: humidity,
    temperature,
    year,
  };
}
// Belirli bir merkez noktaya yakın yerlerin koordinatlarını hesaplayan fonksiyon
// export async function getCoordinates(centerLatitude, centerLongitude, numberOfCoordinates, zoomLevel, mapWidth, mapHeight) {

//     // Merkez noktayı kullanarak görünür alanı temsil eden bir dikdörtgen oluştur
//     const halfMapWidth = mapWidth / 2;
//     const halfMapHeight = mapHeight / 2;
//     const latitudePerPixel = 360 / Math.pow(2, zoomLevel + 8);
//     const longitudePerPixel = 360 / Math.pow(2, zoomLevel + 8);

//     const minLatitude = centerLatitude - halfMapHeight * latitudePerPixel;
//     const maxLatitude = centerLatitude + halfMapHeight * latitudePerPixel;
//     const minLongitude = centerLongitude - halfMapWidth * longitudePerPixel;
//     const maxLongitude = centerLongitude + halfMapWidth * longitudePerPixel;

//     // Dikdörtgenin köşe noktalarını kullanarak koordinatları oluştur
//     const topLeft = [maxLatitude, minLongitude];
//     const topRight = [maxLatitude, maxLongitude];
//     const bottomRight = [minLatitude, maxLongitude];
//     const bottomLeft = [minLatitude, minLongitude];

//     const visibleCoordinates = [topLeft, topRight, bottomRight, bottomLeft];

//     // Rastgele koordinatları seç
//     const randomCoordinates = [];
//     for (let i = 0; i < numberOfCoordinates; i++) {
//         const randomLatitude = minLatitude + Math.random() * (maxLatitude - minLatitude);
//         const randomLongitude = minLongitude + Math.random() * (maxLongitude - minLongitude);
//         randomCoordinates.push([randomLatitude, randomLongitude]);
//     }

//     return { visibleCoordinates, randomCoordinates };
// }

export async function getCoordinates(
  centerLatitude,
  centerLongitude,
  numberOfCoordinates,
  maxDistanceInMeters
) {
  const earthRadius = 6371000; // Dünya'nın yarıçapı metre cinsinden
  const randomCoordinates = [];

  for (let i = 0; i < numberOfCoordinates; i++) {
    // Rastgele bir mesafe ve yön belirle
    const distance = Math.random() * maxDistanceInMeters;
    const angle = Math.random() * 2 * Math.PI;

    // Lat/long hesaplamalarını yap
    const deltaLatitude = (distance / earthRadius) * (180 / Math.PI);
    const deltaLongitude =
      (distance / (earthRadius * Math.cos((centerLatitude * Math.PI) / 180))) * (180 / Math.PI);

    const randomLatitude = centerLatitude + deltaLatitude * Math.cos(angle);
    const randomLongitude = centerLongitude + deltaLongitude * Math.sin(angle);

    randomCoordinates.push([randomLatitude, randomLongitude]);
  }

  return randomCoordinates;
}

function removeLayer(layerName) {
  const foundIndex = checkLayerExists(layerName);
  if (foundIndex > -1) {
    layersStatic.splice(foundIndex, 1);
    const newLayers = layersStatic.slice();
    setMapLayers(newLayers);
  }
}

export async function createWeatherIconLayer(centerLatitude, centerLongitude, numberOfCoordinates) {
  try {
    // removeLayer(WeathericonLayer);
    // Tıklanan nokta için hava durumu verilerini al
    const weatherData = await FetchWeatherData(centerLatitude, centerLongitude);

    // Yakın yerlerin koordinatlarını hesapla
    const nearbyCoordinates = await getCoordinates(
      centerLatitude,
      centerLongitude,
      numberOfCoordinates,
      10000
    );

    // IconLayer için kullanılacak veri
    const iconData = [];
    // Yakın noktalardaki hava durumu verilerini kullanarak icon verilerini oluştur
    for (const coord of nearbyCoordinates) {
      // Yakın noktadaki hava durumu verilerini al
      const nearbyWeatherData = await FetchWeatherData(coord[0], coord[1]);
      // IconLayer için icon verisi oluştur
      iconData.push(nearbyWeatherData);
    }
    iconData.push(weatherData);
    return CreatelayerWeather(iconData);
  } catch (error) {
    console.error("Error fetching event:", error);
  }
}
