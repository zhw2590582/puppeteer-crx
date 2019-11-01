const path = require("path");
const crx = require("../");
const src = path.resolve(__dirname, "./sample/");

crx(src, {
  zip: true,
  delay: 1000
}).then(result => {
  console.log(result);
});
