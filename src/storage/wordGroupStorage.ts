import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FINAL_GROUP_NAME,
  FINAL_GROUP_THRESHOLD,
  GROUP_COLOR_PALETTE,
  WordGroup,
} from '../data/wordGroups';

const KEY_PREFIX = 'engut_word_groups_';

function generateGroupId(): string {
  return `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getGroupsForTopic(topicName: string): Promise<WordGroup[]> {
  const raw = await AsyncStorage.getItem(KEY_PREFIX + topicName);
  return raw ? (JSON.parse(raw) as WordGroup[]) : [];
}

async function saveGroupsForTopic(topicName: string, groups: WordGroup[]): Promise<void> {
  await AsyncStorage.setItem(KEY_PREFIX + topicName, JSON.stringify(groups));
}

export async function addWordGroup(
  topicName: string,
  groupName: string,
  wordIndices: number[],
  totalWordCount: number
): Promise<WordGroup[]> {
  const groups = await getGroupsForTopic(topicName);

  const newGroup: WordGroup = {
    id: generateGroupId(),
    name: groupName,
    wordIndices,
    color: GROUP_COLOR_PALETTE[groups.length % GROUP_COLOR_PALETTE.length],
  };
  const updated = [...groups, newGroup];

  const groupedIndices = new Set(updated.flatMap((group) => group.wordIndices));
  const remainingIndices = Array.from({ length: totalWordCount }, (_, i) => i).filter(
    (i) => !groupedIndices.has(i)
  );

  if (remainingIndices.length > 0 && remainingIndices.length < FINAL_GROUP_THRESHOLD) {
    updated.push({
      id: generateGroupId(),
      name: FINAL_GROUP_NAME,
      wordIndices: remainingIndices,
      color: GROUP_COLOR_PALETTE[updated.length % GROUP_COLOR_PALETTE.length],
    });
  }

  await saveGroupsForTopic(topicName, updated);
  return updated;
}
