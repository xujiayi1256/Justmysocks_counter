async function fetchData() {
    try {
        console.log("Fetching data...");
        const response = await fetch('bandwidth_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error("Could not fetch data:", error);
        return [];
    }
}

function createChart(data, index) {
    try {
        console.log(`Creating chart for data:`, JSON.stringify(data, null, 2));
        const limit = data.monthly_bw_limit_b / 1e9;
        const usage = data.bw_counter_b / 1e9;
        const resetDay = data.bw_reset_day_of_month;
        const name = data.name;

        const chartContainer = document.createElement('div');
        chartContainer.style.width = '300px';
        chartContainer.style.height = '300px';
        chartContainer.style.margin = '10px';

        const canvas = document.createElement('canvas');
        canvas.id = `chart-${index}`;
        chartContainer.appendChild(canvas);
        document.getElementById('charts-container').appendChild(chartContainer);

        console.log(`Canvas created with id: ${canvas.id}`);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to get 2D context for canvas');
        }

        console.log('Creating new Chart instance');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Used', 'Remaining'],
                datasets: [{
                    data: [Math.min(usage, limit), Math.max(0, limit - usage)],
                    backgroundColor: [usage > limit ? '#FF0000' : '#FF6384', '#36A2EB']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${name} (Reset: Day ${resetDay})${usage > limit ? ' - Exceeded' : ''}`
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += `${context.parsed.toFixed(2)} GB`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        console.log(`Chart created for index ${index}`);
    } catch (error) {
        console.error(`Error creating chart for index ${index}:`, error);
    }
}

async function init() {
    try {
        console.log('Initializing...');
        const allData = await fetchData();
        console.log("Fetched data:", allData);
        if (allData.length === 0) {
            console.warn('No data available');
            document.getElementById('charts-container').innerHTML = '<p>No data available. Please check the console for errors.</p>';
            return;
        }
        console.log(`Creating ${allData.length} charts`);
        for (let i = 0; i < allData.length; i++) {
            createChart(allData[i], i);
        }
        console.log('All charts created');
    } catch (error) {
        console.error("Error in init function:", error);
        document.getElementById('charts-container').innerHTML = '<p>An error occurred. Please check the console for details.</p>';
    }
}

document.addEventListener('DOMContentLoaded', init);