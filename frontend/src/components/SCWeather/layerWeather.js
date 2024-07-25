
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
        iconAtlas: process.env.PUBLIC_URL +'/icons/icon_atlas.png',
        iconMapping: process.env.PUBLIC_URL +'/icons/icon_atlas_map.json',
        getIcon: d => 'paragon-5-pink',
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