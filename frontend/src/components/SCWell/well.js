import { IconLayer } from '@deck.gl/layers';

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
  return new IconLayer({
    id: 'WellLayer',
    data: wellData,
    pickable: true,
    iconAtlas: '/icons/icon_atlas.png',
    iconMapping: '/icons/icon_atlas_map.json',
    getIcon: d => 'paragon-5-blue',
    sizeScale: 10,
    getPosition: d => d.coordinates,
    getSize: d => 3, // İkon boyutunu ayarlayın
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
