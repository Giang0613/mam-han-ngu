"use client";

import { Howl } from 'howler';
import { useRef, useEffect } from 'react';
import { useLessonStore } from '@/store/useLessonStore';

export function useAudio(src: string, isSfx = false) {
  const soundRef = useRef<Howl | null>(null);
  const isMuted = useLessonStore(state => state.isAudioMuted);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [src],
      preload: true,
      html5: !isSfx, // Voice uses html5 streaming, SFX uses Web Audio API (low latency)
    });

    return () => {
      soundRef.current?.unload();
    };
  }, [src, isSfx]);

  const play = () => {
    if (isMuted) return;
    soundRef.current?.play();
  };

  return { play };
}
