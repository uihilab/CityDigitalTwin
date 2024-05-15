
export async function FetchWeatherData(latitude = 42.569663, longitude = -92.479646) {

    debugger;
    const lat = latitude;
    const lon = longitude;
    const options = { method: 'GET', headers: { accept: 'application/json' } };

    const data= await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`, options)
        .then(response => response.json())
        .catch(err => console.error(err));

        var result = await convertToMarkers(data);
        return result;
}
export async function convertToMarkers(jsonData) {
    debugger;
        const coordinates = [jsonData.latitude,jsonData.longitude];
        const relative_humidity_2m = jsonData.current.relative_humidity_2m || '';
        const temperature_2m = jsonData.current.temperature_2m || '';
        const time = new Date(jsonData.current.time).getFullYear() || '';

        return {
            coordinates,
            relative_humidity_2m,
            temperature_2m,
            time
        };
}
// Belirli bir merkez noktaya yakın yerlerin koordinatlarını hesaplayan fonksiyon
export async function getCoordinates(centerLatitude, centerLongitude, numberOfCoordinates, zoomLevel, mapWidth, mapHeight) {

    debugger;
    // Merkez noktayı kullanarak görünür alanı temsil eden bir dikdörtgen oluştur
    const halfMapWidth = mapWidth / 2;
    const halfMapHeight = mapHeight / 2;
    const latitudePerPixel = 360 / Math.pow(2, zoomLevel + 8);
    const longitudePerPixel = 360 / Math.pow(2, zoomLevel + 8);
    
    const minLatitude = centerLatitude - halfMapHeight * latitudePerPixel;
    const maxLatitude = centerLatitude + halfMapHeight * latitudePerPixel;
    const minLongitude = centerLongitude - halfMapWidth * longitudePerPixel;
    const maxLongitude = centerLongitude + halfMapWidth * longitudePerPixel;
    
    // Dikdörtgenin köşe noktalarını kullanarak koordinatları oluştur
    const topLeft = [maxLatitude, minLongitude];
    const topRight = [maxLatitude, maxLongitude];
    const bottomRight = [minLatitude, maxLongitude];
    const bottomLeft = [minLatitude, minLongitude];

    const visibleCoordinates = [topLeft, topRight, bottomRight, bottomLeft];

    // Rastgele koordinatları seç
    const randomCoordinates = [];
    for (let i = 0; i < numberOfCoordinates; i++) {
        const randomLatitude = minLatitude + Math.random() * (maxLatitude - minLatitude);
        const randomLongitude = minLongitude + Math.random() * (maxLongitude - minLongitude);
        randomCoordinates.push([randomLatitude, randomLongitude]);
    }

    return { visibleCoordinates, randomCoordinates };
}



