#!/bin/bash
# Скрипт деплоя - выполняй на сервере

set -e  # Выход при ошибках

PROJECT_DIR="/var/www/fate-bot"
LOG_DIR="/var/log/fate-bot"

echo "🚀 Запуск деплоя в $PROJECT_DIR"

cd $PROJECT_DIR

# 1. Git pull
echo "📥 Получаю изменения с GitHub..."
git pull origin main

# 2. Установка зависимостей
echo "📦 Устанавливаю зависимости..."
npm ci --only=production

# 3. Сборка
echo "🔨 Собираю TypeScript..."
npm run build

# 4. Настройка логов (если нужно)
if [ ! -d "$LOG_DIR" ]; then
    echo "📁 Создаю директорию логов..."
    sudo mkdir -p $LOG_DIR
    sudo chown -R $USER:$USER $LOG_DIR
fi

# 5. Перезапуск PM2
echo "🔄 Перезапускаю бота..."
pm2 reload fate-bot --update-env

echo "✅ Деплой завершен!"
pm2 status fate-bot