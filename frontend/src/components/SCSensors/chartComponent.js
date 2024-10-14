import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const ChartComponent = ({ chartData }) => {
    // Prepare the labels (dates) and datasets (values)
    const labels = chartData.map(day => day.date);

    // Flatten the values array to align with the number of hours in a day (24 hours)
    const values = chartData.map(day => day.values).flat();

    // Generate time labels for each hour (assuming data per day has 24 entries)
    const timeLabels = labels.flatMap(date => 
        [...Array(24).keys()].map(hour => `${date} ${hour}:00`)
    );

    // Prepare the data for the Line chart
    const data = {
        labels: timeLabels,
        datasets: [
            {
                label: 'Water Elevation (ft)',
                data: values,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            }
        ]
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Water Elevation (ft)'
                }
            }
        }
    };

    return (
        <div>
            <h2>Water Elevation Over Time</h2>
            <Line data={data} options={options} />
        </div>
    );
};

export default ChartComponent;
