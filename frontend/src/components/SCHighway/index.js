import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material'; // Kullanacağınız checkbox kütüphanesini ekleyin

// Verilen bir anahtar ve veri yolundaki GeoJSON verilerini yükler ve belirli bir özelliğe göre filtreler
export async function loadFilteredGeoJsonData(dataPath, propertyName) {
  const jsonData = await fetch(dataPath);
  const data = await jsonData.json();;
  const filteredData = data.features.filter(feature => feature.properties.highway === propertyName);
  return filteredData;
}

// Verilen bir anahtar ve veri yolundan GeoJSON verilerini yükler ve checkbox listesinde gösterir
export async function LoadAndFilterLayer({ dataPath, propertyName }) {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await loadFilteredGeoJsonData(dataPath, propertyName);
      setFilteredData(data);
    }

    fetchData();
  }, [dataPath, propertyName]);

  const handleCheckboxChange = () => {
    // Checkbox değişikliğini burada işleyin
  };

  return (
    <div>
      {filteredData.map((feature, index) => (
        <Checkbox key={index} onChange={handleCheckboxChange} />
      ))}
    </div>
  );
}

export default LoadAndFilterLayer;
