import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';
import L from 'leaflet';

//const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic3VtZXl5ZWtheW5hayIsImEiOiJjbHRpMTE5MTEwYWt3MnJxcXRteWVvMGY1In0.qe3L9QKLQR4g39gIe4lLwg';

const initialViewState = {
    longitude: -92.3341,
    latitude: 42.4928,
    zoom: 14,
    pitch: 0,
    bearing: 0
  };
  
  function SCBuilding() {
    useEffect(() => {
      // Leaflet harita oluşturma
      const map = L.map('map').setView([42.4928, -92.3341], 14);
  
      // OpenStreetMap katmanı ekleme
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
      // Overpass API'ye istek yaparak Waterloo, Iowa'daki bina verilerini al
      fetch('https://overpass-api.de/api/interpreter?data=[out:json];(way["building"](42.4673,-92.3156,42.514,-92.2567);relation["building"](42.4673,-92.3156,42.514,-92.2567););out;')
        .then(response => response.json())
        .then(json => {
          // GeoJSON verisi işleme ve haritaya ekleme
          L.geoJSON(json).addTo(map);
        })
        .catch(error => console.error('Error fetching building data:', error));
  
      return () => {
        map.remove(); // bileşen kaldırıldığında haritayı temizle
      };
    }, []);
  
    return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
  }
  
  export default SCBuilding;