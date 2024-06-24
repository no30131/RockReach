const puppeteer = require("puppeteer");
const path = require("path");

exports.captureScreenshot = async (req, res) => {
    const { url } = req.body;
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(5000);

        const screenshotPath = path.join(__dirname, '../uploads', `screenshot-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        await browser.close();
        res.status(200).send({ message: 'Screenshot captured successfully', path: screenshotPath });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
};