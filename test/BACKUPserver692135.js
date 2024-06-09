const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// 中間件來解析 JSON 請求
app.use(express.json());

// 設置上傳目錄
// const upload = multer({ dest: 'uploads/' });
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'), false)
    }
  }
}, { dest: 'uploads/' }) // 这里可以省略，因为我们已经在 storage 中定义了 dest


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

    // 生成唯一的文件名
    const uniqueFilename = generateUniqueFilename(req.file.originalname);

    // 將處理後的圖片保存到 uploads 資料夾
    const imagePath = path.join(__dirname, 'uploads', uniqueFilename);
    fs.writeFileSync(imagePath, processedImage, 'base64');

    // 發送處理後的圖片路徑給前端
    res.json({ imagePath });
    // res.json({ imagePath: `/uploads/${uniqueFilename}` });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  } finally {
    // 刪除臨時上傳的文件
    fs.unlinkSync(req.file.path);
  }
});


app.post('/select_color', async (req, res) => {
  try {
    const { color } = req.body;
    // 發送選擇的顏色到 Python 伺服器
    const response = await axios.post('http://localhost:5000/select_rock_point', { color });

    // // 從 Python 伺服器接收處理後的圖片
    // const processedImage = response.data.image;
    // 從 Python 伺服器接收處理後的圖片和文件名
    const { image, filename } = response.data;

    // // 生成唯一的文件名
    // const uniqueFilename = generateUniqueFilename(`selected_${color}.png`);

    // // 將處理後的圖片保存到 uploads 資料夾
    // const imagePath = path.join(__dirname, 'uploads', uniqueFilename);
    // fs.writeFileSync(imagePath, processedImage, 'base64'); // 解碼並保存圖片
    
    // // 將處理後的圖片保存到 uploads 資料夾
    // const imagePath = path.join(__dirname, 'uploads', filename);
    // fs.writeFileSync(imagePath, image, 'base64'); // 解碼並保存圖片
    
    // // 發送處理後的圖片路徑給前端
    // res.json({ imagePath }); // 返回相對路徑
    
    // 直接返回处理后的图像数据，无需保存到文件系统
    res.json({ image, filename });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

// 設置靜態文件夾以提供處理後的圖片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// 生成唯一的文件名
function generateUniqueFilename(originalFilename) {
    const currentDateTime = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    const fileExtension = path.extname(originalFilename);
    const newFilename = `${path.basename(originalFilename, fileExtension)}_${currentDateTime}_${randomSuffix}${fileExtension}`;
    return newFilename;
  }