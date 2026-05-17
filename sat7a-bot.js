const TELEGRAM_TOKEN = “8960072177:AAHv3v2sklQPR7sUcK-jXISBBpzUCXIKS90”;
const ANTHROPIC_API_KEY = “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”;

// ============================================
// لا تعدّل أي شيء تحت هذا السطر
// ============================================

const TelegramBot = require(“node-telegram-bot-api”);
const fetch = require(“node-fetch”);

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const conversations = {};

const SYSTEM_PROMPT = `أنت مساعد خدمة العملاء الذكي لتطبيق سطحة (Sat7a) في البحرين.
تطبيق سطحة هو منصة خدمات مركبات شاملة مرخصة رسمياً من وزارة الصناعة والتجارة في البحرين.

خدمات التطبيق:

1. طلب سطحة/ونش/نقل مركبات
1. نقل الأثاث والأغراض
1. مندوبي التوصيل
1. قطع الغيار
1. الإطارات والبطاريات
1. خدمات الطوارئ (وقود، فتح سيارات مقفلة، تغيير إطار، فحص كمبيوتر)
1. مغاسل السيارات وغسيل متنقل
1. كراجات صبغ وسمكرة
1. التأمين، الإكسسوارات، التنجيد
1. تأجير السيارات ومعارض السيارات

تعليمات:

- رد باللهجة الخليجية بأسلوب ودي وسريع
- كن مختصراً — جملة أو جملتين كافية
- إذا طلب خدمة، وجّهه للتطبيق أو الموقع
- روابط التحميل:
  iOS: https://sat7aapp.short.gy/KkgK8T
  Android: https://sat7aapp.short.gy/KkgK8T
  الموقع: https://sat7a.net
- إذا طلب طوارئ، أعطه أولوية قصوى
- التطبيق بدون عمولة وبدون شروط
- لا تخترع أسعاراً محددة`;

bot.onText(//start/, (msg) => {
const chatId = msg.chat.id;
conversations[chatId] = [];

bot.sendMessage(chatId,
`هلا والله! 👋\nأنا مساعد *سطحة* الذكي 🚛\nمنصة خدمات المركبات الأولى في البحرين 🇧🇭\n\nكيف أقدر أساعدك اليوم؟`,
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

bot.onText(/📱 حمّل التطبيق/, (msg) => {
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
if (!userText || userText.startsWith(”/”) || userText === “📱 حمّل التطبيق”) return;

if (!conversations[chatId]) conversations[chatId] = [];
conversations[chatId].push({ role: “user”, content: userText });
if (conversations[chatId].length > 10) conversations[chatId] = conversations[chatId].slice(-10);

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

const serviceKeywords = ["سطحة","ونش","غسيل","إطار","بطارية","وقود","طارئ","توصيل","نقل","تأمين","تأجير"];
const needsButton = serviceKeywords.some(kw => userText.includes(kw) || reply.includes(kw));

bot.sendMessage(chatId, reply, {
  parse_mode: "Markdown",
  reply_markup: needsButton ? {
    inline_keyboard: [
      [{ text: "🚀 افتح التطبيق واطلب الحين", url: "https://sat7a.net" }],
      [
        { text: "🍎 iOS", url: "https://sat7aapp.short.gy/KkgK8T" },
        { text: "🤖 Android", url: "https://sat7aapp.short.gy/KkgK8T" },
      ],
    ],
  } : undefined,
});
```

} catch (err) {
console.error(err);
bot.sendMessage(chatId, “عذراً، في مشكلة تقنية. حاول مرة ثانية! 🙏”);
}
});

console.log(“✅ بوت سطحة شغّال!”);
