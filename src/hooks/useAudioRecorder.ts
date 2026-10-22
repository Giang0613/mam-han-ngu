"use client";

import {useVoiceRecorder} from './useVoiceRecorder';

export function useAudioRecorder() {
 const voice=useVoiceRecorder(20000);
 return {isRecording:voice.phase==='recording',startRecording:voice.start,stopRecording:voice.stop,error:voice.message};
}
