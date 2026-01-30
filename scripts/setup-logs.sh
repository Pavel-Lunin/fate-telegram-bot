#!/bin/bash
# Скрипт для настройки логов на сервере

echo "🔧 Настройка системы логов на сервере..."

# На сервере логи должны быть в /var/log/
LOG_DIR="/var/log/fate-bot"

# Создаем директорию
sudo mkdir -p $LOG_DIR
sudo chown -R $USER:$USER $LOG_DIR

echo "✅ Директория логов создана: $LOG_DIR"
echo "📝 Укажи в ecosystem.config.js:"
echo "error_file: \"$LOG_DIR/error.log\""
echo "out_file: \"$LOG_DIR/out.log\""