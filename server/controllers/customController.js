const path = require("path");
const { spawn } = require("child_process");

exports.createCustom = async (req, res) => {
  const imagePath = path.join(__dirname, "..", "uploads", req.file.filename);
  const markers = JSON.parse(req.body.markers);

  const pythonScriptPath = path.join(__dirname, "..", "scripts", "image_processing.py");

  console.log(`Running Python script at: ${pythonScriptPath}`);
  console.log(`Image path: ${imagePath}`);
  console.log(`Markers: ${JSON.stringify(markers)}`);

  const pythonProcess = spawn("python", [pythonScriptPath, imagePath, JSON.stringify(markers)]);

  let outputData = '';

  pythonProcess.stdout.on("data", (data) => {
    outputData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
      res.status(500).send("Error processing image");
      return;
    }
    const outputPath = outputData.trim();
    if (outputPath) {
      const fullPath = path.resolve(__dirname, "..", outputPath);
      console.log(`Sending file from path: ${fullPath}`);
      res.sendFile(fullPath, (err) => {
        if (err) {
          console.error(`Error sending file: ${err}`);
          res.status(500).send("Error sending file");
        }
      });
    } else {
      console.error("Output path is empty");
      res.status(500).send("Error processing image");
    }
  });
};
