import { copy } from "./voltpro-home-copy.js";

const { brand, workspaces } = window.VoltProBrandConfig;

const nav = document.querySelector("#workspaceNav");
const grid = document.querySelector("#workspaceGrid");
const languageSelect = document.querySelector("#languageSelect");
const savedLanguageCode = localStorage.getItem("hb_language") || localStorage.getItem("voltpro-language");
const savedLanguage = savedLanguageCode === "pid" ? "pcm" : savedLanguageCode;
const savedTheme = localStorage.getItem("vp-theme") || localStorage.getItem("voltpro-theme");

function renderWorkspaces(language) {
  const words = copy[language] || copy.en;
  nav.innerHTML = workspaces.map((workspace, index) => `<a class="nav-link" href="${workspace.href}"><span class="nav-index">0${index + 1}</span><span>${workspace.name}</span></a>`).join("");
  grid.innerHTML = workspaces.map((workspace, index) => `<a class="workspace-card" href="${workspace.href}"><span class="card-index">0${index + 1}</span><span class="card-arrow" aria-hidden="true">↗</span><h3>${workspace.name}</h3><p>${words[workspace.descriptionKey]}</p><span class="card-action">${words.open}<span aria-hidden="true"> →</span></span></a>`).join("");
}

function applyLanguage(language) {
  const words = copy[language] || copy.en;
  document.documentElement.lang = language === "pcm" ? "en-NG" : language;
  document.querySelectorAll("[data-copy]").forEach((node) => { node.textContent = words[node.dataset.copy] || copy.en[node.dataset.copy] || ""; });
  languageSelect.value = language;
  localStorage.setItem("hb_language", language === "pcm" ? "pid" : language);
  renderWorkspaces(language);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.hbTheme = theme;
  document.documentElement.dataset.vpTheme = theme;
  document.body.classList.toggle("light", theme === "light");
  document.querySelector("#themeToggle").setAttribute("aria-pressed", String(theme === "light"));
  localStorage.setItem("vp-theme", theme);
}

document.title = `${brand.product} | ${brand.company}`;
document.querySelector("#year").textContent = String(new Date().getFullYear());
applyLanguage(savedLanguage && copy[savedLanguage] ? savedLanguage : "en");
applyTheme(savedTheme === "light" ? "light" : "dark");
languageSelect.addEventListener("change", (event) => applyLanguage(event.target.value));
document.querySelector("#themeToggle").addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

