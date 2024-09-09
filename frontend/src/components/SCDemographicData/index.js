import { useState } from "react";
import { Bar } from "react-chartjs-2";

export const SCDemographicData = ({ isChartVisible, menuContent, setIsMenuOpenDemographic, setIsChartVisible, setMenuContent }) => {
    //const [isMenuOpen, setIsMenuOpen] = useState(false); // Menü kontrolü için state
    // const [menuContent, setMenuContent] = useState("");
    //const [isChartVisible, setIsChartVisible] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);

    const [chartData, setChartData] = useState({
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Language',
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 2,
                data: [65, 59, 80, 81, 56, 55, 40],
            }
        ]
    });
    return (

        <div
            style={{
                position: "absolute",
                right: "10px",  // Sağdan boşluk
                top: "3px",    // Üstten boşluk
                width: "300px",
                height: "auto",
                padding: "10px",
                backgroundColor: "white",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",  // Köşeler yuvarlak
                zIndex: 1000,
            }}
        >
            <button
                onClick={() => setIsMenuOpenDemographic(false)}
                style={{
                    position: 'absolute',
                    top: '4px',
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '15px',
                    cursor: 'pointer'
                }}
            >
                &times;
            </button>
            <h3
                style={{
                    borderRadius: '4px', 
                    fontSize: '16px',
                    backgroundColor: "#4A90E2",  // Mavi başlık rengi
                    color: "white",
                    padding: "5px",  // Başlığa padding eklendi
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    fontSize: "18px",  // Büyük yazı boyutu
                    fontWeight: "bold",  // Kalın yazı
                    textAlign: "center",  // Yazı ortalanacak
                    margin: "30px 10px 0 10px",  // Üstten ve yanlardan boşluk eklendi
                }}
            >
                Black Hawk County Summary
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "20px", textAlign: "justify", lineHeight: "1.5", padding: "0 10px" }}>
                {menuContent}
            </p>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                    style={{
                        fontSize: "14px",
                        padding: "10px 15px",
                        marginRight: "8px",
                        borderRadius: "5px",
                        backgroundColor: "#4A90E2",  // Mavi buton
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() =>
                        handleButtonClick(
                            'language',
                            setChartData,
                            setIsChartVisible,
                            setMenuContent,
                            setShowBackButton
                        )
                    }
                >
                    Language
                </button>
                <button
                    style={{
                        fontSize: "14px",
                        padding: "10px 15px",
                        marginRight: "8px",
                        borderRadius: "5px",
                        backgroundColor: "#4A90E2",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() =>
                        handleButtonClick(
                            'education',
                            setChartData,
                            setIsChartVisible,
                            setMenuContent,
                            setShowBackButton
                        )
                    }
                >
                    Education
                </button>
                {showBackButton && (
                    <button
                        style={{
                            fontSize: "14px",
                            padding: "10px 10px",
                            borderRadius: "5px",
                            backgroundColor: "#4A90E2",  // Mavi buton
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                        onClick={() =>
                            handleButtonClick(
                                'back',
                                setChartData,
                                setIsChartVisible,
                                setMenuContent,
                                setShowBackButton
                            )
                        }
                    >
                        Back
                    </button>
                )}
            </div>

            {isChartVisible && (
                <table style={{ width: "100%", textAlign: "left", marginTop: "20px", fontSize: "14px" }}>
                <thead>
                    <tr>
                    <th style={{ fontWeight: "bold", color: "#4A90E2", padding: "5px" }}>
                                {chartData.datasets[0].label === 'Language Spoken at Home' ? 'Language spoken at home' : 'Education Level'}
                            </th>
                            <th style={{ fontWeight: "bold", color: "#4A90E2", padding: "5px" }}>
                                {chartData.datasets[0].label === 'Language Spoken at Home' ? 'Percentage' : 'Percentage'}
                            </th>
                    </tr>
                </thead>
                <tbody>
                    {chartData.labels.map((label, index) => (
                        <tr key={index}>
                            <td style={{ padding: "5px", color: "#333", fontWeight: "normal" }}>{label}</td>
                            <td style={{ padding: "5px", color: "#333", fontWeight: "normal" }}>{chartData.datasets[0].data[index]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                    style={{
                        fontSize: "14px",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: "#4A90E2",  // Mavi buton
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setIsMenuOpenDemographic(false)}
                >
                    Close
                </button>
            </div>
        </div>
    )
}


// API verilerini almak için asenkron bir fonksiyon tanımlayın
export async function fetchDataFromApis() {

    // API isteklerini paralel olarak başlatın
    const [response1, response2, response3, response4, response5, response6] = await Promise.all([
        fetch('https://data.census.gov/api/profile/content/topic?g=050XX00US19013&infoSection=Age%20and%20Sex'),
        fetch('https://data.census.gov/api/profile/content/topic?g=050XX00US19013&infoSection=Older%20Population'),
        fetch('https://data.census.gov/api/profile/content/topic?g=050XX00US19013&infoSection=Poverty'),
        fetch('https://api.census.gov/data/2020/dec/pl?get=group(P1)&ucgid=0500000US19013'),
        fetch('https://api.census.gov/data/2021/cbp?get=group(CB2100CBP)&NAICS2017=pseudo(N0200.00)&ucgid=0500000US19013'),
        fetch('https://api.census.gov/data/2022/acs/acs1/subject?get=group(S1901)&ucgid=0500000US19013')
    ]);

    // Tüm isteklerin başarılı olup olmadığını kontrol edin
    if (!response1.ok || !response2.ok || !response3.ok || !response4.ok || !response5.ok || !response6.ok) {
        throw new Error('HTTP error! One or more requests failed.');
    }


    // Gelen verileri JSON formatında çözümleyin
    const [data1, data2, data3, data4, data5, data6] = await Promise.all([
        response1.json(),
        response2.json(),
        response3.json(),
        response4.json(),
        response5.json(),
        response6.json()
    ]);

    // Verileri kendi oluşturduğunuz yapıdaki bir değişkene atayın
    const combinedData = {
        source1: {
            desc0: data1.measureData.stats[0][0].description,
            data0: data1.measureData.stats[0][0].estimate,
            //desc1: data1.measureData.stats[1].description,
            //data1: data1.measureData.stats[1].estimate,
            location: data1.location,
        },
        source2: {
            desc0: data2.measureData.stats[0][0].description,
            data0: data2.measureData.stats[0][0].estimate,
        },
        source3: {
            desc0: data3.measureData.stats[0][0].description,
            data0: data3.measureData.stats[0][0].estimate,
        },
        source4: {
            data0: data4[1][2],
        },
        source5: {
            data0: data5[1][0],
        },
        source6: {
            data0: data6[1][46],
        },
    };

    return combinedData;
}

// fetchDataFromApis fonksiyonunu çağırarak işlemi başlatın
//fetchDataFromApis();

// Import necessary libraries
import { PolygonLayer } from "@deck.gl/layers";

// export async function drawBlackHawkCounty() {
//     // Black Hawk County border coordinates
//     const blackHawkCountyBorder = [
//         { lat: 42.642729, lng: -92.508407 },
//         { lat: 42.299418, lng: -92.482915 },
//         { lat: 42.299418, lng: -92.060234 },
//         { lat: 42.642729, lng: -92.060234 },
//         { lat: 42.642729, lng: -92.508407 }
//     ];

//     // Create a Deck.gl PolygonLayer
//     const blackHawkLayer = new PolygonLayer({
//         id: 'polygon-layer',
//         data: [
//             {
//                 polygon: blackHawkCountyBorder.map(coord => [coord.lng, coord.lat])
//             }
//         ],
//         getPolygon: d => d.polygon,
//         getFillColor: [0, 0, 0, 0],
//         getLineColor: [255, 0, 0, 255],
//         getLineWidth: 100, // Adjust this to fit your needs
//         lineWidthMinPixels: 2,
//     });
//     return blackHawkLayer;
// }
export const isPointInsidePolygon = (point, polygon) => {
  const x = point.geometry.coordinates[0];
  const y = point.geometry.coordinates[1];
  const coordinates = polygon.geometry.coordinates[0];
  let isInside = false;
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const yi = coordinates[i].lng;
    const xi = coordinates[i].lat;
    const yj = coordinates[j].lng;
    const xj = coordinates[j].lat;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

// export const useChartData = () => {
//     const [chartData, setChartData] = useState({
//         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         datasets: [
//             {
//                 label: 'language',
//                 backgroundColor: 'rgba(75,192,192,1)',
//                 borderColor: 'rgba(0,0,0,1)',
//                 borderWidth: 2,
//                 data: [65, 59, 80, 81, 56, 55, 40],
//             }
//         ]
//     });
//     return [chartData, setChartData];
// };



export const handleButtonClick = async (buttonType, setChartData, setIsChartVisible, setMenuContent, setShowBackButton) => {

    const fetchChartData = async () => {
        // API çağrısı burada yapılmalı
        // Bu örnekte, API cevabını bir değişkene sabit olarak ekliyoruz
        // Gerçek uygulamada, fetch veya axios ile veri alınmalıdır.
        const apiResponse = await fetch("https://data.census.gov/api/profile/content/topic?g=050XX00US19013&infoSection=Language%20Spoken%20at%20Home");
        const data = await apiResponse.json();
        return data;
    }

    // Butona göre içeriği değiştir
    if (buttonType === 'language') {
        const apiData = await fetchChartData();
        debugger;
        // Chart data oluşturma
        const labels = apiData.vizData.stats.map(stats => stats.description);
        const dataValues = apiData.vizData.stats.map(stat => parseFloat(stat.value));

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Language Spoken at Home',
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: dataValues,
                }
            ]
        });
    } else if (buttonType === 'education') {
        setChartData({
            labels: ['High school or equivalent degree', 'Some college, no degree', 'Associate degree', 'Bachelor degree', 'Graduate or professional degree'],
            datasets: [
                {
                    label: 'Education',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 2,
                    data: [29.2, 18.7, 13.0, 19.5, 12.7],
                }
            ]
        });
    }
    if (buttonType === 'back') {
        const data = await fetchDataFromApis(); // Veriyi tekrar almak için
        setMenuContent(<div>
            <div>Populations and People: {data.source4.data0}</div>
            <div>Medium Age: {data.source1.data0}</div>
            <div>Over Age 64: {data.source2.data0}%</div>
            <div>Number of Employment: {data.source5.data0}</div>
            <div>Household median income: {data.source6.data0}</div>
            <div>Poverty: {data.source3.data0}%</div>
        </div>);
        setIsChartVisible(false);
        setShowBackButton(false); // Geri butonunu gizlemek için
        return; // İşlevi sonlandırmak için
    }
    setIsChartVisible(true);
    setMenuContent(null);
    setShowBackButton(true);
};
