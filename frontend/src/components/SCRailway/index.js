
import React from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';

export async function fetchRailwayData() {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/Rail_Line_Active.geojson`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Gelen verileri JSON formatında çözümleyin
    const data = await response.json();
    return data;
}

export function CreateRailwayLayer(geojsonData)
{
    const layers =  new GeoJsonLayer({
        id: 'RailwayNetwork',
        data: geojsonData,
        pickable: true,
        getLineColor: [255, 0, 0, 255],
        getRadius: 90,
        getLineWidth: 2,
        getElevation: 30,
      });
      return layers;
}


