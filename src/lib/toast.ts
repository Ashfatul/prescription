export type ToastType = "success" | "error" | "info";

export type ToastDetail = {
  message: string;
  type: ToastType;
};

export const TOAST_EVENT = "ppms:toast";

export function notifyToast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined" || !message.trim()) return;

  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, {
      detail: { message: message.trim(), type },
    }),
  );
}
