const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.match(appSource, /\.sort\(\(a, b\) => String\(a\.title \|\| ""\)\.localeCompare/);
assert.match(appSource, /id="categoryLinkSearch"/);
assert.match(appSource, /Search websites in this category/);
assert.match(appSource, /data-category-link-search/);
assert.match(appSource, /No websites match that search/);
assert.match(appSource, /attachCategoryLinkSearch\(\)/);
assert.match(stylesSource, /\.category-link-search/);

console.log("Website category sorting and search verification passed.");
