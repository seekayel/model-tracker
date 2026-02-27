import { useState, useEffect } from 'react';
import type { KeyboardState } from '../types';

export const useKeyboard = (): KeyboardState => {
  const [keys, setKeys] = useState<KeyboardState>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys((prevKeys) => ({ ...prevKeys, [event.code]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys((prevKeys) => ({ ...prevKeys, [event.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};
