import { serialize } from "stylis";

export async function getStreamSensors(lat, long, milesRange) {
  try {
    // Get stream sensors (sensor type 4)
    const sensors = await getSensorsByType(4, lat, long, milesRange);
    debugger;
    //return sensors;
    // Fetch data for each stream sensor
    const data = await Promise.all(
      sensors.map(async (sensor) => {
        sensor.data = await getStreamData(sensor.id); // Wait for the promise to resolve
        sensor.dataSource = sensor.data.dataSource;
        delete sensor.data.dataSource;
        return sensor; // Return the updated sensor
      })
    );

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

export async function getSoilMoistureSensors(lat, long, milesRange) {
  try {
    debugger;
    // Get soil moisture sensors (sensor type 15)
    const sensors = await getSensorsByType(15, lat, long, milesRange);

    // Fetch data for each community sensor
    //const data = await Promise.all(sensors.map((sensor) => getSoilMoistureData(sensor[0])));
    const data = await Promise.all(sensors.map(async (sensor) => {
      sensor.tooltip_data = await getSoilMoistureData(sensor.id);
      return sensor;
    }));

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

async function getSensorsByType(sensorType, lat, long, milesRange) {
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
    const sensorObjects = convertToObjects(filteredSensors);
    debugger;
    const result = filterByCoords(lat, long, milesRange, sensorObjects);
    return result;
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return [];
  }
}

function extractStreamDataTodaysLastValueFromHtml(htmlString) {
  // Use a regular expression to extract the days array
  const daysRegex = /var days = \[([^\]]+)\];/;
  const daysMatch = htmlString.match(daysRegex);
  let days = [];

  if (daysMatch) {
    // Extract the dates from the matched string, removing quotes and spaces
    days = daysMatch[1].replace(/['"]+/g, "").split(",");
  }

  // Use a regular expression to extract the data1 array
  const data1Regex = /var data1 = \[([^\]]+)\];/;
  const data1Match = htmlString.match(data1Regex);
  let data1 = [];

  if (data1Match) {
    // Extract the values from the matched string, converting them to numbers
    data1 = data1Match[1].split(",").map((value) => parseFloat(value.trim()));
  }

  // Since each day has 24 values, we need to group the data1 values into 24-value chunks
  const valuesPerDay = 24; // 24 values for each day

  // Normalize the "today" entry to the current date in MM/DD format
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}`;
  days = days.map((day) => (day === "today" ? todayStr : day));

  // Find the index of today's date
  const todayIndex = days.indexOf(todayStr);

  if (todayIndex === -1) {
    return null; // Return null if today is not in the data
  }

  // Calculate the slice for today's data
  const todayValues = data1.slice(todayIndex * valuesPerDay, (todayIndex + 1) * valuesPerDay);

  // Return today's last value (24th value)
  return todayValues.length > 0 ? todayValues[todayValues.length - 1] : null;
}

function extractStreamDataFromHtml(htmlString) {
  // Use a regular expression to extract the days array
  const daysRegex = /var days = \[([^\]]+)\];/;
  const daysMatch = htmlString.match(daysRegex);
  let days = [];

  if (daysMatch) {
    // Extract the dates from the matched string, removing quotes and spaces
    days = daysMatch[1].replace(/['"]+/g, "").split(",");
  }

  // Use a regular expression to extract the data1 array
  const data1Regex = /var data1 = \[([^\]]+)\];/;
  const data1Match = htmlString.match(data1Regex);
  let data1 = [];

  if (data1Match) {
    // Extract the values from the matched string, converting them to numbers
    data1 = data1Match[1].split(",").map((value) => parseFloat(value.trim()));
  }

  // Use a regular expression to extract the data source (IFC or USCS)
  const dataSourceRegex = /<div class="type">Stream Sensor \((IFC|USCS)\)<\/div>/;
  const dataSourceMatch = htmlString.match(dataSourceRegex);
  let dataSource = dataSourceMatch ? dataSourceMatch[1] : "Unknown";

  // Since each day has 24 values, we need to group the data1 values into 24-value chunks
  const valuesPerDay = 24; // 24 values for each day
  let groupedData = [];

  // Normalize the "today" entry to the current date in MM/DD format
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}`;
  days = days.map((day) => (day === "today" ? todayStr : day));

  for (let i = 0; i < days.length; i++) {
    let dayValues = data1.slice(i * valuesPerDay, (i + 1) * valuesPerDay);
    groupedData.push({
      date: days[i],
      values: dayValues,
    });
  }

  // Return the result as an object with metadata and the grouped data
  return {
    dataSource: dataSource,
    data: groupedData,
  };
}

function getTodaysLatestData(sensorData) {
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}/${today.getDate()}`; // Format as "M/DD"

  // Find today's data based on the formatted date
  const todayData = sensorData.find((entry) => entry.date === formattedDate);

  if (todayData && todayData.values.length > 0) {
    // Find the latest non-zero value from today's data (starting from the end)
    for (let i = todayData.values.length - 1; i >= 0; i--) {
      if (todayData.values[i] !== 0) {
        return todayData.values[i]; // Return the first non-zero value
      }
    }
  }

  // If no non-zero value is found, return null or handle accordingly
  return null;
}

// Helper function to fetch stream sensor data
export async function getStreamData(sensorid) {
  try {
    const response = await fetch(
      `https://ifis.iowafloodcenter.org/ifis/app/chart/chart-bridge.php?id=${sensorid}&idmain=0&type=4&level=0&multi=0&lft=0&rgt=0`
    );
    const streamData = await response.text();
    //const result = extractStreamDataTodaysLastValueFromHtml(streamData);
    const obj = extractStreamDataFromHtml(streamData);
    obj.today = getTodaysLatestData(obj.data);
    return obj;
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

function extractHydroStationData(htmlString) {
  // Create a temporary DOM element to hold the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Extract the data source from the type div
  const dataSourceElement = doc.querySelector('.type');
  const dataSource = dataSourceElement ? dataSourceElement.textContent.trim() : 'Unknown';

  // Extract the box.dwn content excluding the chartcanvas div
  const boxElement = doc.querySelector('.box.dwn');
  let boxContent = '';

  if (boxElement) {
    // Clone the boxElement to avoid modifying the original DOM
    const clonedBoxElement = boxElement.cloneNode(true);
    
    // Remove the chartcanvas div if it exists
    const chartCanvasElement = clonedBoxElement.querySelector('#chartcanvas');
    if (chartCanvasElement) {
      chartCanvasElement.remove();
    }

    // Remove all <a> elements
    const anchorElements = clonedBoxElement.querySelectorAll('a');
    anchorElements.forEach((anchor) => anchor.remove());

    // Replace all <br> or <br/> elements with a newline in the HTML
    clonedBoxElement.innerHTML = clonedBoxElement.innerHTML.replace(/<br\s*\/?>/gi, '\n');

    // Get the inner text of the remaining content inside box.dwn
    boxContent = clonedBoxElement.innerText.trim();
  }

  // Format the result
  const result = `
    Data Source: ${dataSource}
    ${boxContent}
  `.trim();

  return result;
}

// Helper function to fetch community sensor data
async function getSoilMoistureData(sensorid) {
  try {
    const response = await fetch(
      `https://ifis.iowafloodcenter.org/ifis/app/chart/chart-hydrostation.php?id=${sensorid}&idmain=0&type=1&multi=0&level=0`
    );
    const htmlData = await response.text();
    const strData = extractHydroStationData(htmlData);
    return strData;
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
  cleanedData = cleanedData
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\]/g, "]")
    .replace(/\[\s*,/g, "[");

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

function filterByCoords(lat, long, milesRange, sensors) {
  return sensors.filter((sensor) => {
    const sensorLat = sensor.latitude;
    const sensorLong = sensor.longitude;
    const distance = haversineDistance(lat, long, sensorLat, sensorLong);
    return distance <= milesRange;
  });
}
