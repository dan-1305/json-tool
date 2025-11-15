const express = require('express');
const cors = require('cors');
const { Parser } = require('json2csv');
const path = require('path'); // <-- "Công nhân" mới, chuyên xử lý đường dẫn

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- 1. DẠY BACKEND PHỤC VỤ API ---
// (API vẫn giữ nguyên)
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

// --- 2. DẠY BACKEND PHỤC VỤ "CỬA HÀNG" (MỚI) ---
// "path.join" sẽ tìm đường dẫn đến thư mục cha (thư mục gốc)
const frontendPath = path.join(__dirname, '..'); 

// "express.static" ra lệnh: "Phục vụ mọi file tĩnh (css, js) trong thư mục đó"
app.use(express.static(frontendPath));

// "Catch-all" (Bắt tất cả): Nếu không phải API,
// hãy gửi "cửa hàng" (index.html) cho người dùng.
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- 3. Khởi động "Nhà máy" ---
app.listen(port, () => {
    console.log(`Backend "Nhà máy" đang chạy tại http://localhost:${port}`);
});