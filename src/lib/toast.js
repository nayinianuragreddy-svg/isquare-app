let listener = null;
export const toast = (msg, type = "success") => {
  if (listener) listener({ id: Date.now(), msg, type });
};
export const setToastListener = (fn) => { listener = fn; };
