import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'engut_quiz_passed_topics';
const PERCENT_PER_TOPIC = 4;

let passedTopics: string[] = [];
const listeners = new Set<() => void>();

function computePercent(): number {
  return Math.min(100, passedTopics.length * PERCENT_PER_TOPIC);
}

function notify() {
  listeners.forEach((listener) => listener());
}

export async function loadProgress(): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  passedTopics = raw ? JSON.parse(raw) : [];
  notify();
}

export function isTopicPassed(topicName: string): boolean {
  return passedTopics.includes(topicName);
}

export async function markTopicPassed(topicName: string): Promise<void> {
  if (passedTopics.includes(topicName)) return;
  passedTopics = [...passedTopics, topicName];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(passedTopics));
  notify();
}

export function getProgressPercent(): number {
  return computePercent();
}

export function useProgressPercent(): number {
  const [percent, setPercent] = useState(computePercent());
  useEffect(() => {
    const listener = () => setPercent(computePercent());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return percent;
}
