#!/bin/bash
# Скрипт мониторинга

echo "📊 Мониторинг fate-bot"
echo "======================"

# PM2 статус
pm2 status fate-bot

echo -e "\n📈 Использование ресурсов:"
pm2 show fate-bot | grep -E "(memory|cpu|uptime)"

echo -e "\n📝 Последние логи:"
pm2 logs fate-bot --lines 5

echo -e "\n💾 Размеры файлов:"
du -sh /var/www/fate-bot/