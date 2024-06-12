const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 7000;

app.use(express.json());
app.use(express.static('public'));
app.use(helmet());

const corsOptions = {
  origin: ['*'],
  // origin: ['https://me2vegan.com'],
  methods: 'GET, HEAD, PUT, PATCH, DELETE',
  credentials: true,
  optionsSuccessStatus: 200
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.use(cors(corsOptions));

app.post('/api/upload', upload.fields([{ name: 'image' }, { name: 'video'}]), (req, res) => {
  const { description } = req.body;
  const image = req.files.image ? req.files.image[0].path : null;
  const video = req.files.video ? req.files.video[0].path : null;

  console.log('Description: ', description);
  console.log('Image: ', image);
  console.log('Video: ', video);

  res.status(200).json({ message: 'Files uploaded successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
