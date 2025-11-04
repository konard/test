<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Карта коррупции - Антикоррупционный мониторинг</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
        }
        header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        #map {
            width: 100%;
            height: 600px;
        }
        .legend {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: absolute;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            min-width: 200px;
        }
        .legend h4 {
            margin-bottom: 10px;
            color: #333;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .legend-color {
            width: 30px;
            height: 20px;
            margin-right: 10px;
            border: 1px solid #999;
        }
        .info-panel {
            padding: 20px;
            background: #f5f5f5;
        }
        .tooltip {
            background: white;
            padding: 10px;
            border: 2px solid #333;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <header>
        <h1>Антикоррупционный мониторинг</h1>
        <p>Интерактивная карта коррупционных дел по регионам России</p>
    </header>

    <div id="map"></div>

    <div class="legend">
        <h4>Уровень коррупции</h4>
        <div class="legend-item">
            <div class="legend-color" style="background: #fee5d9;"></div>
            <span>Низкий (0-10)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #fcae91;"></div>
            <span>Средний (11-30)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #fb6a4a;"></div>
            <span>Высокий (31-50)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #de2d26;"></div>
            <span>Очень высокий (51+)</span>
        </div>
    </div>

    <div class="info-panel">
        <h3>О проекте</h3>
        <p>Данная система позволяет отслеживать статистику коррупционных дел с сохранением анонимности должностных лиц согласно ФЗ-152 "О персональных данных".</p>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map
        const map = L.map('map').setView([55.75, 37.62], 5);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        // Color scale function
        function getColor(cases) {
            return cases > 50 ? '#de2d26' :
                   cases > 30 ? '#fb6a4a' :
                   cases > 10 ? '#fcae91' :
                                '#fee5d9';
        }

        // Fetch region statistics
        fetch('/api/region-stats')
            .then(response => response.json())
            .then(data => {
                // Add each region to the map
                data.forEach(region => {
                    const geojson = JSON.parse(region.geojson);
                    const cases = region.cases_count;

                    const layer = L.geoJSON(geojson, {
                        style: {
                            fillColor: getColor(cases),
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.7
                        }
                    }).addTo(map);

                    // Add popup
                    layer.bindPopup(`
                        <div class="tooltip">
                            <strong>${region.name}</strong><br>
                            Количество дел: ${cases}
                        </div>
                    `);

                    // Highlight on hover
                    layer.on('mouseover', function() {
                        this.setStyle({ weight: 4 });
                    });

                    layer.on('mouseout', function() {
                        this.setStyle({ weight: 2 });
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка загрузки данных:', error);
            });
    </script>
</body>
</html>
