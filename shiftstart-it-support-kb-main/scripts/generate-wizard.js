const fs = require("fs"); const path = require("path"); const yaml = require("js-yaml");
const src = path.join("src", "data", "wizard-questions.yaml");
const out = path.join("src", "generated", "wizard-data.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(yaml.load(fs.readFileSync(src, "utf8")), null, 2));
console.log(`Generated ${out}`);
