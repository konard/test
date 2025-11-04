<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Импорт данных - Антикоррупционный мониторинг</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            background: #f5f5f5;
            padding: 30px;
            border-radius: 8px;
        }
        h1 {
            color: #333;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="file"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #0056b3;
        }
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #e7f3ff;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin-bottom: 20px;
        }
        .download-link {
            color: #007bff;
            text-decoration: none;
        }
        .download-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Импорт данных о коррупционных делах</h1>

        @if(session('success'))
            <div class="alert alert-success">
                <strong>{{ session('message') }}</strong>
                @if(session('errorReportPath'))
                    <br><br>
                    <a href="{{ route('admin.import.download-errors', ['path' => session('errorReportPath')]) }}" class="download-link">
                        Скачать отчет об ошибках
                    </a>
                @endif
            </div>
        @endif

        @if(session('success') === false)
            <div class="alert alert-error">
                <strong>{{ session('message') }}</strong>
            </div>
        @endif

        <div class="info">
            <strong>Требования к файлу:</strong>
            <ul>
                <li>Формат: CSV (UTF-8) или XLSX</li>
                <li>Максимальный размер: 64 МБ</li>
                <li>Максимальное количество строк: 5000</li>
            </ul>
            <strong>Обязательные колонки:</strong>
            <ul>
                <li><code>region</code> - Название региона</li>
                <li><code>position</code> - Должность</li>
                <li><code>violation_type</code> - Тип нарушения (взятка, злоупотребление, растрата, мошенничество, превышение полномочий, коммерческий подкуп, другое)</li>
                <li><code>date</code> - Дата в формате YYYY-MM-DD</li>
                <li><code>status</code> - Статус (расследуется, завершено, приостановлено, прекращено) - необязательно</li>
                <li><code>description</code> - Описание - необязательно</li>
            </ul>
        </div>

        <form action="{{ route('admin.import.upload') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label for="file">Выберите файл:</label>
                <input type="file" name="file" id="file" required accept=".csv,.xlsx">
                @error('file')
                    <div style="color: red; margin-top: 5px;">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit">Загрузить и импортировать</button>
        </form>
    </div>
</body>
</html>
