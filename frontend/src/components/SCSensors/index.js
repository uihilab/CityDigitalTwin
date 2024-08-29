export async function getStreamSensors(lat, long, milesRange) {
  try {
    // Get stream sensors (sensor type 4)
    const sensors = await getSensorsByType(4, lat, long, milesRange);

    // Fetch data for each stream sensor
    const data = await Promise.all(sensors.map((sensor) => getStreamData(sensor[0])));

    return data;
  } catch (error) {
    console.error("Error fetching stream sensors data:", error);
    return [];
  }
}

export async function getCommunitySensors(lat, long, milesRange) {
  try {
    // Get community sensors (sensor type 11)
    const sensors = await getSensorsByType(11, lat, long, milesRange);

    // Fetch data for each community sensor
    const data = await Promise.all(sensors.map((sensor) => getCommunityData(sensor[0])));

    return data;
  } catch (error) {
    console.error("Error fetching community sensors data:", error);
    return [];
  }
}

export async function getRainSensors(lat, long, milesRange) {
  try {
    // Get rain sensors (sensor type 17)
    const sensors = await getSensorsByType(17, lat, long, milesRange);

    // Fetch data for each rain sensor
    const data = await Promise.all(sensors.map((sensor) => getRainData(sensor[0])));

    return data;
  } catch (error) {
    console.error("Error fetching rain sensors data:", error);
    return [];
  }
}

async function getSensorsByType(sensorType) {
  try {
    // Fetch data from the URL
    const response = await fetch(
      "https://ifis.iowafloodcenter.org/ifis/app/inc/inc_get_object.php?id=0&subid=0"
    );
    const textData = await response.text();

    // Assuming the data returned is in a specific format, parse it
    const parsedData = parseData(textData);

    // Extract the sensor data (assuming it's in the third array)
    const sensors = parsedData[2];

    // Filter the sensors by the specified sensor type
    const filteredSensors = sensors.filter((sensor) => sensor[3] === sensorType);

    return filteredSensors;
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return [];
  }
}

// Helper function to fetch stream sensor data
async function getStreamData(sensorid) {
  try {
    const response = await fetch(
      `https://ifis.iowafloodcenter.org/ifis/app/chart/chart-bridge.php?id=${sensorid}&idmain=0&type=4&level=0&multi=0&lft=0&rgt=0`
    );
    const streamData = await response.json();
    return streamData;
  } catch (error) {
    console.error(`Error fetching stream data for sensor ${sensorid}:`, error);
    return null;
  }
}

// Helper function to fetch community sensor data
async function getCommunityData(sensorid) {
  try {
    const response = await fetch(
      `https://ifis.iowafloodcenter.org/ifis/app/chart/chart-community.php?id=${sensorid}&idmain=0&type=1&multi=0&level=0`
    );
    const communityData = await response.json();
    return communityData;
  } catch (error) {
    console.error(`Error fetching community data for sensor ${sensorid}:`, error);
    return null;
  }
}

// Helper function to fetch rain sensor data
async function getRainData(sensorid) {
  try {
    const response = await fetch(
      `https://ifis.iowafloodcenter.org/ifis/app/chart/chart-hydrostation.php?id=${sensorid}&idmain=0&type=15&level=0`
    );
    const rainData = await response.json();
    return rainData;
  } catch (error) {
    console.error(`Error fetching rain data for sensor ${sensorid}:`, error);
    return null;
  }
}

// Function to parse the raw text data into the expected array format
function parseData(textData) {
  // This is a placeholder function for parsing the text data.
  // Modify this according to the actual structure of the fetched data.
  return textData;
  // Example data structure
  const data = [
    [
      '<table cellspacing="0" cellpadding="0"><tbody><tr><td width="115"><b>Population</b></td><td>3,190,369</td></tr><tr><td><b>Land Area</b></td><td>55,872 sq mi</td></tr></tbody></table>|0',
    ],
    ["rainmetadata"],
    [
      [6119, 43.053, -91.39117, 19, ,],
      [5522, 42.4822, -95.7925, 17, ,],
      [6122, 43.07, -96.175, 19, ,],
      [6057, 42.02133, -92.112, 19, ,],
      // More sensor data...
    ],
  ];

  return data;
}

export async function getWaterLevelSensors(lat, long, milesRange) {
  try {
    // Fetch the data from the specified URL
    const response = await fetch("https://ifis.iowafloodcenter.org/ifis/ws/sites.php?format=tab");
    const textData = await response.text();

    // Split the text data by newlines to get each line of data
    const lines = textData.split("\n");

    // Initialize an array to hold the parsed sensor data
    const sensorData = [];

    // Skip the first few lines which are comments and process the rest
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith("#")) {
        // Split the line by tab characters to get each field
        const fields = line.split("\t");

        // Map the fields to an object for easier access
        const sensor = {
          IFC_Code: fields[0],
          IFC_Id: fields[1],
          Timestamp: fields[2],
          Water_Depth: parseFloat(fields[3]),
          Latitude: parseFloat(fields[4]),
          Longitude: parseFloat(fields[5]),
          River: fields[6],
          Road: fields[7],
          Town: fields[8],
          from_Sensor_to_River_Bottom: parseFloat(fields[9]),
        };

        // Add the sensor object to the array
        sensorData.push(sensor);
      }
    }

    // Filter the sensors by proximity
    const nearbySensors = filterByCoords(lat, long, milesRange, sensorData);

    return nearbySensors;
  } catch (error) {
    console.error("Error fetching or processing water level sensor data:", error);
    return [];
  }
}

export async function getWaterLevelData(site) {
  try {
    // Fetch data from the specified URL with the site parameter
    const url = `https://ifis.iowafloodcenter.org/ifis/ws/sites.php?site=${site}&period=72&format=tab`;
    const response = await fetch(url);
    const textData = await response.text();

    // Split the text data by newlines to process each line
    const lines = textData.split("\n");

    // Initialize an object to hold the metadata and data points
    const waterLevelData = {
      metadata: {},
      dataPoints: [],
    };

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("# IFC code:")) {
        waterLevelData.metadata.IFC_Code = line.split(":")[1].trim();
      } else if (line.startsWith("# Latitude:")) {
        waterLevelData.metadata.Latitude = parseFloat(line.split(":")[1].trim());
      } else if (line.startsWith("# Longitude:")) {
        waterLevelData.metadata.Longitude = parseFloat(line.split(":")[1].trim());
      } else if (line.startsWith("# River:")) {
        waterLevelData.metadata.River = line.split(":")[1].trim();
      } else if (line.startsWith("# Road:")) {
        waterLevelData.metadata.Road = line.split(":")[1].trim();
      } else if (line.startsWith("# Town:")) {
        waterLevelData.metadata.Town = line.split(":")[1].trim();
      } else if (line.startsWith("# From the sensor to the river bottom:")) {
        waterLevelData.metadata.SensorToRiverBottom = parseFloat(line.split(":")[1].trim());
      } else if (!line.startsWith("#") && line) {
        // Split the line by tab to get the timestamp and water depth
        const fields = line.split("\t");

        const dataPoint = {
          Timestamp: fields[0].trim(),
          Water_Depth: parseFloat(fields[1].trim()),
        };

        // Add the data point to the array
        waterLevelData.dataPoints.push(dataPoint);
      }
    }

    return waterLevelData;
  } catch (error) {
    console.error("Error fetching or processing water level data:", error);
    return null;
  }
}

// Haversine formula to calculate the distance between two lat/long points in miles
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (angle) => (angle * Math.PI) / 180;

  const R = 3958.8; // Radius of the Earth in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in miles
}

export function filterByCoords(lat, long, milesRange, sensors) {
  return sensors.filter((sensor) => {
    const sensorLat = sensor.Latitude;
    const sensorLong = sensor.Longitude;
    const distance = haversineDistance(lat, long, sensorLat, sensorLong);
    return distance <= milesRange;
  });
}
