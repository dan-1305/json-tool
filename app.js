// --- 1. KHỞI TẠO 2 "MÁY" EDITOR (ACE.JS) ---
var editorInput = ace.edit("jsonInputEditor");
editorInput.session.setMode("ace/mode/json");
editorInput.setTheme("ace/theme/chrome");
editorInput.setOptions({
    useWorker: false,
    placeholder: "Dán JSON xấu xí của bạn vào đây..."
});

var editorOutput = ace.edit("jsonOutputEditor");
editorOutput.session.setMode("ace/mode/json");
editorOutput.setTheme("ace/theme/chrome");
editorOutput.setReadOnly(true);

// --- 2. "Kết nối" với các nút bấm ---
const formatBtn = document.getElementById('formatBtn');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
// (KẾT NỐI NÚT MỚI)
const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const fileInput = document.getElementById('fileInput');
const inputDropZone = editorInput.container;

// --- 3. HÀM "DOWNLOAD THẦN KỲ" (MỚI) ---
function downloadFile(filename, content, mimeType) {
    // 1. Tạo một "Blob" (một đối tượng file ảo trong bộ nhớ)
    const blob = new Blob([content], { type: mimeType });
    
    // 2. Tạo một "link" (thẻ <a>) ảo
    const a = document.createElement('a');
    
    // 3. Tạo một URL trỏ đến file ảo
    a.href = URL.createObjectURL(blob);
    
    // 4. Đặt tên file tải về
    a.download = filename;
    
    // 5. "Bấm" vào link ảo để kích hoạt tải
    document.body.appendChild(a);
    a.click();
    
    // 6. Dọn dẹp link ảo
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// --- 4. Bộ não "LÀM ĐẸP" (Format) ---
function formatJSON() {
    editorOutput.session.setMode("ace/mode/json"); // Đặt lại mode JSON
    
    // (MỚI) Ẩn/Hiện nút Download
    downloadJsonBtn.style.display = 'inline-block'; // Hiện nút JSON
    downloadCsvBtn.style.display = 'none';         // Ẩn nút CSV

    try {
        const uglyJSON = editorInput.getValue();
        if (uglyJSON.trim() === "") {
            editorOutput.setValue("", 1);
            return;
        }
        const parsedJSON = JSON.parse(uglyJSON);
        const prettyJSON = JSON.stringify(parsedJSON, null, 4);
        editorOutput.setValue(prettyJSON, 1);
    } catch (error) {
        editorOutput.setValue("LỖI: JSON không hợp lệ!\n\n" + error.message, 1);
    }
}

// --- 5. Bộ não "XÓA" (Clear) ---
function clearText() {
    editorInput.setValue("", 1);
    editorOutput.setValue("", 1);
}

// --- 6. BỘ NÃO "ĐÈN" SÁNG/TỐI ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.textContent = '🌙';
        editorInput.setTheme("ace/theme/monokai");
        editorOutput.setTheme("ace/keybinding/monokai");
    } else {
        themeToggle.textContent = '☀️';
        editorInput.setTheme("ace/theme/chrome");
        editorOutput.setTheme("ace/theme/chrome");
    }
}

// --- 7. BỘ NÃO "COPY" ---
function copyToClipboard() {
    const textToCopy = editorOutput.getValue();
    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = '✅ Đã Copy!';
        setTimeout(() => {
            copyBtn.textContent = '[ Copy Kết Quả ]';
        }, 2000);
    }).catch(err => {
        console.error('Lỗi khi copy: ', err);
    });
}

// --- 8. BỘ NÃO "CHUYỂN SANG CSV" ---
async function convertToCSV() {
    editorOutput.session.setMode("ace/mode/text"); // Đặt lại mode Text
    
    // (MỚI) Ẩn/Hiện nút Download
    downloadJsonBtn.style.display = 'none';         // Ẩn nút JSON
    downloadCsvBtn.style.display = 'inline-block'; // Hiện nút CSV

    try {
        const jsonText = editorInput.getValue();
        if (jsonText.trim() === "") {
            editorOutput.setValue("Vui lòng nhập JSON vào ô Input.", 1);
            return;
        }
        const jsonData = JSON.parse(jsonText);

        const response = await fetch('https://json-tool-beta.vercel.app/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData),
        });

        const csvData = await response.text();
        if (!response.ok) throw new Error(csvData);
        editorOutput.setValue(csvData, 1);

    } catch (error) {
        let errorMsg = error.message;
        try {
            const errJson = JSON.parse(errorMsg);
            errorMsg = errJson.message;
        } catch (e) {}
        editorOutput.setValue("LỖI KHI CHUYỂN SANG CSV:\n\n" + errorMsg, 1);
    }
}

// --- 9. Gắn "Bộ não" vào "Nút bấm" ---
formatBtn.addEventListener('click', formatJSON);
clearBtn.addEventListener('click', clearText);
themeToggle.addEventListener('click', toggleTheme);
copyBtn.addEventListener('click', copyToClipboard);
convertBtn.addEventListener('click', convertToCSV);

// (GẮN NÚT MỚI)
// (GẮN NÚT JSON - Giữ nguyên)
downloadJsonBtn.addEventListener('click', () => {
    const content = editorOutput.getValue();
    if(content.startsWith("LỖI:")) return; 
    downloadFile('formatted.json', content, 'application/json');
});

// (THAY THẾ KHỐI NÀY - BỘ NÃO CSV DOWNLOAD THÔNG MINH)
downloadCsvBtn.addEventListener('click', () => {
    // 1. Lấy CSV "sạch" từ ô Output
    const cleanCsvContent = editorOutput.getValue();
    if(cleanCsvContent.startsWith("LỖI:")) return;

    // 2. Thêm "Bí kíp Excel" (BOM + sep=,) VÀO ĐÂY
    const excelHackPrefix = '\uFEFF' + 'sep=,\n';
    const fileContent = excelHackPrefix + cleanCsvContent;

    // 3. Gọi hàm Tải về với nội dung ĐÃ "hack"
    // (Thêm charset=utf-8 vào mimeType để "ép" Excel lần nữa)
    downloadFile('converted.csv', fileContent, 'text/csv;charset=utf-8-sig,');
});
// --- 10. BỘ NÃO "ĐỌC FILE" (MỚI) ---
// (Hàm này sẽ được cả "Nút chọn" và "Kéo thả" sử dụng)
function handleFile(file) {
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
        const reader = new FileReader();

        // 1. Dạy nó phải làm gì KHI đọc xong
        reader.onload = (e) => {
            const fileContent = e.target.result;
            // 2. Nhét nội dung file vào ô Input
            editorInput.setValue(fileContent, 1);
            // 3. Tự động "Làm Đẹp" luôn cho tiện
            formatJSON();
        };

        // 4. Ra lệnh cho nó "Bắt đầu đọc" file
        reader.readAsText(file);
    } else {
        alert("Lỗi: Chỉ chấp nhận file .json");
    }
}

// --- 11. GẮN BỘ NÃO VÀO "NÚT CHỌN" (MỚI) ---
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
    // Reset nút file để có thể chọn lại file y hệt
    e.target.value = null; 
});

// --- 12. GẮN BỘ NÃO VÀO "KÉO THẢ" (MỚI) ---
// (Gắn vào "vùng chứa" của Ace Editor)

// A. Khi kéo file LÊN TRÊN vùng
inputDropZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // (Bắt buộc) Ngăn trình duyệt mở file
    inputDropZone.classList.add('drag-over'); // Thêm hiệu ứng viền đứt
});

// B. Khi kéo file RA KHỎI vùng
inputDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    inputDropZone.classList.remove('drag-over'); // Tắt hiệu ứng
});

// C. Khi "THẢ" file
inputDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    inputDropZone.classList.remove('drag-over'); // Tắt hiệu ứng

    const file = e.dataTransfer.files[0]; // Lấy file bị "thả"
    handleFile(file);
});
