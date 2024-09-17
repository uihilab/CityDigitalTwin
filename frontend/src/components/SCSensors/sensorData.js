import { serialize } from "stylis";

export async function getStreamSensors(lat, long, milesRange) {
  try {
    // Get stream sensors (sensor type 4)
    const sensors = await getSensorsByType(4, lat, long, milesRange);
console.log(sensors);
return sensors;
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

function convertToObjects(dataArray) {
  return dataArray.map((item) => {
    // Map the first three elements to specific properties
    let obj = {
      id: item[0],
      latitude: item[1],
      longitude: item[2],
      sensorType: item[3],
    };

    // Add remaining elements with more generic names if they exist
    if (item.length > 4) {
      obj.value1 = item[4];
    }
    if (item.length > 5) {
      obj.value2 = item[5];
    }
    if (item.length > 6) {
      obj.value3 = item[6];
    }

    return obj;
  });
}

async function getSensorsByType(sensorType) {
  try {
    // Fetch data from the URL
    const response = await fetch(
      "https://ifis.iowafloodcenter.org/ifis/app/inc/inc_get_object.php?id=0&subid=0"
    );

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the response text (since it's not valid JSON)
    const textData = await response.text();

    // Assuming the parseData function can handle HTML or other non-JSON formats
    const parsedData = parseData(textData);

    // Extract the sensors data (depending on the actual structure of parsed data)
    const sensors = parsedData[2]; // Adjust based on your parseData logic
    
    // Ensure sensors exist
    if (!sensors || !Array.isArray(sensors)) {
      throw new Error("No sensor data found in the response.");
    }

    // Filter the sensors by the specified sensor type
    const filteredSensors = sensors.filter((sensor) => sensor[3] === sensorType);
    const result = convertToObjects(filteredSensors);
    return result;
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
      `https://ifis.iowafloodcenter.org/ifis/app/chart/chart-raingauge.php?id=${sensorid}&idmain=0&type=17&level=0`
    );
    const rainData = await response.json();
    return rainData;
  } catch (error) {
    console.error(`Error fetching rain data for sensor ${sensorid}:`, error);
    return null;
  }
}

function parseData(data) {
  // Removes HTML tags
  let cleanedData = data.replace(/<\/?[^>]+(>|$)/g, ""); 
  
  // Removes new lines, tabs, etc.
  cleanedData = cleanedData.replace(/[\n\r\t]/g, ""); 
  
  // Replace single quotes with double quotes
  cleanedData = cleanedData.replace(/'/g, '"');
  
  // Removes extra commas (like ,,, or [, , ,] )
  cleanedData = cleanedData.replace(/,\s*,/g, ",").replace(/,\s*\]/g, "]").replace(/\[\s*,/g, "[");
  
  // Remove any empty array items like [,,]
  cleanedData = cleanedData.replace(/\[,*,\]/g, "[]");

  let parsedData = "";
  try {
    parsedData = JSON.parse(cleanedData);
    console.log(parsedData);
  } catch (error) {
    console.error("Error parsing cleaned data", error);
    console.error("Cleaned Data:", cleanedData); // Log the cleaned data for further debugging
  }
  return parsedData;
}



export async function getWaterLevelSensors(lat, long, milesRange) {
  try {
    // Fetch the data from the specified URL
    const response = await fetch("https://ifis.iowafloodcenter.org/ifis/ws/sites.php?format=tab");
    const textData = await response.json();

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
