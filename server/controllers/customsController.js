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

exports.getCustomsWalls = async (req, res, next) => {
  try {
    const walls = await Customs.find(
      { type: "custom" },
      "wallName originalImage"
    );
    res.status(200).json(walls);
  } catch (error) {
    next(error);
  }
};

exports.getCustomsWallRoutes = async (req, res, next) => {
  const { wallName } = req.params;

  try {
    const wall = await Customs.findOne({ wallName });
    if (wall) {
      res.status(200).json(wall.customs);
    } else {
      res.status(404).json({ message: "查無此牆面" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getCustomsWallRouteById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const wall = await Customs.findOne(
      { "customs._id": id },
      { wallName: 1, "customs.$": 1 }
    );

    if (wall) {
      res.status(200).json(wall);
    } else {
      res.status(404).json({ message: "查無此路線" });
    }
  } catch (error) {
    next(error);
  }
};

exports.processImage = async (req, res, next) => {
  const { image, markers } = req.body;

  if (!image || typeof image !== "string") {
    return res
      .status(400)
      .json({ message: "圖片路徑不可缺少，而且必須是字串格式" });
  }
  if (!markers) {
    return res.status(400).json({ message: "需要使用至少一個標記" });
  }

  const localImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    path.basename(image)
  );

  try {
    const response = await axios({
      url: image,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(localImagePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      const pythonScriptPath = path.join(
        __dirname,
        "..",
        "scripts",
        "image_processing.py"
      );
      const pythonProcess = spawn("python", [
        pythonScriptPath,
        localImagePath,
        JSON.stringify(markers),
      ]);

      let outputData = "";

      pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          res.status(500).json({ message: "Error processing image" });
          return;
        }
        const outputPath = outputData.trim();
        const relativePath = path.join("uploads", path.basename(outputPath));

        res.status(200).json({ processedImage: relativePath });
      });
    });

    writer.on("error", (err) => {
      next(new Error("Error writing image to local file"));
    });
  } catch (error) {
    next(new Error("Error fetching image from S3"));
  }
};

exports.createCustoms = async (req, res, next) => {
  const { wallName, processedImage, userId, customName, customType, memo } =
    req.body;

  if (!wallName || !processedImage || !customName) {
    return res.status(400).json({ message: "請填入所有必填欄位的資料！" });
  }

  if (customName.length > 20) {
    return res.status(400).json({ message: "路線名稱不能超過20個字元！" });
  }

  if (memo && memo.length > 100) {
    return res.status(400).json({ message: "說明或備註不能超過100個字元！" });
  }

  const localImagePath = path.resolve(__dirname, "..", processedImage);

  if (!fs.existsSync(localImagePath)) {
    return res.status(400).json({ message: "找不到執行後的結果圖片" });
  }

  const fileContent = fs.readFileSync(localImagePath);
  const fileName = `processed/${path.basename(localImagePath)}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileContent,
    ContentType: "image/png",
  };

  try {
    const data = await s3.upload(params).promise();
    const imageUrl = data.Location;

    const wall = await Customs.findOne({ wallName });
    if (wall) {
      wall.customs.push({
        processedImage: imageUrl,
        setter: userId,
        customName,
        customType,
        memo,
      });
      await wall.save();
      res.status(201).json(wall);
    } else {
      res.status(404).json({ message: "查無此牆面" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAchievementWalls = async (req, res, next) => {
  try {
    const walls = await Customs.find(
      { type: "achievement" },
      "wallName originalImage"
    );
    res.status(200).json(walls);
  } catch (error) {
    next(error);
  }
};

exports.getAchievementRoutes = async (req, res, next) => {
  const { wallName } = req.params;

  try {
    const wall = await Customs.findOne({ type: "achievement", wallName });
    if (wall) {
      res.status(200).json(wall);
    } else {
      res.status(404).json({ message: "查無此牆面" });
    }
  } catch (error) {
    next(error);
  }
};