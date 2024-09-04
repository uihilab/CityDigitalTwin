export async function getTrainData() {
  try {
    const response = await fetch('https://mgwalker.github.io/amtrak-api/routes.json');
    const data = await response.json();
    // Tren programını işleme örneği
    data.forEach(route => {
      route.trains.forEach(train => {
        console.log(`Train Number: ${train.number}`);
        console.log(`Route: ${train.route}`);
        console.log('Stations:');
        train.stations.forEach(station => {
          console.log(`- Station Name: ${station.station.name}`);
          console.log(`  Departure Scheduled: ${new Date(station.departureScheduled)}`);
          console.log(`  Departure Actual: ${station.departureActual ? new Date(station.departureActual) : 'Not Departed Yet'}`);
          console.log(`  Arrival Scheduled: ${station.arrivalScheduled ? new Date(station.arrivalScheduled) : 'Not Available'}`);
          console.log(`  Lat: ${station.station.lat}`);
          console.log(`  Lon: ${station.station.lon}`);
        });
      });
      console.log('----------------------------------');
    });
    return data;
  } catch (error) {
    console.error('Error fetching train schedule:', error);
  }
}

export async function getTrainStationsData() {
  try {
    const response = await fetch("https://mgwalker.github.io/amtrak-api/stations.json");
    const data = await response.json();
    return data;
    // Tren programını işleme örneği
  } catch (error) {
    console.error('Error fetching stations data', error);
  }
  
}

export function createStationsStruct(data) {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data format');
    return [];
  }

  const result = [];

  data.forEach(station => {
      const struct = {
        vendor: station.code, // Tren ID'si olarak vendor kullanıldı
        path: [station.lon, station.lat],
        city: station.city
      };
      result.push(struct);
    });
  return result;
}


export function createStruct(data) {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data format');
    return [];
  }

  const result = [];

  data.forEach(route => {
    route.trains.forEach(train => {
      const struct = {
        vendor: train.id, // Tren ID'si olarak vendor kullanıldı
        path: train.stations.map(station => [station.station.lon, station.station.lat]),
        timestamps: train.stations.map((_, index) => index * 100) // Örnek zaman damgaları
      };
      result.push(struct);
    });
  });

  return result;
}

