import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function getCommunicationData() {
    try {
        debugger;
        const response = await fetch("/data/communicationfacilities.geojson");
        const data = await response.json();
        return data.features.map(feature => ({
            coordinates: feature.geometry.coordinates,
            comm_city: feature.properties.city,
            comm_owner: feature.properties.owner,
        }));
    } catch (error) {
        console.error('Error fetching care facilities data:', error);
    }
}


export const createCommunicationLayer = (communicationData, setTooltip) => {
    debugger;
    return new IconLayer({
        id: 'Communication',
        data: communicationData,
        pickable: true,
        iconAtlas: '/icons/icon_atlas.png',
        iconMapping: '/icons/icon_atlas_map.json',
        getIcon: d => 'paragon-3-blue',
        sizeScale: 10,
        getPosition: d => d.coordinates,
        getSize: d => 3, // İkon boyutunu ayarlayın
        onHover: ({ object, x, y }) => {
            debugger;
            if (object) {
                setTooltip({
                    x,
                    y,
                    comm_city: object.city,
                    comm_owner: object.owner,

                });
            } else {
                setTooltip(null);
            }
        },
    });
};