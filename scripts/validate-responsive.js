const fs = require("fs");

const read = (file) => fs.readFileSync(file, "utf8");
const errors = [];
const requireText = (file, text, message) => {
  if (!read(file).includes(text)) errors.push(`${file}: ${message}`);
};
const requirePattern = (file, pattern, message) => {
  if (!pattern.test(read(file))) errors.push(`${file}: ${message}`);
};
const forbidText = (file, text, message) => {
  if (read(file).includes(text)) errors.push(`${file}: ${message}`);
};

requireText("_layouts/default.html", "viewport-fit=cover", "viewport must support notches and safe areas");
requireText("_layouts/default.html", 'class="skip-link"', "skip link is required for keyboard and assistive-technology users");
requireText("_layouts/default.html", 'id="main-content"', "main content landmark must have a focus target");
requireText("_layouts/default.html", "shiftstart-favicon.svg", "approved SVG favicon must be used");
requireText("_layouts/default.html", "theme-visibility.css", "theme visibility corrections must be loaded");
forbidText("_layouts/default.html", "shiftstart-logo-light-theme.png", "generated light-theme logo must not be applied");
forbidText("_layouts/default.html", "shiftstart-logo-dark-theme.png", "generated dark-theme logo must not be applied");
requireText("_includes/header.html", "data-menu-toggle", "responsive navigation toggle is missing");
requireText("_includes/header.html", "shiftstart-mark.svg", "approved SVG brand mark must be used");
forbidText("_includes/header.html", "data-theme-brand-mark", "generated theme logo replacement hook must not be present");
requireText("_includes/header.html", "mobile-navigation", "mobile navigation region is missing");
requireText("_includes/header.html", 'inputmode="search"', "mobile search keyboard hint is missing");
requireText("_includes/header.html", "data-search-clear", "search clear control is missing");
requireText("_includes/command.html", "command-scroll", "commands must have a keyboard-accessible horizontal scroll region");
requireText("_layouts/article.html", "procedure-actions", "responsive procedure action area is missing");
requireText("_layouts/list.html", "catalog-filter-panel", "responsive catalogue filter panel is missing");

const css = read("_assets/css/tailwind.css");
const cssRequirements = [
  ["env(safe-area-inset-bottom", "safe-area support is missing"],
  ["@media (max-width: 639px)", "phone breakpoint is missing"],
  ["@media (max-height: 620px) and (orientation: landscape)", "short landscape device handling is missing"],
  ["@media (hover: none) and (pointer: coarse)", "touch-device handling is missing"],
  ["@media (prefers-reduced-motion: reduce)", "reduced-motion support is missing"],
  ["@media (forced-colors: active)", "forced-colour support is missing"],
  ["@media print", "print layout is missing"],
  ["min-h-11", "minimum touch target rule is missing"],
  ["overflow-x-auto", "horizontal overflow protection is missing"],
  ["100dvh", "dynamic viewport handling is missing"]
];
for (const [text, message] of cssRequirements) if (!css.includes(text)) errors.push(`_assets/css/tailwind.css: ${message}`);

requirePattern("assets/js/app.js", /matchMedia\?\.\("\(min-width: 768px\)"\)/, "wizard must adapt category expansion to device width");
requireText("assets/js/app.js", "copyText", "clipboard fallback is missing");
requireText("assets/js/app.js", "updateSelectionState", "wizard selection must update without rebuilding all 446 symptoms");
requireText("assets/js/search.js", "pointerdown", "touch/click outside search dismissal is missing");
requireText("assets/js/search.js", "aria-activedescendant", "accessible search result navigation is missing");
requireText("assets/css/theme-visibility.css", 'html[data-theme="light"] .site-brand-mark', "light-theme logo contrast correction is missing");
requireText("assets/css/theme-visibility.css", ".rd-home-hero-copy h1", "dark-theme hero text contrast correction is missing");
requireText("assets/css/theme-visibility.css", ".rd-first-response .rd-panel-heading h2", "dark-theme first-response heading contrast correction is missing");
forbidText("assets/css/theme-visibility.css", "background-image", "theme visibility CSS must not replace the approved logo artwork");

for (const file of ["assets/js/app.js", "assets/js/search.js"]) {
  const source = read(file);
  if (/\.style\.width\s*=\s*["']\d+px/.test(source)) errors.push(`${file}: hard-coded JavaScript width can break responsive layouts`);
}

const procedureCount = fs.readdirSync("_procedures").filter((name) => name.endsWith(".md")).length;
const symptomCount = fs.readdirSync("_symptoms").filter((name) => name.endsWith(".md")).length;
if (procedureCount !== 421) errors.push(`Procedure count changed during device optimisation: expected 421, found ${procedureCount}`);
if (symptomCount !== 446) errors.push(`Symptom count changed during device optimisation: expected 446, found ${symptomCount}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Responsive validation passed for phone, tablet, desktop, wide-screen, touch, keyboard, high-contrast and print layouts. Content preserved: ${procedureCount} procedures and ${symptomCount} symptoms.`);
