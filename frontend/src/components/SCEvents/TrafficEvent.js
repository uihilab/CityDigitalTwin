export async function getTrafficEventData() {
    try {
        const response = await fetch('https://services.arcgis.com/8lRhdTsQyJpO52F1/arcgis/rest/services/CARS511_Iowa_View/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson');
        const data = await response.json();

        var result = convertToMarkers(data);
        return result;

    } catch (error) {
        console.error('Error fetching train schedule:', error);
    }
}

function convertToMarkers(jsonData) {
    const features = jsonData.features;

    const convertedData = features.map(feature => {
        const coordinates = feature.geometry.coordinates;
        const name = feature.properties.headline || '';
        const classType = feature.properties.STYLE || '';
        const mass = feature.properties.Priority || '';
        const year = new Date(feature.properties.UpdateDate).getFullYear() || '';

        return {
            coordinates,
            name,
            class: classType,
            mass,
            year
        };
    });

    return convertedData;
}