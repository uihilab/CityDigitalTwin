import React, { useRef, useEffect, useState } from "react";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";
import { Loader } from "@googlemaps/js-api-loader";

import { startTrafficSimulator } from "components/TrafficSimulator";
import { getFloodLayer } from "components/SCFlood";
import { stopTrafficSimulator } from "components/TrafficSimulator";
import { FloodYearMenu } from "components/SCFlood/floodYearMenu";
import { ModelCarGreen } from "components/TrafficSimulator/modelFiles";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAP_ID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
const defaultCoords = { lat: 42.4942408813, long: -92.34170190987821 };

function SCSimulation({ options = { tracking: true, showPaths: true } }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const animationRef = useRef(null);
  const overlayStaticRef = useRef(null);
  const [floodYears, setFloodYears] = useState(0);
  // Store the previous floodYears value
  const prevFloodYearsRef = useRef(-1);

  // State to track if overlays are initialized
  const [overlayInitialized, setOverlayInitialized] = useState(false);

  // Function to remove existing flood layers
  const removeFloodLayer = (layers) => {
    // Filter out layers that start with "flood_"
    return layers.filter((layer) => !layer.id?.startsWith("flood_"));
  };

  const setFloodLayer = (floodLayer) => {
    const overlay = overlayStaticRef.current;
    if (!overlay) return;

    // Get the current layers from the overlay
    let currentLayers = overlay.props.layers || [];

    // Remove any existing flood layers
    currentLayers = removeFloodLayer(currentLayers);

    // Add the floodLayer to the current layers
    const updatedLayers = [...currentLayers, floodLayer];

    // Update the overlay with the new set of layers
    overlay.setProps({ layers: updatedLayers });
  };

  // Function to handle flood years change
  const changefloodyears = async (newYears) => {
    try {
      console.log(`Flood years changed to: ${newYears}`);

      if (!overlayStaticRef.current) {
        console.error("Overlay is not initialized.");
        return;
      }
      const overlay = overlayStaticRef.current;
      if (newYears > 0) {
        const floodLayer = await getFloodLayer(`flood_${newYears}`, newYears); // Ensure this resolves
        if (floodLayer) {
          setFloodLayer(floodLayer); // Only update if floodLayer is valid
        }
      } else {
        // Get the current layers from the overlay
        let currentLayers = overlay.props.layers || [];

        // Remove any existing flood layers
        currentLayers = removeFloodLayer(currentLayers);

        // Add the floodLayer to the current layers
        const updatedLayers = [...currentLayers];

        // Update the overlay with the new set of layers
        overlay.setProps({ layers: updatedLayers });
        return;
      }
    } catch (error) {
      console.error("Error loading flood layer:", error);
    }
  };

  const setAnimationLayers = (layers) => {
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.setProps({ layers });
    }
  };

  const setMapLayerStatic = (layers) => {
    const overlay = overlayStaticRef.current;
    if (overlay) {
      overlay.setProps({ layers });
    }
  };

  const addMapLayerStatic = (newLayers) => {
    const overlay = overlayStaticRef.current;
    if (overlay) {
      // Get the current layers from the overlay
      const currentLayers = overlay.props.layers || [];

      const updatedLayers = [...currentLayers, newLayers];

      // Update the overlay with the new set of layers
      overlay.setProps({ layers: updatedLayers });
    }
  };

  const startSimulation = async () => {
    // Start the traffic simulator
    await startTrafficSimulator(
      setAnimationLayers,
      addMapLayerStatic,
      null,
      floodYears,
      ModelCarGreen
    );
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({ apiKey: GOOGLE_MAPS_API_KEY });
        const googlemaps = await loader.importLibrary("maps");

        // Initialize the map
        const map = new googlemaps.Map(containerRef.current, {
          center: { lng: defaultCoords.long, lat: defaultCoords.lat },
          zoom: 15,
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

        // Initialize the overlays
        const overlay = new DeckOverlay({});
        overlay.setMap(map);
        overlayRef.current = overlay;

        const overlayStatic = new DeckOverlay({});
        overlayStatic.setMap(map);
        overlayStaticRef.current = overlayStatic;

        // Once the overlays are initialized, set the state to true
        setOverlayInitialized(true);
        // Start the traffic simulator
        startSimulation(); //await startTrafficSimulator(setAnimationLayers, addMapLayerStatic, null, floodYears);
      } catch (error) {
        console.error("Error initializing the map or overlays:", error);
      }
    };

    if (!mapRef.current && containerRef.current) {
      initializeMap(); // Initialize the map only once
    }

    return () => {
      // Cleanup
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (overlayRef.current) overlayRef.current.finalize();
      if (overlayStaticRef.current) overlayStaticRef.current.finalize();
    };
  }, []);

  const clearAllLayers = () => {
    const overlayStatic = overlayStaticRef.current;
    const overlayAnimation = overlayRef.current;

    if (overlayStatic) {
      overlayStatic.setProps({ layers: [] }); // Clears the static layers
    }

    if (overlayAnimation) {
      overlayAnimation.setProps({ layers: [] }); // Clears the animated layers (ScenegraphLayer)
    }
  };

  // Effect to handle flood years changes
  useEffect(() => {
    // Only call changefloodyears if overlay is initialized and floodYears has changed
    if (
      overlayInitialized &&
      floodYears !== undefined &&
      floodYears !== prevFloodYearsRef.current
    ) {
      if (prevFloodYearsRef.current >= 0) {
        stopTrafficSimulator(); // Ensure this completes before continuing
        clearAllLayers();
        startSimulation();
      }
      changefloodyears(floodYears);
      prevFloodYearsRef.current = floodYears;
    }
  }, [floodYears, overlayInitialized]);

  const handleFloodYearChange = (newFloodYear) => {
    console.log("Selected Flood Year:", newFloodYear);
    //setSelectedFloodYear(newFloodYear);
  };

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <FloodYearMenu selectedFloodYear={floodYears} handleFloodYearChange={setFloodYears} />
    </>
  );
}

export default SCSimulation;
