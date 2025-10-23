import fetch from 'node-fetch';
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendMessage(chat_id, text, opts = {}){
  const body = { chat_id, text, parse_mode: 'HTML', ...opts };
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function deleteMessage(chat_id, message_id){
  const res = await fetch(`${TELEGRAM_API}/deleteMessage`,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({chat_id, message_id})
  });
  return res.json();
}
