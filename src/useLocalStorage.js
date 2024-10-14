import { useState, useEffect } from "react";

// To remove:
// localStorage.removeItem(key);

function getStorageValue(key, defaultValue) {
  const saved = localStorage.getItem(key);
  const value = JSON.parse(saved);
  return value || defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
