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
    const walls = await Customs.find({ type: "custom" }, "wallName originalImage");
    res.status(200).json(walls);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching walls data",
      error: error.message,
    });
  }
};

exports.getCustomsWallRoutes = async (req, res) => {
  const { wallName } = req.params;

  try {
    const wall = await Customs.findOne({ wallName });
    if (wall) {
      res.status(200).json(wall.customs);
    } else {
      res.status(404).json({ message: "Wall not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching wall routes data",
      error: error.message,
    });
  }
};

exports.getCustomsWallRouteById = async (req, res) => {
  const id = req.params.id;

  try {
    const wall = await Customs.findOne({ "customs._id": id }, { wallName: 1, "customs.$": 1 });
    // console.log("wall: ", wall);
    if (wall) {
      res.status(200).json(wall);
    } else {
      res.status(404).json({ message: "Route not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching route data",
      error: error.message,
    });
  }
};

exports.processImage = async (req, res) => {
  const { image, markers } = req.body;

  if (!image || typeof image !== "string") {
    return res
      .status(400)
      .json({ message: "Image path is required and must be a string" });
  }
  if (!markers) {
    return res.status(400).json({ message: "Markers are required" });
  }

  const localImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    path.basename(image)
  );
  // const outputImagePath = path.join(__dirname, "..", "uploads", "output.png");

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
          res.status(500).send("Error processing image");
          return;
        }
        const outputPath = outputData.trim();
        const relativePath = path.join("uploads", path.basename(outputPath));

        res.status(200).json({ processedImage: relativePath });
      });
    });

    writer.on("error", (err) => {
      console.error("Error writing image to local file:", err);
      res.status(500).send("Error writing image to local file");
    });
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    res.status(500).send("Error fetching image from S3");
  }
};

exports.createCustoms = async (req, res) => {
  const { wallName, processedImage, customName, customType, memo } = req.body;
  // console.log(wallName, processedImage, customName, customType, memo);

  if (!wallName || !processedImage || !customName || !customType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const localImagePath = path.resolve(__dirname, "..", processedImage);

  if (!fs.existsSync(localImagePath)) {
    return res.status(400).json({ message: "Processed image not found" });
  }

  const fileContent = fs.readFileSync(localImagePath);
  const fileName = `processed/${path.basename(localImagePath)}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileContent,
    ContentType: "image/png",
    // ACL: "public-read"
  };

  try {
    const data = await s3.upload(params).promise();
    const imageUrl = data.Location;

    const wall = await Customs.findOne({ wallName });
    if (wall) {
      wall.customs.push({
        processedImage: imageUrl,
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
    console.error("Error uploading to S3 or saving to DB:", error);
    res.status(500).json({
      message: "Error creating custom route",
      error: error.message,
    });
  }
};










exports.getAchievementWalls = async (req, res) => {
  try {
    const walls = await Customs.find({ type: "achievement" }, "wallName originalImage");
    res.status(200).json(walls);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching walls data",
      error: error.message,
    });
  }
};

exports.getAchievementRoutes = async (req, res) => {
  const { wallName } = req.params;

  try {
    const wall = await Customs.findOne({ type: "achievement", wallName });
    if (wall) {
      res.status(200).json(wall);
    } else {
      res.status(404).json({ message: "Wall not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching wall routes data",
      error: error.message,
    });
  }
};

// exports.processAchievementImage = async (req, res) => {
//   const { image } = req.body;

//   if (!image || typeof image !== "string") {
//     return res
//       .status(400)
//       .json({ message: "Image path is required and must be a string" });
//   }

//   const localImagePath = path.join(
//     __dirname,
//     "..",
//     "uploads",
//     path.basename(image)
//   );

//   try {
//     const response = await axios({
//       url: image,
//       method: "GET",
//       responseType: "stream",
//     });

//     const writer = fs.createWriteStream(localImagePath);
//     response.data.pipe(writer);

//     writer.on("finish", () => {
//       const pythonScriptPath = path.join(
//         __dirname,
//         "..",
//         "scripts",
//         "process_image_by_color.py"
//       );
//       const pythonProcess = spawn("python", [
//         pythonScriptPath,
//         localImagePath
//       ]);

//       let outputData = "";

//       pythonProcess.stdout.on("data", (data) => {
//         outputData += data.toString();
//       });

//       pythonProcess.stderr.on("data", (data) => {
//         console.error(`stderr: ${data}`);
//       });

//       pythonProcess.on("close", (code) => {
//         if (code !== 0) {
//           res.status(500).send("Error processing image");
//           return;
//         }
        
//         const resultFiles = JSON.parse(outputData.trim());
//         const resultPaths = resultFiles.map(file => path.join("uploads", file));
//         res.status(200).json({ processedImages: resultPaths });
//       });
//     });

//     writer.on("error", (err) => {
//       console.error("Error writing image to local file:", err);
//       res.status(500).send("Error writing image to local file");
//     });
//   } catch (error) {
//     console.error("Error fetching image from S3:", error);
//     res.status(500).send("Error fetching image from S3");
//   }
// };
