module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  // 只允許 Yahoo Finance 和 TWSE 網域
  const allowed = [
    'query1.finance.yahoo.com',
    'query2.finance.yahoo.com',
    'openapi.twse.com.tw',
    'www.twse.com.tw',
    'news.google.com',
    'news.cnyes.com',
    'www.moneydj.com'
  ];
  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch(e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!allowed.some(d => targetUrl.hostname === d)) {
    return res.status(403).json({ error: 'Domain not allowed: ' + targetUrl.hostname });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TaiwanStockBot/1.0)',
        'Accept': 'application/json, text/xml, */*',
        'Accept-Language': 'zh-TW,zh;q=0.9'
      }
    });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      const data = await response.json();
      res.setHeader('Cache-Control', 's-maxage=60');
      return res.status(200).json(data);
    } else {
      const text = await response.text();
      res.setHeader('Content-Type', contentType || 'text/plain');
      res.setHeader('Cache-Control', 's-maxage=60');
      return res.status(200).send(text);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
