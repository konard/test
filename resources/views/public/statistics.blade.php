<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Статистика - Антикоррупционный мониторинг</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .chart-container {
            background: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .chart-container h2 {
            margin-bottom: 20px;
            color: #333;
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
        }
        @media (max-width: 768px) {
            .chart-wrapper {
                height: 300px;
            }
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <header>
        <h1>Статистика коррупционных дел</h1>
        <p>Визуализация данных по регионам и типам нарушений</p>
    </header>

    <div class="container">
        <div id="loading" class="loading">
            Загрузка данных...
        </div>

        <div id="charts" style="display: none;">
            <div class="chart-container">
                <h2>Динамика по годам</h2>
                <div class="chart-wrapper">
                    <canvas id="yearChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h2>Топ-5 регионов по количеству дел</h2>
                <div class="chart-wrapper">
                    <canvas id="regionChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h2>Распределение по типам нарушений</h2>
                <div class="chart-wrapper">
                    <canvas id="violationChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h2>Распределение по статусам дел</h2>
                <div class="chart-wrapper">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Fetch statistics data
        fetch('/api/statistics')
            .then(response => response.json())
            .then(data => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('charts').style.display = 'block';

                // Chart 1: By Year (Line Chart)
                const yearCtx = document.getElementById('yearChart').getContext('2d');
                new Chart(yearCtx, {
                    type: 'line',
                    data: {
                        labels: data.by_year.map(item => item.year),
                        datasets: [{
                            label: 'Количество дел',
                            data: data.by_year.map(item => item.total),
                            borderColor: '#3498db',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Chart 2: Top Regions (Bar Chart)
                const regionCtx = document.getElementById('regionChart').getContext('2d');
                new Chart(regionCtx, {
                    type: 'bar',
                    data: {
                        labels: data.top_regions.map(item => item.name),
                        datasets: [{
                            label: 'Количество дел',
                            data: data.top_regions.map(item => item.total),
                            backgroundColor: [
                                '#e74c3c',
                                '#e67e22',
                                '#f39c12',
                                '#f1c40f',
                                '#95a5a6'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Chart 3: Violation Types (Pie Chart)
                const violationCtx = document.getElementById('violationChart').getContext('2d');
                new Chart(violationCtx, {
                    type: 'pie',
                    data: {
                        labels: data.by_violation_type.map(item => item.violation_type),
                        datasets: [{
                            data: data.by_violation_type.map(item => item.total),
                            backgroundColor: [
                                '#e74c3c',
                                '#3498db',
                                '#2ecc71',
                                '#f39c12',
                                '#9b59b6',
                                '#1abc9c',
                                '#95a5a6'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });

                // Chart 4: Status (Doughnut Chart)
                const statusCtx = document.getElementById('statusChart').getContext('2d');
                new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: data.by_status.map(item => item.status),
                        datasets: [{
                            data: data.by_status.map(item => item.total),
                            backgroundColor: [
                                '#f39c12',
                                '#2ecc71',
                                '#95a5a6',
                                '#e74c3c'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Ошибка загрузки данных:', error);
                document.getElementById('loading').innerHTML = 'Ошибка загрузки данных';
            });
    </script>
</body>
</html>
