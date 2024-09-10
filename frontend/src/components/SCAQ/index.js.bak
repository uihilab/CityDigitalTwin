import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { IconLayer } from "@deck.gl/layers";

function AirQualityMenu({ latitude, longitude, setMapLayer, removelayer }) {
  const [airQualityData, setAirQualityData] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsData, setDetailsData] = useState([]);
  const [dailyData, setDailyData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Create a ref for the canvas element
  const canvasRef = useRef(null);

  useEffect(() => {
    // Fetch air quality data when the component mounts
    fetchAirQuality();
  }, []);

  useEffect(() => {
    if (airQualityData) {
      // Add the icon to the map and wait for the canvas to be available
      addIconToMap(latitude, longitude);
    }
  }, [airQualityData]);

  useEffect(() => {
    // Render chart only when canvasRef is not null and airQualityData is available
    if (canvasRef.current && airQualityData) {
      renderAirQualityChart();
    }
  }, [canvasRef.current, dailyData]);

  function addIconToMap(latitude, longitude) {
    const layer = new IconLayer({
      id: "AQuality",
      data: [{ position: [longitude, latitude] }],
      pickable: true,
      iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
      iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
      getIcon: () => "paragon-5-orange",
      sizeScale: 15,
      getPosition: (d) => d.position,
      getSize: () => 5,
      getColor: () => [255, 140, 0], // Adjust the color if needed
    });
    setMapLayer(layer); // Use setMapLayer to add the layer to the map
  }

  const fetchAirQuality = async () => {
    const options = { method: "GET", headers: { accept: "application/json" } };
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5`,
        options
      );
      const data = await response.json();
      setAirQualityData(data);
      groupDailyData(data.hourly);
    } catch (error) {
      console.error("Error fetching air quality data:", error);
    }
  };

  const groupDailyData = (hourly) => {
    const { time, pm10, pm2_5 } = hourly;
    const groupedData = {};

    time.forEach((timeString, index) => {
      const date = new Date(timeString);
      const dateString = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate()
      ).padStart(2, "0")}`;

      if (!groupedData[dateString]) {
        groupedData[dateString] = { pm10Sum: 0, pm25Sum: 0, count: 0, details: [] };
      }

      groupedData[dateString].pm10Sum += pm10[index];
      groupedData[dateString].pm25Sum += pm2_5[index];
      groupedData[dateString].count += 1;
      groupedData[dateString].details.push({
        time: timeString,
        pm10: pm10[index],
        pm25: pm2_5[index],
      });
    });

    setDailyData(groupedData);
  };

  const renderAirQualityChart = () => {
    const canvas = canvasRef.current; // Access the canvas via ref
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const labels = Object.keys(dailyData);
    const dailyPm10Values = labels.map((date) => dailyData[date].pm10Sum / dailyData[date].count);
    const dailyPm25Values = labels.map((date) => dailyData[date].pm25Sum / dailyData[date].count);

    if (chartInstance) {
      chartInstance.destroy();
    }

    const newChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Daily Average PM10",
            data: dailyPm10Values,
            borderColor: "rgb(255, 99, 132)",
            tension: 0.1,
          },
          {
            label: "Daily Average PM2.5",
            data: dailyPm25Values,
            borderColor: "rgb(54, 162, 235)",
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  };

  const handleShowDetails = (details, date) => {
    setDetailsData(details);
    setSelectedDate(date);
    setShowDetails(true);
  };

  const handleBack = () => {
    setShowDetails(false);
    // Re-render the chart when going back to the main view
    renderAirQualityChart();
  };

  return (
    <div style={styles.menu}>
      <h3 style={styles.header}>Air Quality Summary</h3>

      {!showDetails ? (
        <div>
          {/* Use the ref to reference the canvas element */}
          <canvas ref={canvasRef} id="airQualityCanvas" width="280" height="200" />
          {Object.keys(dailyData).map((date) => (
            <button
              key={date}
              onClick={() => handleShowDetails(dailyData[date].details, date)}
              style={styles.dateButton}
            >
              {date}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={handleBack} style={styles.backButton}>
            Back
          </button>
          {detailsData.map((detail, index) => (
            <div key={index}>
              <p>
                <strong>Hour:</strong>{" "}
                {new Date(detail.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>PM10:</strong> {detail.pm10}
              </p>
              <p>
                <strong>PM2.5:</strong> {detail.pm2_5}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  menu: {
    position: "fixed",
    right: "5px",
    top: "10px",
    width: "300px",
    height: "400px",
    backgroundColor: "white",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "15px",
    zIndex: "1000",
    overflowY: "auto",
    padding: "10px",
  },
  header: {
    backgroundColor: "#4A90E2",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    padding: "5px",
    textAlign: "center",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  dateButton: {
    margin: "5px",
    fontSize: "14px",
    padding: "10px 15px",
    backgroundColor: "#4A90E2",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
  backButton: {
    margin: "5px",
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AirQualityMenu;
