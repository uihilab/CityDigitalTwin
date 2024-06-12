import { ScatterplotLayer } from '@deck.gl/layers';

export async function getWellData() {
  try {
    const response = await fetch("/data/BlackHawkWell.geojson");
    const data = await response.json();
    return data.features.map(feature => ({
      coordinates: feature.geometry.coordinates,
      county: feature.properties.COUNTY,
      depth: feature.properties.DEPTH,
    }));
  } catch (error) {
    console.error('Error fetching well data:', error);
  }
}

export const createWellLayer = (wellData, setTooltip) => {
  return new ScatterplotLayer({
    id: 'Well',
    data: wellData,
    pickable: true,
    opacity: 0.8,
    radiusScale: 1,
    radiusMinPixels: 1,
    getPosition: d => d.coordinates,
    getIcon: d => ({
      url: "/data/${location-icon-atlas}.png",
      width: 64,
      height: 64,
      anchorY: 64,
    }),
    onHover: ({ object, x, y }) => {
        if (object) {
            setTooltip({
              x,
              y,
              county: object.county,
              depth: object.depth,
              name: object.name
            });
          } else {
            setTooltip(null);
          }
        },
  });
};
