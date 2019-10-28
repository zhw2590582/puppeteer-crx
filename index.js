const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

module.exports = async src => {
  if (typeof src !== "string") throw new Error("Missing path");
  const browser = await puppeteer.launch({ headless: false });
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

  await browser.close();
};
