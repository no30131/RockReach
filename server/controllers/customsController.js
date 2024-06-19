const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const AWS = require("aws-sdk");
const axios = require("axios");
const Customs = require("../models/customs");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.getCustomsWalls = async (req, res) => {
  try {
    const walls = await Customs.find({}, 'wallName originalImage');
    res.status(200).json(walls);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching walls data",
      error: error.message,
    });
  }
}

exports.processImage = async (req, res) => {
  const { image, markers } = req.body;

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ message: "Image path is required and must be a string" });
  }
  if (!markers) {
    return res.status(400).json({ message: "Markers are required" });
  }

  const localImagePath = path.join(__dirname, "..", "uploads", path.basename(image));
  const outputImagePath = path.join(__dirname, "..", "uploads", "output.png"); 

  try {
    const response = await axios({
      url: image,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(localImagePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      const pythonScriptPath = path.join(__dirname, "..", "scripts", "image_processing.py");
      const pythonProcess = spawn("python", [pythonScriptPath, localImagePath, JSON.stringify(markers), outputImagePath]);

      let outputData = '';

      pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          res.status(500).send("Error processing image");
          return;
        }
        const outputPath = outputData.trim();
        const relativePath = path.join("uploads", path.basename(outputPath));

        res.status(200).json({ processedImage: relativePath });
      });
    });

    writer.on('error', (err) => {
      console.error('Error writing image to local file:', err);
      res.status(500).send("Error writing image to local file");
    });

  } catch (error) {
    console.error('Error fetching image from S3:', error);
    res.status(500).send("Error fetching image from S3");
  }
};

exports.confirmAndSaveImage = async (req, res) => {
  const { wallName, processedImage, customName, customType, memo } = req.body;

  try {
    const imageData = fs.readFileSync(processedImage);

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `processed/${path.basename(processedImage)}`,
      Body: imageData,
      ContentType: "image/png",
      ACL: "public-read"
    };

    const s3Data = await s3.upload(s3Params).promise();

    const wall = await Customs.findOne({ wallName });
    if (wall) {
      wall.customs.push({
        processedImage: s3Data.Location,
        customName,
        customType,
        memo,
      });
      await wall.save();
      res.status(201).json(wall);
    } else {
      res.status(404).json({ message: "Wall not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error saving custom route",
      error: error.message,
    });
  }
}