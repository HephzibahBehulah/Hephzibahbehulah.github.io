export function installResponsiveElectricalControls({ document, window, togglePanel }) {
  document.querySelectorAll("[data-panel]").forEach(button => {
    button.addEventListener("click", () => togglePanel(button.dataset.panel));
  });
  document.querySelectorAll("[data-close-panel]").forEach(button => {
    button.addEventListener("click", () => togglePanel(button.dataset.closePanel, false));
  });

  const compact = window.matchMedia("(max-width: 850px)");
  const syncCatalogue = event => togglePanel("library", !event.matches);
  const titleBlock = document.querySelector(".title-block");
  const titleFields = document.querySelector(".title-block-fields");
  const syncTitleFields = event => {
    const isCompact = event?.matches ?? compact.matches;
    titleFields.hidden = isCompact && titleBlock.dataset.expanded !== "true";
  };
  syncCatalogue(compact);
  syncTitleFields(compact);
  compact.addEventListener("change", event => {
    syncCatalogue(event);
    syncTitleFields(event);
  });

  const titleToggle = document.getElementById("toggleTitleBlock");
  titleToggle.addEventListener("click", event => {
    const expanded = titleBlock.dataset.expanded !== "true";
    titleBlock.dataset.expanded = String(expanded);
    titleFields.hidden = !expanded;
    event.currentTarget.setAttribute("aria-expanded", String(expanded));
  });
}

