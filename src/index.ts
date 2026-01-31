import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import * as dotenv from "dotenv";
import {
  CONFIG,
  DENIS_COMPLIMENTS,
  DENIS_TRIGGERS,
  helpText,
  INTERNET_RESPONSES,
  INTERNET_TRIGGERS,
  JULIA_COMPLIMENTS,
  JULIA_TRIGGERS,
  KEYWORDS,
  LENIN_ANSWERS,
  LENIN_TRIGGERS,
  PREDICTIONS,
  SATAN_ANSWERS,
  SATAN_TRIGGERS,
  startText,
  SWEAR_RESPONSE,
  SWEAR_TRIGGERS,
} from "./constants.js";

// Загружаем .env
dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN не найден в .env файле");
  process.exit(1);
}

// === АНТИ-СПАМ ===
const userLastRequest = new Map<number, number>();

function checkCooldown(userId: number): boolean {
  const lastRequest = userLastRequest.get(userId) || 0;
  const now = Date.now();

  if (now - lastRequest < CONFIG.COOLDOWN_MS) {
    return false;
  }

  userLastRequest.set(userId, now);
  return true;
}

// === СОЗДАНИЕ БОТА ===
const bot = new Telegraf(token);

// === АНТИ-СПАМ МИДЛВАР ===
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;

  if (userId && !checkCooldown(userId)) {
    await ctx.reply("⏳ Подожди немного перед следующим вопросом!");
    return;
  }

  await next();
});

// === ОБРАБОТЧИКИ ===

// Основной обработчик текстовых сообщений
bot.on(message("text"), async (ctx: Context) => {
  if (!ctx.message || !("text" in ctx.message) || ctx.from?.is_bot) {
    return;
  }

  const message = ctx.message.text;
  const cleanMessage = message.trim().toLowerCase();

  // ===== ОДИНОЧНЫЕ СЛОВА =====
  // Проверяем сначала одиночные слова (самый высокий приоритет)

  // Одиночное "Да" (только точное совпадение)
  if (
    cleanMessage === "да" ||
    cleanMessage === "да." ||
    cleanMessage === "да!"
  ) {
    await ctx.reply("Пизда! 💥", {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // Одиночное "Нет" (только точное совпадение)
  if (
    cleanMessage === "нет" ||
    cleanMessage === "нет." ||
    cleanMessage === "нет!"
  ) {
    await ctx.reply("Пидора ответ!", {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  const messageLower = cleanMessage;

  // ===== МАТЕРНЫЕ СЛОВА (высокий приоритет) =====
  const hasSwearWord = SWEAR_TRIGGERS.some((swear) =>
    messageLower.includes(swear),
  );

  if (hasSwearWord) {
    const swearResponse =
      SWEAR_RESPONSE[Math.floor(Math.random() * SWEAR_RESPONSE.length)];

    await ctx.reply(swearResponse, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // ===== ИНТЕРНЕТ-СЛЕНГ =====
  const hasInternetSlang = INTERNET_TRIGGERS.some((slang) =>
    messageLower.includes(slang),
  );

  if (hasInternetSlang) {
    const internetResponse =
      INTERNET_RESPONSES[Math.floor(Math.random() * INTERNET_RESPONSES.length)];

    await ctx.reply(internetResponse, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // 1. Проверяем триггер Ленина
  const hasLeninTrigger = LENIN_TRIGGERS.some((trigger) =>
    messageLower.includes(trigger),
  );

  if (hasLeninTrigger) {
    const leninAnswer =
      LENIN_ANSWERS[Math.floor(Math.random() * LENIN_ANSWERS.length)];

    await ctx.reply(leninAnswer, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // 2. Проверяем триггер Сатаны
  const hasSatanTrigger = SATAN_TRIGGERS.some((trigger) =>
    messageLower.includes(trigger),
  );

  if (hasSatanTrigger) {
    const satanAnswer =
      SATAN_ANSWERS[Math.floor(Math.random() * SATAN_ANSWERS.length)];

    await ctx.reply(satanAnswer, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // 3. Проверяем триггеры для Юли
  const hasJuliaTrigger = JULIA_TRIGGERS.some((trigger) =>
    messageLower.includes(trigger),
  );

  if (hasJuliaTrigger) {
    const compliment =
      JULIA_COMPLIMENTS[Math.floor(Math.random() * JULIA_COMPLIMENTS.length)];

    await ctx.reply(`💖 ${compliment}`, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // 4. Проверяем триггеры для Дениса
  const hasDenisTrigger = DENIS_TRIGGERS.some((trigger) =>
    messageLower.includes(trigger),
  );

  if (hasDenisTrigger) {
    const denisCompliment =
      DENIS_COMPLIMENTS[Math.floor(Math.random() * DENIS_COMPLIMENTS.length)];

    await ctx.reply(`👑 ${denisCompliment}`, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
    return;
  }

  // 5. Проверяем ключевые слова для предсказаний
  const hasKeyword = KEYWORDS.some((keyword) => messageLower.includes(keyword));

  if (hasKeyword) {
    const prediction =
      PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];

    await ctx.reply(`🎱 ${prediction}`, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML" as const,
    });
  }
});

// Команда /start
bot.command("start", (ctx) => {
  ctx.reply(startText, { parse_mode: "HTML" as const });
});

// Команда /help - показывает все возможности бота
bot.command("help", (ctx) => {
  ctx.reply(helpText, { parse_mode: "HTML" as const });
});

// Команда /predict для теста
bot.command("predict", (ctx) => {
  const prediction =
    PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
  ctx.reply(`🎱 ${prediction}`);
});

// Команда /julia для теста комплиментов
bot.command("julia", (ctx) => {
  const compliment =
    JULIA_COMPLIMENTS[Math.floor(Math.random() * JULIA_COMPLIMENTS.length)];
  ctx.reply(`💖 ${compliment}`);
});

// Команда /lenin для теста
bot.command("lenin", (ctx) => {
  const leninAnswer =
    LENIN_ANSWERS[Math.floor(Math.random() * LENIN_ANSWERS.length)];
  ctx.reply(leninAnswer);
});

// Команда /satan для теста
bot.command("satan", (ctx) => {
  const satanAnswer =
    SATAN_ANSWERS[Math.floor(Math.random() * SATAN_ANSWERS.length)];
  ctx.reply(satanAnswer);
});

// Команда /denis для теста
bot.command("denis", (ctx) => {
  const denisCompliment =
    DENIS_COMPLIMENTS[Math.floor(Math.random() * DENIS_COMPLIMENTS.length)];
  ctx.reply(`👑 ${denisCompliment}`);
});

// Команда /swear для теста мата
bot.command("swear", (ctx) => {
  const swearResponse =
    SWEAR_RESPONSE[Math.floor(Math.random() * SWEAR_RESPONSE.length)];
  ctx.reply(swearResponse);
});

// Команда /slang для теста сленга
bot.command("slang", (ctx) => {
  const internetResponse =
    INTERNET_RESPONSES[Math.floor(Math.random() * INTERNET_RESPONSES.length)];
  ctx.reply(internetResponse);
});

// === ЗАПУСК БОТА ===
async function startBot() {
  try {
    console.log("🤖 Бот запускается...");

    // Проверка токена
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Бот @${botInfo.username} успешно подключен!`);

    // Запускаем бота
    await bot.launch({
      dropPendingUpdates: true,
      allowedUpdates: ["message"],
    });

    console.log("✅ Бот успешно запущен и готов к работе!");

    // Graceful shutdown
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error: any) {
    console.error(`❌ Ошибка запуска бота: ${error.message}`);

    if (error.message.includes("404")) {
      console.error("⚠️  Проверьте BOT_TOKEN в .env файле");
      console.error("⚠️  Получите новый токен у @BotFather");
    }
    process.exit(1);
  }
}

// Запускаем бота
startBot();
