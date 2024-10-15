import Chart from "chart.js/auto";
import { IconLayer } from "@deck.gl/layers";

let menu = null;
let buttonsDiv = null; // Butonlar için global değişken
let canvas = null; // Canvas için global değişken

// Menüyü oluşturma fonksiyonu
export function createMenu() {
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "rightmenu";
    menu.style.position = "fixed";
    menu.style.right = "5px";
    menu.style.top = "10px";
    menu.style.width = "300px";
    menu.style.height = "400px";
    menu.style.backgroundColor = "white";
    menu.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
    menu.style.borderRadius = "15px";
    menu.style.zIndex = "1000";
    menu.style.overflowY = "auto";
    menu.style.padding = "10px";

    document.body.appendChild(menu);

    // Başlık kısmını oluştur
    const header = document.createElement("h3");

    header.style.backgroundColor = "#4A90E2"; // Başlık mavi
    header.style.borderRadius = "4px";
    header.style.fontSize = "18px";
    header.style.fontWeight = "bold";
    header.style.margin = "30px 10px 0 10px";
    header.style.color = "white"; // Beyaz yazı
    header.style.padding = "5px"; // Başlık padding
    header.style.borderTopLeftRadius = "10px";
    header.style.borderTopRightRadius = "10px";
    header.style.textAlign = "center"; // Ortalı başlık
    header.innerHTML = "Air Quality Summary";

    //document.body.appendChild(header);
    menu.appendChild(header);

    // X (kapat) butonunu oluşturma

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.style.position = "absolute";
    closeButton.style.top = "4px";
    closeButton.style.borderTopLeftRadius = "10px";
    closeButton.style.borderTopRightRadius = "10px";
    closeButton.style.right = "10px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#333"; // Siyah X işareti
    closeButton.addEventListener("click", () => {
      menu.remove(); // Menü kapat
      menu = null; // Temizle
    });

    //document.body.appendChild(closeButton);
    menu.appendChild(closeButton);

    // Butonlar için div oluştur
    buttonsDiv = document.createElement("div");
    buttonsDiv.style.marginTop = "10px";

    document.body.appendChild(buttonsDiv);
    //  menu.appendChild(buttonsDiv);
  }
}

export function removeMenu() {
  menu = null;
  document.getElementById("rightmenu").remove();
}

// Hava kalitesi verilerini çekme ve grafiği oluşturma
export async function FetchAirQuality(latitude, longitude) {
  const lat = latitude;
  const lon = longitude;
  const options = { method: "GET", headers: { accept: "application/json" } };

  return fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5`,
    options
  )
    .then((response) => response.json())
    .catch((err) => console.error(err));
}

let chartInstance = null;
let airQualityDataCache = null; // Veriyi önbelleğe almak için

export async function renderAirQualityChart(airQualityData) {
  if (canvas) {
    canvas.remove(); // Var olan canvas elementini kaldır
  }
  if (!menu) createMenu(); // Eğer menü oluşturulmadıysa oluştur
  buttonsDiv.innerHTML = ""; // Menüdeki eski içeriği temizle

  airQualityDataCache = airQualityData; // Veriyi önbelleğe al
  const hourlyData = airQualityData.hourly;
  const timeArray = hourlyData.time;
  const pm10Values = hourlyData.pm10;
  const pm25Values = hourlyData.pm2_5;

  // Günlük ortalama hesaplaması için verileri gruplandırma
  const dailyData = {};
  timeArray.forEach((timeString, index) => {
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
      pm25: pm25Values[index],
    });
  });

  // Günlük ortalama değerleri hesaplama
  const labels = Object.keys(dailyData);
  const dailyPm10Values = labels.map((date) => dailyData[date].pm10Sum / dailyData[date].count);
  const dailyPm25Values = labels.map((date) => dailyData[date].pm25Sum / dailyData[date].count);

  // Canvas elementini oluştur ve menüye ekle
  canvas = document.createElement("canvas");
  canvas.id = "airQualityCanvas";
  canvas.width = 280; // Menü içinde uygun boyutlandırma
  canvas.height = 200;
  menu.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
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

  //menu.appendChild(buttonsDiv);

  // Butonları oluşturma ve detayları gösterme

  //buttonsDiv.innerHTML = ''; // Önceki içerikleri temizle
  labels.forEach((date) => {
    const button = document.createElement("button");
    button.innerHTML = date;
    button.style.margin = "5px";
    button.style.fontSize = "14px";
    button.style.padding = "10px 15px";
    button.style.marginRight = "8px";
    button.style.borderRadius = "5px";
    button.style.backgroundColor = "#4A90E2";
    button.style.color = "white";
    button.style.border = "none";
    button.style.cursor = "pointer";

    button.addEventListener("click", () => {
      showDailyDetails(dailyData[date].details, date);
    });
    buttonsDiv.appendChild(button);
  });

  menu.appendChild(buttonsDiv);
}

// Detayları gösterme fonksiyonu
export function showDailyDetails(details, date) {
  let existingDetailsDiv = document.getElementById("detailsDiv");
  if (existingDetailsDiv) {
    existingDetailsDiv.remove(); // Önceki detayları kaldır
  }
  // Detayları göstermeden önce canvas ve butonları gizle
  canvas.style.display = "none";
  buttonsDiv.style.display = "none";
  buttonsDiv.style.right = "10";

  // Detay içeriğini oluşturma
  const detailsDiv = document.createElement("div");
  detailsDiv.style.position = "relative";
  detailsDiv.style.right = "10";

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  backButton.style.margin = "5px";
  backButton.style.backgroundColor = "#4A90E2";
  backButton.style.color = "white";
  backButton.style.padding = "10px 20px";
  backButton.style.border = "none";
  backButton.style.borderRadius = "5px";
  backButton.style.right = "10px";
  backButton.style.cursor = "pointer";

  backButton.addEventListener("click", () => {
    debugger;
    // Geri butonuna tıklandığında temizlik ve varsayılan içerikleri geri yükle
    detailsDiv.remove();
    canvas.style.display = "block";
    buttonsDiv.style.display = "block";
  });
  detailsDiv.appendChild(backButton);

  // İçerik için ayrı bir container oluşturma
  const contentDiv = document.createElement("div");
  contentDiv.style.marginTop = "10px"; // Geri butonunun altına boşluk bırakmak için
  // Alternatif olarak padding kullanabilirsiniz

  // Detay içeriklerini oluşturma ve contentDiv'e ekleme
  details.forEach((detail) => {
    const time = new Date(detail.time); // Zamanı alıyoruz
    const hour = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Sadece saat ve dakika

    const detailItem = document.createElement("div");
    detailItem.style.fontSize = "14px";
    detailItem.style.marginBottom = "20px";
    detailItem.style.textAlign = "justify";
    detailItem.style.lineHeight = "1.5";
    detailItem.style.padding = "0 10px";

    // Saat bilgisi
    const hourStrong = document.createElement("strong");
    hourStrong.style.color = "#333";
    hourStrong.textContent = "Hour:";
    detailItem.appendChild(hourStrong);
    detailItem.innerHTML += ` ${hour} <br>`;

    // PM10 bilgisi
    const pm10Strong = document.createElement("strong");
    pm10Strong.style.color = "#333";
    pm10Strong.textContent = "PM10:";
    detailItem.appendChild(pm10Strong);
    detailItem.innerHTML += ` ${detail.pm10} <br>`;

    // PM2.5 bilgisi
    const pm25Strong = document.createElement("strong");
    pm25Strong.style.color = "#333";
    pm25Strong.textContent = "PM2.5:";
    detailItem.appendChild(pm25Strong);
    detailItem.innerHTML += ` ${detail.pm25}`;

    contentDiv.appendChild(detailItem);
  });

  // contentDiv'i detailsDiv'e ekleme
  detailsDiv.appendChild(contentDiv);

  const backButtonD = document.createElement("button");
  backButtonD.innerHTML = "Back";
  backButtonD.style.margin = "5px";
  backButtonD.style.backgroundColor = "#4A90E2";
  backButtonD.style.color = "white";
  backButtonD.style.padding = "10px 20px";
  backButtonD.style.border = "none";
  backButtonD.style.borderRadius = "5px";
  backButtonD.style.right = "10px";
  backButtonD.style.cursor = "pointer";

  backButtonD.addEventListener("click", () => {
    debugger;
    // Geri butonuna tıklandığında temizlik ve varsayılan içerikleri geri yükle
    detailsDiv.remove();
    canvas.style.display = "block";
    buttonsDiv.style.display = "block";
  });
  detailsDiv.appendChild(backButtonD);

  // detailsDiv'i menüye ekleme
  menu.appendChild(detailsDiv);
}

export function addIconToMap(latitude, longitude) {
  const icon = new IconLayer({
    id: "AQuality",
    data: [{ position: [longitude, latitude] }],
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: (d) => "paragon-5-orange",
    sizeScale: 6,
    getPosition: (d) => d.position,
    getSize: (d) => 5,
    getColor: (d) => [Math.sqrt(d.exits), 140, 0],
  });

  return icon;
}
