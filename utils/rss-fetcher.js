import Parser from 'rss-parser';
const parser = new Parser({timeout: 15000});
export async function fetchFeeds(urls){
  const all = [];
  for(const u of urls){
    try{
      const feed = await parser.parseURL(u);
      for(const item of feed.items){
        all.push({
          title: item.title,
          link: item.link,
          isoDate: item.isoDate || item.pubDate,
          guid: item.guid || item.link,
          content: item['content:encoded'] || item.content || item.summary || ''
        });
      }
    }catch(e){
      console.error('fail fetch feed', u, e?.message);
    }
  }
  // sort newest first
  return all.sort((a,b)=> new Date(b.isoDate) - new Date(a.isoDate));
}
