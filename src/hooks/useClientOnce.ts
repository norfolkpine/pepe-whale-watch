import { useEffect, useRef } from "react";

export type Destructor = () => void;

/**
 * Guaranteed to run once at the client side.
 */
export const useClientOnce = (callback: () => Destructor | void) => {
  const isCalled = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined" && !isCalled.current) {
      isCalled.current = true;
      return callback();
    }
  }, []);
};