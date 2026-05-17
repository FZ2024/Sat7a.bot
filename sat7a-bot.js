const TelegramBot = require(“node-telegram-bot-api”);
const fetch = require(“node-fetch”);

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const conversations = {};

const SYSTEM_PROMPT = “You are a customer service assistant for Sat7a app in Bahrain. Always reply in Arabic Gulf dialect (Bahraini or Saudi). Be friendly and brief. Sat7a is a licensed vehicle services platform in Bahrain. Services: tow truck, furniture moving, delivery, spare parts, tires, batteries, emergency services (fuel, unlocking cars, tire change), car wash, mobile wash, paint and body work, insurance, accessories, upholstery, car rental, car showrooms. If customer needs a service, direct them to download the app: iOS: https://sat7aapp.short.gy/KkgK8T Android: https://sat7aapp.short.gy/KkgK8T Website: https://sat7a.net - App is currently free with no commission. Do not invent specific prices.”;

bot.onText(//start/, (msg) => {
const chatId = msg.chat.id;
conversations[chatId] = [];

bot.sendMessage(
chatId,
“هلا والله! 👋\nأنا مساعد *سطحة* الذكي 🚛\nمنصة خدمات المركبات الأولى في البحرين 🇧🇭\n\nكيف أقدر أساعدك اليوم؟”,
{
parse_mode: “Markdown”,
reply_markup: {
keyboard: [
[“🚛 أبي سطحة الحين!”, “🆘 عندي طارئ”],
[“🚿 غسيل سيارة”, “🔋 إطار أو بطارية”],
[“📋 وش الخدمات؟”, “📱 حمّل التطبيق”],
],
resize_keyboard: true,
},
}
);
});

bot.onText(/حمّل التطبيق/, (msg) => {
bot.sendMessage(msg.chat.id, “📲 *حمّل تطبيق سطحة الحين!*”, {
parse_mode: “Markdown”,
reply_markup: {
inline_keyboard: [
[
{ text: “🍎 App Store”, url: “https://sat7aapp.short.gy/KkgK8T” },
{ text: “🤖 Google Play”, url: “https://sat7aapp.short.gy/KkgK8T” },
],
[{ text: “🌐 الموقع الرسمي”, url: “https://sat7a.net” }],
],
},
});
});

bot.on(“message”, async (msg) => {
const chatId = msg.chat.id;
const userText = msg.text;

if (!userText || userText.startsWith(”/”)) return;

if (!conversations[chatId]) conversations[chatId] = [];
conversations[chatId].push({ role: “user”, content: userText });
if (conversations[chatId].length > 10) {
conversations[chatId] = conversations[chatId].slice(-10);
}

bot.sendChatAction(chatId, “typing”);

try {
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-api-key”: ANTHROPIC_API_KEY,
“anthropic-version”: “2023-06-01”,
},
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 500,
system: SYSTEM_PROMPT,
messages: conversations[chatId],
}),
});

```
const data = await response.json();
const reply = data.content?.[0]?.text || "عذراً، حدث خطأ. حاول مرة ثانية.";
conversations[chatId].push({ role: "assistant", content: reply });

const keywords = ["سطحة","ونش","غسيل","إطار","بطارية","وقود","طارئ","توصيل","نقل","تأمين","تأجير"];
const needsButton = keywords.some((kw) => userText.includes(kw) || reply.includes(kw));

bot.sendMessage(chatId, reply, {
  parse_mode: "Markdown",
  reply_markup: needsButton
    ? {
        inline_keyboard: [
          [{ text: "🚀 افتح التطبيق واطلب الحين", url: "https://sat7a.net" }],
          [
            { text: "🍎 iOS", url: "https://sat7aapp.short.gy/KkgK8T" },
            { text: "🤖 Android", url: "https://sat7aapp.short.gy/KkgK8T" },
          ],
        ],
      }
    : undefined,
});
```

} catch (err) {
console.error(err);
bot.sendMessage(chatId, “عذراً، في مشكلة تقنية. حاول مرة ثانية! 🙏”);
}
});

console.log(“Bot is running!”);
