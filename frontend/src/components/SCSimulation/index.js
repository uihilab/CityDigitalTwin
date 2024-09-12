import React, { useRef, useEffect, useState } from "react";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { PathLayer } from "@deck.gl/layers";
import { Loader } from "@googlemaps/js-api-loader";
import TripBuilder from "./trip-builder";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAP_ID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;

const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/google-3d/trips.json";
const MODEL_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/google-3d/truck.gltf";

function SCSimulation({ options = { tracking: true, showPaths: true } }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({ apiKey: GOOGLE_MAPS_API_KEY });
      const googlemaps = await loader.importLibrary("maps");

      const resp = await fetch(DATA_URL);
      const data = await resp.json();

      // Harita yalnızca bir kez başlatılır
      const map = new googlemaps.Map(containerRef.current, {
        center: { lng: -95.36403, lat: 29.756433 },
        zoom: 19,
        heading: 0,
        tilt: 45,
        isFractionalZoomEnabled: true,
        mapId: GOOGLE_MAP_ID,
        mapTypeControlOptions: {
          mapTypeIds: ["roadmap", "terrain"],
        },
        streetViewControl: false,
      });
      mapRef.current = map;

      const overlay = new DeckOverlay({});
      overlay.setMap(map);
      overlayRef.current = overlay;

      startAnimation(map, overlay, data, options);
    };

    if (!mapRef.current && containerRef.current) {
      initializeMap(); // Haritayı sadece bir kez başlat
    }

    return () => {
      // Cleanup işlemleri
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (overlayRef.current) overlayRef.current.finalize();
    };
  }, []);

  const startAnimation = (map, overlay, data, options) => {
    const trips = data.map((waypoints) => new TripBuilder({ waypoints, loop: true }));
    let timestamp = 0;

    const onAnimationFrame = () => {
      timestamp += 0.02;

      const frame = trips.map((trip) => trip.getFrame(timestamp));

      // Kamera ilk aracı takip edecek
      if (options.tracking) {
        map.moveCamera({
          center: { lat: frame[0].point[1], lng: frame[0].point[0] },
          heading: frame[0].heading,
        });
      }

      const layers = [
        options.showPaths &&
          new PathLayer({
            id: "trip-lines",
            data: trips,
            getPath: (d) => d.keyframes.map((f) => f.point),
            getColor: (_) => [128 * Math.random(), 255 * Math.random(), 255],
            jointRounded: true,
            opacity: 0.5,
            getWidth: 0.5,
          }),
        new ScenegraphLayer({
          id: "truck",
          data: frame,
          scenegraph: MODEL_URL,
          sizeScale: 2,
          getPosition: (d) => d.point,
          getTranslation: [0, 0, 1],
          getOrientation: (d) => [0, 180 - d.heading, 90],
          _lighting: "pbr",
        }),
      ];

      overlay.setProps({ layers });

      animationRef.current = requestAnimationFrame(onAnimationFrame);
    };

    onAnimationFrame(); // Animasyonu başlat
  };

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

export default SCSimulation;
