
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

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ image: `/uploads/${req.file.filename}` });
});

app.post('/process_selection', async (req, res) => {
  try {
    const { points } = req.body;
    const response = await axios.post('http://localhost:5000/process_selection', { points });
    const { image, filename } = response.data;

    const imagePath = path.join(__dirname, 'uploads', filename);
    fs.writeFileSync(imagePath, Buffer.from(image, 'base64'));

    res.json({ image: `/uploads/${filename}`, filename });
  } catch (error) {
    console.error('Error processing selection:', error);
    res.status(500).send('Error processing selection');
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
