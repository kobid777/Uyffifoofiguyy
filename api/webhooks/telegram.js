import { supabase } from '../../utils/supabase-client.js';
import { runModel } from '../../utils/gh-models-client.js';
import { sendMessage } from '../../utils/telegram-client.js';

export default async function handler(req, res){
  const update = req.body;
  if(update.message && update.message.reply_to_message){
    const replyTo = update.message.reply_to_message;
    // Check if reply_to_message was sent by our bot (save bot id or match message_id in DB)
    const chatId = replyTo.chat.id;
    const originalMsgId = replyTo.message_id;

    // try find article by telegram_message_id
    const { data } = await supabase.from('articles').select('*').eq('telegram_message_id', originalMsgId).limit(1);
    const article = data?.[0] ?? null;

    const userComment = update.message.text || '';
    // build prompt with language detection instruction
    const prompt = `You are a helpful, conversational assistant. A user commented on the following news summary. Detect the comment language and respond in the same language, naturally, max 300 words. Keep response relevant to the news context.\n\nNews summary:\n${article?.summary || 'N/A'}\n\nUser comment:\n${userComment}`;

    const replyText = await runModel(prompt, { max_tokens: 600 });

    const sent = await sendMessage(chatId, replyText, { reply_to_message_id: originalMsgId });
    await supabase.from('replies').insert([{
      article_id: article?.id || null,
      user_message_id: update.message.message_id,
      reply_text: replyText,
      telegram_message_id: sent.result?.message_id || null,
      created_at: new Date().toISOString()
    }]);
  }
  res.status(200).json({ok:true});
}
