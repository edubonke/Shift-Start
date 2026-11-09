const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css/site.css": "assets/css/site.css" });
  eleventyConfig.addPassthroughCopy({ "src/generated": "data" });
  eleventyConfig.addPassthroughCopy({ public: "." });
  eleventyConfig.addPassthroughCopy({ api: "api" });

  eleventyConfig.addShortcode("command", function (shell, label, command, diagnosticId = "") {
    const safe = String(command).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const attr = diagnosticId ? ` data-diagnostic-id="${diagnosticId}"` : "";
    return `<div class="command-block"${attr}><div class="command-head"><span>${label || shell}</span><div class="flex gap-2"><button class="copy-command" type="button" aria-label="Copy command">Copy</button>${diagnosticId ? `<button class="run-diagnostic" type="button" data-diagnostic-action="${diagnosticId}">Run diagnostic</button>` : ""}</div></div><pre><code class="language-${shell}">${safe}</code></pre></div>`;
  });

  eleventyConfig.addFilter("bySlug", (collection, slug) => collection.find((item) => item.fileSlug === slug));
  eleventyConfig.addFilter("whereType", (collection, type) => collection.filter((item) => item.data.content_type === type));
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("dateISO", (value) => new Date(value).toISOString().slice(0, 10));

  eleventyConfig.addCollection("kb", (api) => api.getFilteredByGlob("src/content/**/*.md"));
  eleventyConfig.addCollection("procedures", (api) => api.getFilteredByGlob("src/content/procedures/*.md"));
  eleventyConfig.addCollection("symptoms", (api) => api.getFilteredByGlob("src/content/symptoms/*.md"));
  eleventyConfig.addCollection("causes", (api) => api.getFilteredByGlob("src/content/causes/*.md"));
  eleventyConfig.addCollection("commands", (api) => api.getFilteredByGlob("src/content/commands/*.md"));

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
