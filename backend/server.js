const express = require('express');
const cors = require('cors');
const { Parser } = require('json2csv'); // Đảm bảo dòng này có

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/convert', (req, res) => {
    try {
        const jsonData = req.body;

        // 1. Dùng code "sạch" (không BOM, không sep=,)
        const json2csvParser = new Parser(); 
        const csv = json2csvParser.parse(jsonData);

        // 2. Gửi file CSV "sạch" 100%
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.status(200).send(csv); // Gửi CSV "sạch"

    } catch (error) {
        console.error('Lỗi chuyển đổi:', error.message);
        res.status(400).json({ message: 'Lỗi: Không thể chuyển JSON sang CSV.', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend "Nhà máy CSV" đang chạy tại http://localhost:${port}`);
});