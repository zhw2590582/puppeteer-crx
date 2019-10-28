const path = require("path");
const crx = require("../");
const src = path.resolve(__dirname, "./sample/");

crx(src).then(result => {
  console.log(result);
});
