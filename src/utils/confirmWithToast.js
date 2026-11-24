import { toast } from "sonner";

export const confirmWithToast = (message, confirmLabel = "Підтвердити") =>
  new Promise((resolve) => {
    let toastId;
    let settled = false;

    const finish = (confirmed) => {
      if (settled) return;
      settled = true;
      toast.dismiss(toastId);
      resolve(confirmed);
    };

    toastId = toast.warning(message, {
      duration: Infinity,
      action: {
        label: confirmLabel,
        onClick: () => finish(true),
      },
      cancel: {
        label: "Скасувати",
        onClick: () => finish(false),
      },
      onDismiss: () => {
        if (settled) return;
        settled = true;
        resolve(false);
      },
    });
  });
