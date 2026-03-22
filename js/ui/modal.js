//js/ui/modal.js

export function createModal({ title, content, actions = [] }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  // HEADER
  const header = document.createElement("div");
  header.className = "modal-header";

  const h2 = document.createElement("h2");
  h2.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.className = "btn btn-ghost";
  closeBtn.textContent = "✕";

  closeBtn.onclick = (e) => {
  e.stopPropagation();
  overlay.remove();
};

  header.append(h2, closeBtn);

  // BODY
  const body = document.createElement("div");
  body.className = "modal-body";

  if (typeof content === "string") {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  // FOOTER
  const footer = document.createElement("div");
  footer.className = "modal-footer";

  actions.forEach(action => {
    const btn = document.createElement("button");
    btn.className = `btn ${action.variant || "btn-secondary"}`;
    btn.textContent = action.label;

    btn.onclick = action.onClick;

    footer.appendChild(btn);
  });

  modal.append(header, body, footer);
  overlay.appendChild(modal);

  // Close on outside click
  overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    e.stopPropagation();
    overlay.remove();
  }
  });
  document.body.appendChild(overlay);

  return {
    close: () => overlay.remove(),
    body,
    footer
  };
}