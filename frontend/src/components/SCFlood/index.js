// SCFlood/index.js
import { GeoJsonLayer } from "@deck.gl/layers";

export async function getFloodLayer(id, floodYear) {
    try {
        var path = `${process.env.PUBLIC_URL}/data/flood_${floodYear}yr.geojson`;
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Gelen verileri JSON formatında çözümleyin
        const data = await response.json();

        const layer = new GeoJsonLayer({
            id,
            data: data,
            pickable: true,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2, // Optional: specify line width
            lineWidthMaxPixels: 5, // Optional: specify line width
            getFillColor: [255, 0, 0, 100], // Optional: specify fill color with some transparency
            getLineColor: [255, 0, 0], // Optional: specify line color
            getRadius: 100,
            getLineWidth: 1,
            getElevation: 30
        });
        return layer;
    }
    catch (error) {
        console.error("Error fetching or processing GeoJSON data:", error);
        throw error;
    }

}

