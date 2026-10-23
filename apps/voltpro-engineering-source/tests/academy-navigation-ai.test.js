"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Academy sidebar has one canonical destination for each learning workspace", () => {
  const html = read("index.html");
  const sidebarNav = html.slice(html.indexOf('<nav class="nav"'), html.indexOf("</nav>", html.indexOf('<nav class="nav"')));
  for (const label of ["Dashboard", "Learning Path", "Knowledge Checks", "Exam Practice", "Reference Library", "Safety &amp; Standards", "Virtual Labs", "Practical Workbench", "Tools &amp; Equipment", "Component Learning", "VoltPRo Simulator", "Engineering Tools", "AI Tutor"]) {
    assert.ok(sidebarNav.includes(label), "missing sidebar destination: " + label);
  }
  assert.equal((sidebarNav.match(/data-view="tutor"/g) || []).length, 1);
  assert.equal((sidebarNav.match(/href="simulator.html"/g) || []).length, 1);
  assert.equal((sidebarNav.match(/href="engineering.html"/g) || []).length, 1);
  assert.equal((sidebarNav.match(/href="academy-workbench.html"/g) || []).length, 1);
  assert.doesNotMatch(sidebarNav, /HB Professional Portfolio|GITHUB|LINKEDIN/);
});

test("sidebar external links are consolidated in one compact section", () => {
  const html = read("index.html");
  const sidebar = html.slice(html.indexOf('<aside class="sidebar"'), html.indexOf("</aside>"));
  assert.equal((sidebar.match(/href="https:\/\/hephzibahbehulah\.com\//g) || []).length, 1);
  assert.equal((sidebar.match(/href="https:\/\/github\.com\/HephzibahBehulah"/g) || []).length, 1);
  assert.equal((sidebar.match(/href="https:\/\/www\.linkedin\.com\/in\/isaacoluwoleadigun"/g) || []).length, 1);
});

test("AI Tutor knows the canonical ownership map and offers external public lookup", () => {
  const assistant = read("voltpro-assistant.js");
  assert.match(assistant, /PROJECT_CONTEXT/);
  for (const owner of ["VoltPRo Simulator", "Engineering Tools", "Practical Workbench", "Virtual Labs", "Reference Library", "Component Learning", "Knowledge Checks", "Exam Practice"]) {
    assert.ok(assistant.includes(owner), "project context missing: " + owner);
  }
  assert.match(assistant, /wikipedia\.org\/w\/api\.php/);
  assert.match(assistant, /siteContext: PROJECT_CONTEXT/);
  assert.match(assistant, /window\.VoltProAssistant\s*=\s*\{/);
  assert.match(assistant, /ask,/);
  assert.match(assistant, /vpBotExternal/);
  assert.match(assistant, /CURRENT WORKSPACE/);
  assert.match(assistant, /loadInternalKnowledge/);
  assert.match(assistant, /responseMode = "ai"/);
  assert.match(assistant, /mode: responseMode/);
  assert.match(assistant, /Offline fallback/);
  assert.match(assistant, /data\/electrical-tool-index\.json/);
});

test("Academy scripts parse and tutor page uses the shared project-aware assistant", () => {
  assert.doesNotThrow(() => new Function(read("script.js")));
  assert.doesNotThrow(() => new Function(read("voltpro-assistant.js")));
  const script = read("script.js");
  assert.match(script, /window\.VoltProAssistant&&typeof window\.VoltProAssistant\.ask==="function"/);
  assert.match(script, /layout\("Component Learning"/);
  assert.match(script, /layout\("Exam Practice"/);
  assert.match(script, /layout\("Knowledge Checks"/);
});
