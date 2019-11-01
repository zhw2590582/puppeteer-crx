# puppeteer-crx

Use puppeteer to package chrome extensions

## Install

Install with `npm`

```bash
$ npm install puppeteer-crx
```

## Usage

```js
const path = require("path");
const crx = require("puppeteer-crx");
const src = path.resolve(__dirname, "./sample/");

crx(src, {
  // Is it also packaged into a zip for chrome web store?
  zip: false,
  // Packing delay time
  delay: 1000
}).then(result => {
  console.log(result);
});
```

## License

MIT © [Harvey Zack](https://sleepy.im/)
