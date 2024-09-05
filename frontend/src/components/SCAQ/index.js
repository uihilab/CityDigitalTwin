import Chart from 'chart.js/auto';
import { IconLayer } from "@deck.gl/layers";

let menu = null;
let buttonsDiv = null; // Butonlar için global değişken
let canvas = null; // Canvas için global değişken

// Menüyü oluşturma fonksiyonu
export function createMenu() {
    if (!menu) {
        menu = document.createElement('div');
        menu.id = "rightmenu";
        menu.style.position = 'fixed';
        menu.style.right = '5px';
        menu.style.top = '10px';
        menu.style.width = '300px';
        menu.style.height = '400px';
        menu.style.backgroundColor = 'white';
        menu.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
        menu.style.borderRadius = '15px';
        menu.style.zIndex = '1000';
        menu.style.overflowY = 'auto';
        document.body.appendChild(menu);

        // Butonlar için div oluştur
        buttonsDiv = document.createElement('div');
        buttonsDiv.style.marginTop = '10px';
        menu.appendChild(buttonsDiv);
    }
}

// Hava kalitesi verilerini çekme ve grafiği oluşturma
export async function FetchAirQuality(latitude, longitude) {
    const lat = latitude;
    const lon = longitude;
    const options = { method: 'GET', headers: { accept: 'application/json' } };

    return fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5`, options)
        .then(response => response.json())
        .catch(err => console.error(err));
}

let chartInstance = null;
let airQualityDataCache = null; // Veriyi önbelleğe almak için

export async function renderAirQualityChart(airQualityData) {
    menu.innerHTML='';
    airQualityDataCache = airQualityData; // Veriyi önbelleğe al
    const hourlyData = airQualityData.hourly;
    const timeArray = hourlyData.time;
    const pm10Values = hourlyData.pm10;
    const pm25Values = hourlyData.pm2_5;

    // Günlük ortalama hesaplaması için verileri gruplandırma
    const dailyData = {};
    timeArray.forEach((timeString, index) => {
        const date = new Date(timeString);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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

    menu.appendChild(buttonsDiv);
    // Butonları oluşturma ve detayları gösterme
    buttonsDiv.innerHTML = ''; // Önceki içerikleri temizle
    labels.forEach(date => {
        const button = document.createElement('button');
        button.innerHTML = date;
        button.style.margin = '5px';
        button.addEventListener('click', () => {
            showDailyDetails(dailyData[date].details, date);
        });
        buttonsDiv.appendChild(button);
    });
}

// Detayları gösterme fonksiyonu
export function showDailyDetails(details, date) {
    // Detayları göstermeden önce canvas ve butonları gizle
    canvas.style.display = 'none';
    buttonsDiv.style.display = 'none';

    // Detay içeriğini oluşturma
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `<h3>${date} Detayları</h3>`;

    const backButton = document.createElement('button');
    backButton.innerHTML = 'Geri';
    backButton.style.margin = '5px';
    backButton.addEventListener('click', () => {
        // Geri butonuna tıklandığında temizlik ve varsayılan içerikleri geri yükle
        detailsDiv.remove();
        canvas.style.display = 'block';
        buttonsDiv.style.display = 'block';
    });

    const detailsContent = details.map(detail => `
        <div>
            <strong>Time:</strong> ${detail.time} <br>
            <strong>PM10:</strong> ${detail.pm10} <br>
            <strong>PM2.5:</strong> ${detail.pm25}
        </div>
        <hr>
    `).join('');

    detailsDiv.innerHTML += detailsContent;
    detailsDiv.appendChild(backButton);
    menu.appendChild(detailsDiv);
}

export function addIconToMap(latitude, longitude) {
    const icon = new IconLayer({
        id: 'AQuality',
        data: [{ position: [longitude,latitude ]}],
        pickable: true,
        iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
        iconMapping:  `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
        getIcon: (d) => "paragon-5-orange",
        sizeScale: 15,
        getPosition: d => d.position,
        getSize: d => 5,
        getColor: d => [Math.sqrt(d.exits), 140, 0],
    });

   return icon;
}
