// const express = require('express');
// const path = require('path');

// const app = express();
// const port = 3000;

// // 設置靜態文件目錄
// app.use(express.static(path.join(__dirname, 'public')));

// // 啟動伺服器
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// 設置上傳目錄
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // 讀取上傳的圖片文件
    const image = fs.readFileSync(req.file.path);
    const encodedImage = image.toString('base64');

    // 發送圖片到 Python 伺服器
    const response = await axios.post('http://localhost:5000/process_image', {
      image: encodedImage
    });

    // 從 Python 伺服器接收處理後的圖片
    const processedImage = response.data.image;

    // 將處理後的圖片保存到 uploads 資料夾
    const imagePath = path.join(__dirname, 'uploads', 'processed_image.jpg');
    fs.writeFileSync(imagePath, processedImage, 'base64');

    // 發送處理後的圖片路徑給前端
    res.json({ imagePath });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
