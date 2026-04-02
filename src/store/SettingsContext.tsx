import React, { createContext, useContext, useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { playSound, SoundName } from '../utils/sounds';
import { vibrate, VibrationPattern } from '../utils/vibration';

interface SettingsContextType {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
  play: (name: SoundName) => void;
  vibra: (pattern: VibrationPattern) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    bridge.send('VKWebAppStorageGet', { keys: ['settings'] }).then((result: any) => {
      const saved = result.keys?.find((k: any) => k.key === 'settings')?.value;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.sound !== undefined) setSoundEnabled(parsed.sound);
          if (parsed.vibration !== undefined) setVibrationEnabled(parsed.vibration);
        } catch (e) {}
      }
    });
  }, []);

  const save = (sound: boolean, vibration: boolean) => {
    bridge.send('VKWebAppStorageSet', {
      key: 'settings',
      value: JSON.stringify({ sound, vibration }),
    });
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      save(next, vibrationEnabled);
      return next;
    });
  };

  const toggleVibration = () => {
    setVibrationEnabled(prev => {
      const next = !prev;
      save(soundEnabled, next);
      return next;
    });
  };

  const play = (name: SoundName) => {
    if (soundEnabled) playSound(name);
  };

  const vibra = (pattern: VibrationPattern) => {
    if (vibrationEnabled) vibrate(pattern);
  };

  return (
    <SettingsContext.Provider value={{ soundEnabled, vibrationEnabled, toggleSound, toggleVibration, play, vibra }}>
      {children}
    </SettingsContext.Provider>
  );
};
