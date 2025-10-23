import { fetchFeeds } from '../../utils/rss-fetcher.js';
import { supabase } from '../../utils/supabase-client.js';
import { runModel } from '../../utils/gh-models-client.js';
import { sendMessage } from '../../utils/telegram-client.js';

const FEEDS = [
  'https://www.coindesk.com/arc/outboundfeeds/rss',
  'https://cointelegraph.com/rss',
  'https://www.theblock.co/rss.xml',
  'https://decrypt.co/feed'
];

export default async function handler(req, res){
  // optional: authenticate cron via header
  try{
    const items = await fetchFeeds(FEEDS);
    for(const it of items){
      // dedupe by guid
      const { data } = await supabase
        .from('articles')
        .select('id')
        .eq('guid', it.guid)
        .limit(1);
      if(data?.length) continue;

      // Build prompt
      const prompt = `Summarize the following crypto news into one concise paragraph (max 300 words) in English. Keep it neutral and factual. Do not include the source link.\n\nTitle: ${it.title}\n\nContent: ${it.content || ''}`;

      const summary = await runModel(prompt, { max_tokens: 600 });

      // send to telegram
      const chatId = process.env.TELEGRAM_CHANNEL_ID; // set in env
      const sendRes = await sendMessage(chatId, `<b>${it.title}</b>\n\n${summary.substring(0,4000)}`);

      // save to supabase
      await supabase.from('articles').insert([{
        guid: it.guid,
        title: it.title,
        link: it.link,
        summary,
        sent_at: new Date().toISOString(),
        telegram_message_id: sendRes.result?.message_id || null
      }]);
    }
    res.status(200).json({ok:true});
  }catch(e){
    console.error(e);
    res.status(500).json({error: e.message});
  }
}
