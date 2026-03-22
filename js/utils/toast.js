// frontend/js/utils/toast.js

export function showToast(message, type = "info", duration = 4000) {

  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <span>${message}</span>
    <span class="toast-close">×</span>
  `;

  container.appendChild(toast);

  const close = () => {

    toast.style.animation = "toastOut .25s ease forwards";

    setTimeout(() => {
      toast.remove();
    }, 250);

  };

  toast.querySelector(".toast-close").onclick = close;

  if (duration) {
    setTimeout(close, duration);
  }

}