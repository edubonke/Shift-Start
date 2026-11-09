const fs = require("fs"); const path = require("path"); const matter = require("gray-matter");
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const required = { procedure: ["title","description","content_type","category","severity","tags","tldr","escalation"], symptom: ["title","description","content_type","category","severity","tags","related_procedures"], cause: ["title","description","content_type","probability","related_symptoms"], command: ["title","description","content_type","platform"] };
let errors = [];
for (const file of walk(path.join("src","content")).filter(f => f.endsWith(".md"))) { const d = matter(fs.readFileSync(file,"utf8")).data; for (const key of required[d.content_type] || []) if (d[key] === undefined || d[key] === "") errors.push(`${file}: missing ${key}`); }
if (errors.length) { console.error(errors.join("\n")); process.exit(1); } console.log("Content validation passed.");
