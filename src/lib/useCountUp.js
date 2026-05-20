import { useState, useEffect, useRef } from "react";

export function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!target || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
      setVal(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return val;
}

export function AnimatedNumber({ value, duration = 800, format }) {
  const display = useCountUp(value, duration);
  return format ? format(display) : display;
}
