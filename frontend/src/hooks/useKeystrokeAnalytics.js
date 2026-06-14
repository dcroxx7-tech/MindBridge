import { useRef, useEffect } from 'react';
import api from '../api';

export default function useKeystrokeAnalytics(fieldName = 'default') {
  const holdTimes = useRef([]);
  const flightTimes = useRef([]);
  const lastKeyDownTime = useRef(null);
  const lastKeyUpTime = useRef(null);
  const backspaceCount = useRef(0);
  const pauseCount = useRef(0);
  const totalKeystrokes = useRef(0);
  const startTime = useRef(null);
  const submitTimeout = useRef(null);
  const keyDownMap = useRef({});

  const resetMetrics = () => {
    holdTimes.current = [];
    flightTimes.current = [];
    lastKeyDownTime.current = null;
    lastKeyUpTime.current = null;
    backspaceCount.current = 0;
    pauseCount.current = 0;
    totalKeystrokes.current = 0;
    startTime.current = null;
    if (submitTimeout.current) {
      clearTimeout(submitTimeout.current);
      submitTimeout.current = null;
    }
    keyDownMap.current = {};
  };

  const handleKeyDown = (e) => {
    const now = Date.now();
    const key = e.key;

    // Check opt-in flag
    const isEnabled = localStorage.getItem('behavioral_enabled') === 'true';
    if (!isEnabled) return;

    if (!startTime.current) {
      startTime.current = now;
    }

    if (!keyDownMap.current[key]) {
      keyDownMap.current[key] = now;
      
      if (lastKeyUpTime.current) {
        const flightTime = now - lastKeyUpTime.current;
        if (flightTime > 0) {
          if (flightTime > 2000) {
            pauseCount.current += 1;
          } else {
            flightTimes.current.push(flightTime);
          }
        }
      }
      
      lastKeyDownTime.current = now;
      totalKeystrokes.current += 1;

      if (key === 'Backspace') {
        backspaceCount.current += 1;
      }
      
      resetSubmitTimeout();
    }
  };

  const handleKeyUp = (e) => {
    const now = Date.now();
    const key = e.key;

    const isEnabled = localStorage.getItem('behavioral_enabled') === 'true';
    if (!isEnabled) return;

    const keyDownTime = keyDownMap.current[key];
    if (keyDownTime) {
      const holdTime = now - keyDownTime;
      if (holdTime > 0 && holdTime < 1000) {
        holdTimes.current.push(holdTime);
      }
      delete keyDownMap.current[key];
    }
    lastKeyUpTime.current = now;
    resetSubmitTimeout();
  };

  const resetSubmitTimeout = () => {
    if (submitTimeout.current) {
      clearTimeout(submitTimeout.current);
    }
    submitTimeout.current = setTimeout(() => {
      submitSession();
    }, 5000);
  };

  const submitSession = async () => {
    if (submitTimeout.current) {
      clearTimeout(submitTimeout.current);
      submitTimeout.current = null;
    }

    const isEnabled = localStorage.getItem('behavioral_enabled') === 'true';
    if (!isEnabled) return;

    const keystrokesCount = totalKeystrokes.current;
    if (keystrokesCount < 10) {
      resetMetrics();
      return;
    }

    const now = Date.now();
    const duration = now - (startTime.current || now);
    
    const avgHold = holdTimes.current.length > 0 
      ? holdTimes.current.reduce((a, b) => a + b, 0) / holdTimes.current.length 
      : 120.0;
      
    const avgFlight = flightTimes.current.length > 0 
      ? flightTimes.current.reduce((a, b) => a + b, 0) / flightTimes.current.length 
      : 150.0;

    const durationMin = duration / 60000.0;
    const speedWpm = durationMin > 0 
      ? (keystrokesCount / 5) / durationMin 
      : 40.0;

    const backspaceRateVal = keystrokesCount > 0 
      ? backspaceCount.current / keystrokesCount 
      : 0.0;

    const pauseFreqVal = duration > 0 
      ? pauseCount.current / (duration / 1000.0) 
      : 0.0;

    const payload = {
      avg_hold_time_ms: Math.round(avgHold * 10) / 10,
      avg_flight_time_ms: Math.round(avgFlight * 10) / 10,
      typing_speed_wpm: Math.round(speedWpm * 10) / 10,
      backspace_rate: Math.round(backspaceRateVal * 1000) / 1000,
      pause_frequency: Math.round(pauseFreqVal * 1000) / 1000,
      session_duration_ms: duration,
      total_keystrokes: keystrokesCount
    };

    console.log(`Submitting behavioral timing telemetry [${fieldName}]:`, payload);
    resetMetrics();

    try {
      await api.post('/behavioral/checkin', payload);
    } catch (err) {
      console.error('Failed to submit behavioral keystroke telemetry:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (submitTimeout.current) {
        clearTimeout(submitTimeout.current);
      }
      if (totalKeystrokes.current >= 10) {
        submitSession();
      }
    };
  }, []);

  return {
    handleKeyDown,
    handleKeyUp,
    submitSession,
    resetMetrics
  };
}
