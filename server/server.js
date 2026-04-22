require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3747;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

async function askGemini(systemPrompt, userMessage, retries = 3) {
  for (let i = 0; i < retries; i++) {
    if (i > 0) {
      console.log(`🔁 Повтор ${i}/${retries - 1}...`);
      await new Promise(r => setTimeout(r, 1500 * i));
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + userMessage }] }],
          generationConfig: { maxOutputTokens: 512 }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn(`⚠️  ${data.error?.message || `HTTP ${res.status}`}`);
        continue;
      }

      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answer) { console.warn('⚠️  Пустой ответ'); continue; }

      return answer;

    } catch (err) {
      console.warn(`⚠️  ${err.message}`);
    }
  }
  throw new Error('Gemini недоступен, попробуй позже');
}

app.post('/ask', async (req, res) => {
  const { text, sourceUrl, sourceTitle } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

  console.log(`\n📨 Запрос от: ${sourceTitle || sourceUrl || 'неизвестно'}`);
  console.log(`📝 Текст (${text.length} симв.): ${text.slice(0, 100)}${text.length > 100 ? '…' : ''}`);

  try {
    const systemPrompt = process.env.SYSTEM_PROMPT ||
      'You are an expert in all sciences. The user will send a test question. Reply in this exact format: first the correct answer letter (a/b/c) or True/False, then a dash, then the answer text. Example: "b - energia najvyššej hladiny". Nothing else.';

    const userMessage = sourceTitle ? `Source: ${sourceTitle}\n\n${text}` : text;

    console.log('🤖 Спрашиваю Gemma 3 27B...');
    const answer = await askGemini(systemPrompt, userMessage);
    console.log(`✅ Ответ получен (${answer.length} симв.)`);

    await sendToTelegram(answer);
    res.json({ ok: true, answer });

  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    res.status(500).json({ error: err.message });
  }
});

async function sendToTelegram(answer) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) throw new Error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы в .env');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: escapeMarkdown(answer),
      parse_mode: 'MarkdownV2'
    })
  });

  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
  console.log('📱 Отправлено в Telegram!');
}

function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║        AI Hotkey Server v1.0         ║
╠══════════════════════════════════════╣
║  Модель: Gemma 3 27B       ║
║  Лимит: 500 запросов/день            ║
║  Порт: ${PORT}                          ║
╚══════════════════════════════════════╝
  `);
  if (!process.env.GEMINI_API_KEY) console.warn('⚠️  GEMINI_API_KEY не задан!');
  if (!process.env.TELEGRAM_BOT_TOKEN) console.warn('⚠️  TELEGRAM_BOT_TOKEN не задан!');
  if (!process.env.TELEGRAM_CHAT_ID) console.warn('⚠️  TELEGRAM_CHAT_ID не задан!');
});