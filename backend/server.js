const express = require('express');
const cors = require('cors');
const { Parser } = require('json2csv');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// CHỈ LO API
app.post('/api/convert', (req, res) => {
    try {
        const jsonData = req.body;
        const json2csvParser = new Parser(); 
        const csv = json2csvParser.parse(jsonData);
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Lỗi chuyển đổi:', error.message);
        res.status(400).json({ message: 'Lỗi: Không thể chuyển JSON sang CSV.', error: error.message });
    }
});

// KHÔNG PHỤC VỤ index.html NỮA

app.listen(port, () => {
    console.log(`Backend "Nhà máy CSV" đang chạy tại http://localhost:${port}`);
});