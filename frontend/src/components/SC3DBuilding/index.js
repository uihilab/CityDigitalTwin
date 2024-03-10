import React, { useEffect } from 'react';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { Deck } from '@deck.gl/core';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA_pz96jw-8ko74bp3nKTopv7ajNGqgbe4';
const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=beta`;


function loadScript(url) {
    if (typeof google !== 'undefined') {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

function Map3D() {
    //await loadScript(GOOGLE_MAPS_API_URL);
    return <div id="map" style={{ width: '100%', height: '100vh' }} />;
}

export default Map3D;