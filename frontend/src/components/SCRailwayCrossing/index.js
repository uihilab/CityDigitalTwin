import { IconLayer } from "@deck.gl/layers";

export async function AddRailwayCrossingLayer() {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/Rail_Crossing.geojson`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Gelen verileri JSON formatında çözümleyin
    const data = await response.json();

    const processedData = data.features.map((feature) => {
        const item = {
            BUSINESS_DATE: feature.properties.BUSINESS_DATE,
            coordinates: feature.geometry.coordinates,
            EFFECTIVE_START_DATE: feature.properties.EFFECTIVE_START_DATE,
        };

        item.tooltip_data = formatTooltipData(item);
        return item;
    });

    const layerRailway = new IconLayer({
        id: 'RailwayCross',
        data: processedData,
        pickable: true,
        iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
        iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
        getIcon: d => 'paragon-1-blue',
        sizeScale: 15,
        getPosition: d => d.coordinates,
        getSize: d => 5,
        getTooltip: ({ object }) => object && object.tooltip_data,
        //getColor: d => [255, 0, 0],
    });
    return layerRailway;
}

function formatTooltipData(item) {
    let tooltipData = '';

    if (item.BUSINESS_DATE !== undefined) {
        tooltipData += `Business Date: ${item.BUSINESS_DATE}\n`;
    }
    if (item.EFFECTIVE_START_DATE !== undefined) {
        tooltipData += `Effective Start Date: ${item.EFFECTIVE_START_DATE}\n`;
    }

    return tooltipData.trim(); // Remove trailing newline
}
