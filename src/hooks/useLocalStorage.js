import React, { useEffect, useState } from "react";

const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem(key)) || initial
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
};

export default useLocalStorage;
