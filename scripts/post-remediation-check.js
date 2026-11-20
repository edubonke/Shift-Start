const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const errors = [];
const procedures = fs.readdirSync("_procedures").filter((name) => name.endsWith(".md"));
const symptoms = fs.readdirSync("_symptoms").filter((name) => name.endsWith(".md"));
if (procedures.length !== 421) errors.push(`Expected 421 procedures; found ${procedures.length}`);
if (symptoms.length !== 446) errors.push(`Expected 446 symptoms; found ${symptoms.length}`);

const forbiddenCommand = "Get-ADUser -Identity username -Properties Enabled,LockedOut,PasswordExpired,LastLogonDate | Select SamAccountName,Enabled,LockedOut,PasswordExpired,LastLogonDate";
const reused = procedures.filter((name) => fs.readFileSync(path.join("_procedures", name), "utf8").includes(forbiddenCommand));
if (reused.length) errors.push(`Unrelated generic identity command remains in: ${reused.join(", ")}`);

const groupFile = fs.readFileSync("_procedures/add-or-remove-security-group-membership.md", "utf8");
for (const command of ["Get-ADGroupMember", "Add-ADGroupMember", "Remove-ADGroupMember", "Get-MgGroupMember", "New-MgGroupMemberByRef", "Remove-MgGroupMemberByRef"]) {
  if (!groupFile.includes(command)) errors.push(`Group-membership procedure is missing ${command}`);
}

const exactBadTitles = new Set([
  "Need to a desk move",
  "Need to a device health check",
  "Need to an approved remote wipe",
  "Request to a hardware request",
  "Request to a standard service request",
  "And rebuild the Teams cache",
  "A paper jam safely",
  "Hardware request requested",
  "Software installation request requested",
  "Standard service request requested"
]);
const malformed = [];
for (const name of symptoms) {
  const parsed = matter(fs.readFileSync(path.join("_symptoms", name), "utf8"));
  const title = String(parsed.data.title || "");
  if (exactBadTitles.has(title) || /^(?:Need to (?:a|an) |Request to (?:a|an) |And\b)|\brequest requested$/i.test(title)) malformed.push(`${name}: ${title}`);
}
if (malformed.length) errors.push(`Malformed titles remain: ${malformed.join("; ")}`);

const oldCategories = new Set(["Identity", "Network", "Microsoft 365", "Printing", "Windows Recovery", "Desktop", "Collaboration"]);
const duplicateCategories = [];
for (const dir of ["_procedures", "_symptoms"]) {
  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".md"))) {
    const parsed = matter(fs.readFileSync(path.join(dir, name), "utf8"));
    if (oldCategories.has(parsed.data.category)) duplicateCategories.push(`${dir}/${name}: ${parsed.data.category}`);
  }
}
if (duplicateCategories.length) errors.push(`Legacy duplicate categories remain: ${duplicateCategories.join("; ")}`);

const header = fs.readFileSync("_includes/header.html", "utf8");
if (!header.includes("/content-quality/")) errors.push("Global header does not include the Quality link");
const article = fs.readFileSync("_layouts/article.html", "utf8");
if (!article.includes("assurance-banner")) errors.push("Procedure layout does not show an assurance banner");
if (!article.includes("/reports/content-audit.json")) errors.push("Procedure assurance banner does not link to the audit report");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Phase-two remediation assertions passed: 421 procedures, 446 symptoms, no legacy taxonomy, no known malformed titles, no reused generic IAM command, and assurance links are global.");
