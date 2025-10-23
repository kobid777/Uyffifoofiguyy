import fetch from 'node-fetch';

const GITHUB_BASE = 'https://api.github.com';

export async function runModel(prompt, opts = {}){
  // Example: use POST /inference/chat/completions per GitHub Models docs
  const body = {
    model: opts.model || 'gpt-4o-mini', // pilih model available in catalog
    input: prompt,
    max_tokens: opts.max_tokens || 800
  };
  const res = await fetch(`${GITHUB_BASE}/orgs/YOUR_ORG/inference/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify(body)
  });
  if(!res.ok){
    const txt = await res.text();
    throw new Error('GH models error: ' + txt);
  }
  const j = await res.json();
  // depending on API shape, extract text
  // Example assume j.choices[0].message.content
  return j.choices?.[0]?.message?.content ?? JSON.stringify(j);
}
