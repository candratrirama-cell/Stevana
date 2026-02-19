const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://melolo.com/'
};

async function getHome() {
    const { data } = await axios.get('https://melolo.com', { headers });
    const $ = cheerio.load(data);
    const results = [];
    $('a.text-Title').each((_, el) => {
        const parent = $(el).closest('div');
        results.push({
            title: $(el).text().trim(),
            url: $(el).attr('href'),
            image: parent.find('img').attr('src') || parent.find('img').attr('data-src')
        });
    });
    return results;
}

async function searchDrama(query) {
    const { data } = await axios.get(`https://melolo.com/search?q=${encodeURIComponent(query)}`, { headers });
    const $ = cheerio.load(data);
    const results = [];
    $('a.text-Title').each((_, el) => {
        const parent = $(el).closest('div');
        results.push({
            title: $(el).text().trim(),
            url: $(el).attr('href'),
            image: parent.find('img').attr('src')
        });
    });
    return results;
}

async function getDetail(url) {
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);
    const title = $('h1').first().text().trim();
    const episodes = [];
    $('a[href*="/episode-"]').each((_, el) => {
        const epId = $(el).text().replace(/\D/g, '');
        if(epId) episodes.push({ episode_id: epId, url: $(el).attr('href') });
    });
    return { title, episodes: episodes.sort((a,b) => a.episode_id - b.episode_id) };
}

module.exports = async (req, res) => {
    const { type, query, url } = req.query;
    try {
        if (type === 'home') return res.json(await getHome());
        if (type === 'search') return res.json(await searchDrama(query));
        if (type === 'detail') return res.json(await getDetail(url));
        if (type === 'stream') {
            const videoRes = await axios({ method: 'get', url: decodeURIComponent(url), responseType: 'stream', headers });
            res.setHeader('Content-Type', 'video/mp4');
            return videoRes.data.pipe(res);
        }
        res.status(400).send("Invalid Type");
    } catch (e) { res.status(500).json({ error: e.message }); }
};
