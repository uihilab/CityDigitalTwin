import Chart from 'chart.js/auto';
export async function FetchAirQuality(latitude = 42.569663, longitude = -92.479646) {

    debugger;
    const lat = latitude;
    const lon = longitude;
    // İsteği yap
    const options = { method: 'GET', headers: { accept: 'application/json' } };

    return fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5`, options)
        .then(response => response.json())
        .catch(err => console.error(err));
}

let chartInstance; // Grafik nesnesini saklayacak değişken

export async function renderAirQualityChart(airQualityData) {

    debugger;
    // Veriyi uygun formata dönüştürün
    const hourlyData = airQualityData.hourly;

    // hourly alanının içindeki alt alanlara eriş
    const labels = hourlyData.time;
    const pm10Values = hourlyData.pm10;
    const pm25Values = hourlyData.pm2_5;

    // Canvas elementini alın
    const canvas = document.getElementById('airQualityCanvas');

    // Canvas'ı boyutlandırın
    canvas.width = 150;
    canvas.height = 25;

    // Chart varsa yok et
    if (chartInstance) {
        try {
            // Chart destroy edilir
            chartInstance.destroy();
        } catch (error) {
            console.error("An error occurred while destroying the previous chart:", error);
        }
    }

    // Canvas'a çizim yapın
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    chartInstance=new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'PM10',
                    data: pm10Values,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: 'PM2.5',
                    data: pm25Values,
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
}
