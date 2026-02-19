const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://melolo.com/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
};

async function melolohome() {
    try {
        const { data } = await axios.get('https://melolo.com', { headers });
        const $ = cheerio.load(data);
        const list = [];
        
        $('div.bg-white.rounded-xl, div.min-w-45, .grid > div').each((_, e) => {
            const link = $(e).find('a[href*="/drama/"]').first();
            const img = $(e).find('img').first();
            // Cek src atau data-src (lazy load)
            const poster = img.attr('data-src') || img.attr('src');
            const title = $(e).find('.text-Title').text().trim() || $(e).find('h3').text().trim();

            if (link.attr('href') && title) {
                list.push({
                    title: title,
                    url: link.attr('href').startsWith('http') ? link.attr('href') : `https://melolo.com${link.attr('href')}`,
                    image: poster
                });
            }
        });
        return list;
    } catch (e) { return []; }
}

async function melolodl(url) {
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);
    const title = $('h1').text().trim();
    const episodes = [];

    $('a[href*="/episode-"]').each((_, el) => {
        const href = $(el).attr('href');
        const epNum = $(el).text().replace(/\D/g, '');
        if (href && epNum) {
            episodes.push({
                episode_id: epNum,
                url: href.startsWith('http') ? href : `https://melolo.com${href}`
            });
        }
    });
    // Urutkan episode dari yang terkecil
    return { title, episodes: episodes.sort((a, b) => parseInt(a.episode_id) - parseInt(b.episode_id)) };
}

module.exports = async (req, res) => {
    const { type, query, url } = req.query;
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        if (type === 'home') return res.json(await melolohome());
        if (type === 'detail') return res.json(await melolodl(url));
        if (type === 'stream') {
            if (!url) return res.status(400).send("No URL");
            // Proxy Video agar tidak kena blokir CORS/Referer
            const videoResponse = await axios({
                method: 'get',
                url: decodeURIComponent(url),
                responseType: 'stream',
                headers: { ...headers, 'Referer': 'https://melolo.com/' }
            });
            res.setHeader('Content-Type', 'video/mp4');
            return videoResponse.data.pipe(res);
        }
        res.status(404).send("Not Found");
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
