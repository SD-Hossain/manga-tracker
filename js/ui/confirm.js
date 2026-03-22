//js/ui/confirm.js

import { createModal } from "./modal.js";

export function confirmAction({
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "btn-danger"
}) {
  return new Promise((resolve) => {

    const content = document.createElement("div");
    content.className = "form-stack";

    const text = document.createElement("p");
    text.textContent = message;

    content.appendChild(text);

    const modal = createModal({
      title,
      content,
      actions: [
        {
          label: cancelText,
          variant: "btn-secondary",
          onClick: () => {
            modal.close();
            resolve(false);
          }
        },
        {
          label: confirmText,
          variant,
          onClick: () => {
            modal.close();
            resolve(true);
          }
        }
      ]
    });

  });
}