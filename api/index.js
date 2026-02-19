const dramas = require('./dramas.json');

module.exports = async (req, res) => {
    const { type, id } = req.query;
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Mengambil semua daftar drama untuk halaman depan
    if (type === 'home') {
        return res.json(dramas.map(d => ({ 
            id: d.id, 
            title: d.title, 
            image: d.poster 
        })));
    }

    // Mengambil detail drama & daftar episode berdasarkan ID
    if (type === 'detail') {
        const drama = dramas.find(d => d.id === id);
        if (drama) return res.json(drama);
        return res.status(404).json({ error: "Drama tidak ditemukan" });
    }

    res.status(400).send("Invalid Request");
};
