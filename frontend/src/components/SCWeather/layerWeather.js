
import { IconLayer } from "@deck.gl/layers";

export function CreatelayerWeather(weatherdata)
{
    const ICON__MAPPING = {
        marker: { x: 0, y: 0, width: 128, height: 128 }
      };
      // IconLayer bileşeni
      const layerWeather = new IconLayer({
        id: 'WForecast',
        data: weatherdata,
        pickable: true,
        iconAtlas: 'data/location-icon-atlas.png', // Replace with the path to your icon atlas
        iconMapping: ICON__MAPPING,
        getIcon: d => 'marker',
        sizeScale: 1,
        getPosition: d => d.coordinates,
        getSize: d => 50,
        getColor: d => [255, 255, 255],
        getAngle: d => 0,
        onHover: ({ object, x, y }) => {
      }
      });
      return layerWeather;
}

