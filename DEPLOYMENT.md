# Инструкция по развертыванию на hostia.net

## Системные требования

Проект предназначен для развертывания на хостинге **hostia.net** (тариф "Бизнес"):
- PHP 8.1 или выше
- MySQL 8.0
- Минимум 512 МБ RAM (рекомендуется 1 ГБ)
- Минимум 256 МБ памяти PHP
- Расширения PHP: `pdo_mysql`, `mbstring`, `openssl`, `gd`, `zip`, `json`, `curl`, `fileinfo`

## Шаг 1: Подготовка хостинга

### 1.1 Настройка PHP

1. Войдите в панель управления hostia.net
2. Перейдите в раздел "Настройки PHP"
3. Выберите версию **PHP 8.1** или выше
4. Включите необходимые расширения:
   - ✅ pdo_mysql
   - ✅ mbstring
   - ✅ openssl
   - ✅ gd
   - ✅ zip
   - ✅ json
   - ✅ curl
   - ✅ fileinfo

### 1.2 Настройка php.ini

Откройте файл `php.ini` в панели управления и установите следующие значения:

```ini
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_time = 300
```

### 1.3 Создание базы данных MySQL

1. В панели управления перейдите в раздел "Базы данных MySQL"
2. Создайте новую базу данных (например, `anticorruption_db`)
3. Создайте пользователя и запишите данные:
   - Имя базы данных: `anticorruption_db`
   - Имя пользователя: `anticorr_user`
   - Пароль: (сохраните в надежном месте)
   - Хост: `localhost` (обычно)

## Шаг 2: Загрузка файлов проекта

### 2.1 Скачивание релиза

1. Скачайте последний релиз с GitHub:
   ```bash
   wget https://github.com/xlabtg/test/archive/refs/heads/main.zip
   ```

   Или скачайте через веб-интерфейс GitHub и загрузите архив через FTP/файловый менеджер.

2. Распакуйте архив в директорию `/public_html` (или корневую директорию вашего хостинга)

### 2.2 Установка зависимостей

Подключитесь к хостингу по SSH (если доступно) или используйте терминал в панели управления:

```bash
cd /path/to/your/project
composer install --no-dev --optimize-autoloader
npm install
npm run build
```

**Важно:** Если Composer недоступен на хостинге, установите зависимости локально и загрузите папку `vendor/` целиком.

## Шаг 3: Настройка проекта

### 3.1 Настройка .env файла

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и заполните данные:

```ini
APP_NAME="Антикоррупционный мониторинг"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-domain.hostia.net

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=anticorruption_db
DB_USERNAME=anticorr_user
DB_PASSWORD=your_database_password

MAX_UPLOAD_SIZE=64

# Сгенерируйте соль для анонимизации
# Выполните: php -r "echo bin2hex(random_bytes(32));"
ANON_SALT=your_generated_salt_here

AUDIT_LOG_ENABLED=true
AUDIT_LOG_FILE=audit.log
```

### 3.2 Генерация ключа приложения

```bash
php artisan key:generate
```

### 3.3 Проверка требований хостинга

Откройте в браузере: `https://your-domain.hostia.net/hosting-check.php`

Убедитесь, что все проверки пройдены успешно (зелёные галочки). Если есть ошибки, вернитесь к шагу 1.

## Шаг 4: Настройка базы данных

### 4.1 Импорт схемы базы данных

Выполните миграции:

```bash
php artisan migrate --force
```

### 4.2 Заполнение начальными данными

Загрузите тестовые данные (регионы и роли):

```bash
php artisan db:seed --force
```

### 4.3 Создание первого администратора

Создайте учетную запись администратора:

```bash
php artisan tinker
```

В консоли tinker выполните:

```php
$user = \App\Models\User::create([
    'name' => 'Администратор',
    'email' => 'admin@example.com',
    'password' => bcrypt('your_secure_password'),
]);

$user->assignRole('admin');
```

Нажмите `Ctrl+D` для выхода из tinker.

## Шаг 5: Настройка прав доступа

### 5.1 Установка прав на директории

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Если `www-data` недоступен, используйте пользователя вашего веб-сервера (уточните в техподдержке hostia.net).

### 5.2 Настройка .htaccess

Убедитесь, что в корне проекта есть файл `.htaccess` с редиректом на `public/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

## Шаг 6: Пост-установка

### 6.1 Настройка Cron для обновления статистики

Добавьте задачу в cron (через панель управления "Задания Cron"):

```
0 2 * * * cd /path/to/your/project && php artisan stats:update
```

Это будет обновлять статистику каждый день в 2:00 ночи.

### 6.2 Очистка кэша

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 6.3 Оптимизация для production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Шаг 7: Проверка работоспособности

Откройте в браузере:

1. ✅ **Главная страница с картой:** `https://your-domain.hostia.net/`
2. ✅ **Страница статистики:** `https://your-domain.hostia.net/statistics`
3. ✅ **Форма входа:** `https://your-domain.hostia.net/login`
4. ✅ **Админка (после входа):** `https://your-domain.hostia.net/admin/import`

### Тест загрузки CSV

1. Создайте тестовый CSV файл:

```csv
region,position,violation_type,date,status,description
Москва,Начальник отдела,взятка,2024-01-15,завершено,Получение взятки в крупном размере
```

2. Войдите как администратор
3. Перейдите в `/admin/import`
4. Загрузите CSV файл
5. Проверьте, что данные успешно импортированы

## Шаг 8: Резервное копирование

### 8.1 Создание бэкапа БД через phpMyAdmin

1. Войдите в phpMyAdmin в панели управления
2. Выберите базу данных `anticorruption_db`
3. Нажмите "Экспорт"
4. Выберите метод "Быстрый" и формат "SQL"
5. Скачайте файл

### 8.2 Автоматический бэкап

Добавьте в cron ежедневный бэкап:

```bash
0 3 * * * mysqldump -u anticorr_user -p'password' anticorruption_db > /backups/anticorr_$(date +\%Y\%m\%d).sql
```

## Устранение неполадок

### Проблема: Ошибка 500 при открытии сайта

**Решение:**
1. Включите `APP_DEBUG=true` в `.env` (только временно!)
2. Проверьте логи в `storage/logs/laravel.log`
3. Убедитесь, что права доступа правильные (см. шаг 5.1)

### Проблема: Не открывается карта

**Решение:**
1. Выполните `php artisan stats:update` для генерации данных
2. Проверьте, что в API `/api/region-stats` возвращаются данные

### Проблема: Ошибка при загрузке CSV

**Решение:**
1. Проверьте, что файл в кодировке UTF-8
2. Убедитесь, что названия регионов точно совпадают с базой данных
3. Проверьте формат даты (должен быть YYYY-MM-DD)

## Контакты технической поддержки

При возникновении проблем:
1. Проверьте логи в `storage/logs/`
2. Обратитесь в техподдержку hostia.net по вопросам настройки сервера
3. Создайте issue на GitHub для вопросов по коду

---

**Автор документации:** AI Issue Solver
**Дата создания:** 2025-11-04
**Версия:** 1.0
