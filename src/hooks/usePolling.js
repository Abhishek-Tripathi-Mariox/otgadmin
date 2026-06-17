import { useEffect, useRef } from "react";

/**
 * Lightweight polling hook. Calls `callback` every `interval` ms while the tab
 * is visible, and clears the timer on unmount. Keeps admin list pages fresh
 * without a manual reload.
 *
 * @param {Function} callback - function to run on each tick (e.g. re-dispatch a list fetch)
 * @param {number} interval - polling interval in ms (default 25s)
 * @param {boolean} enabled - set false to pause polling
 */
export default function usePolling(callback, interval = 25000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = () => {
      // Avoid hammering the API when the tab is in the background.
      if (document.visibilityState === "visible") {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
}
