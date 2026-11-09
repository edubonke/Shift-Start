const fs = require("fs"); const path = require("path"); const matter = require("gray-matter"); const lunr = require("lunr");
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const files = walk(path.join("src", "content")).filter(f => f.endsWith(".md"));
const prefix = process.env.PATH_PREFIX || "/";
const docs = files.map((file, i) => {
  const parsed = matter(fs.readFileSync(file, "utf8")); const slug = parsed.data.slug || path.basename(file, ".md");
  const type = parsed.data.content_type || path.basename(path.dirname(file));
  const body = parsed.content.replace(/{%[\s\S]*?%}/g, " ").replace(/[#>*_`\[\]()|-]/g, " ").replace(/\s+/g, " ").trim();
  return { id: String(i), title: parsed.data.title, description: parsed.data.description || "", type, category: parsed.data.category || "", tags: (parsed.data.tags || []).join(" "), error_codes: (parsed.data.error_codes || []).join(" "), content: body, url: `${prefix}${type === "procedure" ? "procedures" : type + "s"}/${slug}/`.replace(/\/+/g, "/") };
});
const idx = lunr(function () { this.ref("id"); this.field("title", { boost: 15 }); this.field("error_codes", { boost: 14 }); this.field("tags", { boost: 9 }); this.field("category", { boost: 6 }); this.field("description", { boost: 5 }); this.field("content"); docs.forEach(d => this.add(d)); });
fs.mkdirSync(path.join("src", "generated"), { recursive: true });
fs.writeFileSync(path.join("src", "generated", "search-index.json"), JSON.stringify(idx));
fs.writeFileSync(path.join("src", "generated", "search-documents.json"), JSON.stringify(docs, null, 2));
console.log(`Indexed ${docs.length} Markdown articles`);
