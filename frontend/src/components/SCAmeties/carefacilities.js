import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
export async function getCareFacilitiesData() {
    try {
        debugger;
        const response = await fetch("/data/carefacilities.geojson");
        const data = await response.json();
        return data.features.map(feature => ({
            coordinates: feature.geometry.coordinates,
            carefacilities_name: feature.properties.name,
            carefacilities_city: feature.properties.city,
            carefacilities_address: feature.properties.address,
            carefacilities_phonenumber: feature.properties.phonenumbe,
            carefacilities_numbeds: feature.properties.numbeds,

        }));
    } catch (error) {
        console.error('Error fetching care facilities data:', error);
    }
}


export const createCareFacilitiesLayer = (careData, setTooltip) => {
    debugger;
    return new IconLayer({
        id: 'CareFacilities',
        data: careData,
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
                    carefacilities_name: object.carefacilities_name,
                    carefacilities_city: object.carefacilities_city,
                    carefacilities_phonenumber: object.carefacilities_phonenumber,
                    carefacilities_address: object.carefacilities_address,
                    carefacilities_numbeds: object.carefacilities_numbeds

                });
            } else {
                setTooltip(null);
            }
        },
    });
};