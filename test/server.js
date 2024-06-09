
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.static("public"));

app.use(express.json());
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const image = fs.readFileSync(req.file.path);
    const encodedImage = image.toString('base64');
    const colors = ['red', 'purple', 'green', 'black', 'yellow'];
    const processedImages = {};

    for (const color of colors) {
      const response = await axios.post('http://localhost:5000/select_rock_point', {
        color,
        image: encodedImage
      });
      const { image, filename } = response.data;
      const imagePath = `/uploads/${filename}`;
      fs.writeFileSync(path.join(__dirname, 'uploads', filename), Buffer.from(image, 'base64'));
      processedImages[color] = imagePath;
    }

    res.json({ images: processedImages });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

// 設置靜態文件夾來提供處理後的圖片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
