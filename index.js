const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const zipFolderPr = (src, zipFile) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFile);
    const archive = archiver("zip", {
      zlib: { level: 9 }
    });
    output.on("close", () => {
      resolve();
    });
    archive.on("error", err => {
      reject(err);
    });
    archive.pipe(output);
    archive.directory(src, false);
    archive.finalize();
  });
};

module.exports = async (
  src,
  option = {
    zip: true
  }
) => {
  if (typeof src !== "string") throw new Error("Missing path");
  if (typeof option !== "object") throw new Error("Missing option");
  const manifest = path.join(src, "manifest.json");
  if (!fs.existsSync(manifest)) throw new Error("Missing manifest.json");
  const pathArr = src.split(path.sep);
  const fileName = pathArr.pop();
  const parentDir = pathArr.join(path.sep);
  const crxFile = path.join(parentDir, `${fileName}.crx`);
  const pemFile = path.join(parentDir, `${fileName}.pem`);
  const zipFile = path.join(parentDir, `${fileName}.zip`);
  if (fs.existsSync(crxFile)) fs.unlinkSync(crxFile);
  if (fs.existsSync(pemFile)) fs.unlinkSync(pemFile);
  if (option.zip && fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto("chrome://extensions");

  await page.evaluate(async () => {
    document
      .querySelector("body > extensions-manager")
      .shadowRoot.querySelector("extensions-toolbar")
      .shadowRoot.querySelector("#devMode")
      .click();

    document
      .querySelector("body > extensions-manager")
      .shadowRoot.querySelector("extensions-toolbar")
      .shadowRoot.querySelector("#packExtensions")
      .click();
  });

  const input = await page.evaluateHandle(
    `document.querySelector("body > extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("extensions-pack-dialog").shadowRoot.querySelector("#root-dir").shadowRoot.querySelector("#input")`
  );

  await input.click();
  await input.focus();
  await input.type(src);

  await page.evaluate(async () => {
    const pack = document
      .querySelector("body > extensions-manager")
      .shadowRoot.querySelector("extensions-toolbar")
      .shadowRoot.querySelector("extensions-pack-dialog")
      .shadowRoot.querySelector(
        "#dialog > div:nth-child(3) > cr-button.action-button"
      );
    pack.disabled = false;
    pack.click();
  });

  await page.waitFor(1000);
  await browser.close();

  if (!fs.existsSync(crxFile)) {
    throw new Error(`Package crx failure in: ${crxFile}`);
  }

  if (!fs.existsSync(pemFile)) {
    throw new Error(`Package pem failure in: ${pemFile}`);
  }

  if (option.zip) {
    await zipFolderPr(src, zipFile);
    if (!fs.existsSync(zipFile)) {
      throw new Error(`Package zip failure in: ${zipFile}`);
    }
  }

  return {
    crx: crxFile,
    pem: pemFile,
    zip: option.zip ? zipFile : undefined
  };
};
