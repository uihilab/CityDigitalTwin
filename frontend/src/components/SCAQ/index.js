import Chart from 'chart.js/auto';
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

        if (!dailyData[dateString]) {
            dailyData[dateString] = { pm10Sum: 0, pm25Sum: 0, count: 0, details: [] };
        }

        dailyData[dateString].pm10Sum += pm10Values[index];
        dailyData[dateString].pm25Sum += pm25Values[index];
        dailyData[dateString].count += 1;
        dailyData[dateString].details.push({
            time: timeString,
            pm10: pm10Values[index],
            pm25: pm25Values[index]
        });
    });

    // Günlük ortalama değerleri hesaplama
    const labels = Object.keys(dailyData);
    const dailyPm10Values = labels.map(date => dailyData[date].pm10Sum / dailyData[date].count);
    const dailyPm25Values = labels.map(date => dailyData[date].pm25Sum / dailyData[date].count);

    // Canvas elementini oluştur ve menüye ekle
    canvas = document.createElement('canvas');
    canvas.id = 'airQualityCanvas';
    canvas.width = 280; // Menü içinde uygun boyutlandırma
    canvas.height = 200;
    menu.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Daily Average PM10',
                    data: dailyPm10Values,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: 'Daily Average PM2.5',
                    data: dailyPm25Values,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    //menu.appendChild(buttonsDiv);

    // Butonları oluşturma ve detayları gösterme

    //buttonsDiv.innerHTML = ''; // Önceki içerikleri temizle
    labels.forEach(date => {
        const button = document.createElement('button');
        button.innerHTML = date;
        button.style.margin = '5px';
        button.style.fontSize = '14px';
        button.style.padding = '10px 15px';
        button.style.marginRight = '8px';
        button.style.borderRadius = '5px';
        button.style.backgroundColor = '#4A90E2';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.cursor = 'pointer';

        button.addEventListener('click', () => {
            showDailyDetails(dailyData[date].details, date);
        });
        buttonsDiv.appendChild(button);
    });

    menu.appendChild(buttonsDiv);
}

// Detayları gösterme fonksiyonu
export function showDailyDetails(details, date) {
    // Detayları göstermeden önce canvas ve butonları gizle
    canvas.style.display = 'none';
    buttonsDiv.style.display = 'none';
    buttonsDiv.style.right = "10";

    // Detay içeriğini oluşturma
    const detailsDiv = document.createElement('div');
    detailsDiv.style.position = 'relative';
    detailsDiv.style.right = "10";

    const backButton = document.createElement('button');
    backButton.innerHTML = 'Back';
    backButton.style.margin = '5px';
    backButton.style.backgroundColor = "#4A90E2";
    backButton.style.color = "white";
    backButton.style.padding = "10px 20px";
    backButton.style.border = "none";
    backButton.style.borderRadius = "5px";
    backButton.style.right = '10px';
    backButton.style.cursor = "pointer";

    backButton.addEventListener('click', () => {
        debugger;
        // Geri butonuna tıklandığında temizlik ve varsayılan içerikleri geri yükle
        detailsDiv.remove();
        canvas.style.display = 'block';
        buttonsDiv.style.display = 'block';
    });
    detailsDiv.appendChild(backButton);

    // İçerik için ayrı bir container oluşturma
    const contentDiv = document.createElement('div');
    contentDiv.style.marginTop = '10px'; // Geri butonunun altına boşluk bırakmak için
    // Alternatif olarak padding kullanabilirsiniz

    // Detay içeriklerini oluşturma ve contentDiv'e ekleme
    details.forEach(detail => {
        const time = new Date(detail.time); // Zamanı alıyoruz
        const hour = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Sadece saat ve dakika

        const detailItem = document.createElement('div');
        detailItem.style.fontSize = '14px';
        detailItem.style.marginBottom = '20px';
        detailItem.style.textAlign = 'justify';
        detailItem.style.lineHeight = '1.5';
        detailItem.style.padding = '0 10px';

        // Saat bilgisi
        const hourStrong = document.createElement('strong');
        hourStrong.style.color = '#333';
        hourStrong.textContent = 'Hour:';
        detailItem.appendChild(hourStrong);
        detailItem.innerHTML += ` ${hour} <br>`;

        // PM10 bilgisi
        const pm10Strong = document.createElement('strong');
        pm10Strong.style.color = '#333';
        pm10Strong.textContent = 'PM10:';
        detailItem.appendChild(pm10Strong);
        detailItem.innerHTML += ` ${detail.pm10} <br>`;

        // PM2.5 bilgisi
        const pm25Strong = document.createElement('strong');
        pm25Strong.style.color = '#333';
        pm25Strong.textContent = 'PM2.5:';
        detailItem.appendChild(pm25Strong);
        detailItem.innerHTML += ` ${detail.pm25}`;

        contentDiv.appendChild(detailItem);
    });

    // contentDiv'i detailsDiv'e ekleme
    detailsDiv.appendChild(contentDiv);

    const backButtonD = document.createElement('button');
    backButtonD.innerHTML = 'Back';
    backButtonD.style.margin = '5px';
    backButtonD.style.backgroundColor = "#4A90E2";
    backButtonD.style.color = "white";
    backButtonD.style.padding = "10px 20px";
    backButtonD.style.border = "none";
    backButtonD.style.borderRadius = "5px";
    backButtonD.style.right = '10px';
    backButtonD.style.cursor = "pointer";

    backButtonD.addEventListener('click', () => {
        debugger;
        // Geri butonuna tıklandığında temizlik ve varsayılan içerikleri geri yükle
        detailsDiv.remove();
        canvas.style.display = 'block';
        buttonsDiv.style.display = 'block';
    });
    detailsDiv.appendChild(backButtonD);

    // detailsDiv'i menüye ekleme
    menu.appendChild(detailsDiv);
}

export function addIconToMap(latitude, longitude) {
    const icon = new IconLayer({
        id: 'AQuality',
        data: [{ position: [longitude, latitude] }],
        pickable: true,
        iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
        iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
        getIcon: (d) => "paragon-5-orange",
        sizeScale: 15,
        getPosition: d => d.position,
        getSize: d => 5,
        getColor: d => [Math.sqrt(d.exits), 140, 0],
    });

    return icon;
}
