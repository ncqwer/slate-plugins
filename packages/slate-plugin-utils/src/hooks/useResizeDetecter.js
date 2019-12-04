import { useRef, useLayoutEffect } from 'react';
import ResizeOberver from 'resize-observer-polyfill';

const useResizeDetecter = callback => {
  const ref = useRef(ref);
  const handler = useRef(null);
  handler.current = callback;
  useLayoutEffect(() => {
    if (!ref.current) return;
    const monitor = new ResizeOberver(([t]) => {
      if (handler.current) {
        handler.current(t);
      }
    });
    monitor.observe(ref.current);

    return () => {
      monitor.disconnect();
    };
  }, []);
  return ref;
};

export default useResizeDetecter;
