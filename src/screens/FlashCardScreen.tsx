import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { getProgressPercent } from '../data/progress';
import { topics } from '../data/topics';
import { WordGroup } from '../data/wordGroups';
import { addWordGroup, getGroupsForTopic } from '../storage/wordGroupStorage';
import AppHeaderCard from '../components/AppHeaderCard';
import CreateGroupModal from '../components/CreateGroupModal';

export type FlashCardAction = 'random';

type Props = {
  fullName: string;
  topicName: string;
  onSelectAction: (action: FlashCardAction) => void;
  onSelectGroup: (group: WordGroup) => void;
  onBackToHome: () => void;
  onLogout: () => void;
};

export default function FlashCardScreen({
  fullName,
  topicName,
  onSelectAction,
  onSelectGroup,
  onBackToHome,
  onLogout,
}: Props) {
  const progressPercent = getProgressPercent();
  const vocabularies = topics.find((item) => item.topic === topicName)?.vocabularies ?? [];

  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadGroups = useCallback(async () => {
    const stored = await getGroupsForTopic(topicName);
    setGroups(stored);
  }, [topicName]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const groupedIndices = new Set(groups.flatMap((group) => group.wordIndices));
  const ungroupedWords = vocabularies
    .map((word, index) => ({ ...word, index }))
    .filter((word) => !groupedIndices.has(word.index));

  const handleConfirmGroup = async (groupName: string, selectedIndices: number[]) => {
    const updated = await addWordGroup(topicName, groupName, selectedIndices, vocabularies.length);
    setGroups(updated);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

        <Text style={styles.topicTitle}>Flash Card: {topicName}</Text>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, styles.actionButtonBlue, ungroupedWords.length === 0 && styles.actionButtonDisabled]}
            onPress={() => ungroupedWords.length > 0 && setModalVisible(true)}
            disabled={ungroupedWords.length === 0}
          >
            <Ionicons name="folder-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Nhóm từ</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.actionButtonOrange]} onPress={() => onSelectAction('random')}>
            <Ionicons name="dice-outline" size={20} color="#D97706" />
            <Text style={styles.actionButtonText}>Dò bài ngẫu nhiên</Text>
          </Pressable>
        </View>

        {groups.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Nhóm từ đã chia ({groups.length})</Text>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                style={[styles.groupCard, { borderColor: group.color }]}
                onPress={() => onSelectGroup(group)}
              >
                <View style={[styles.groupIconBadge, { backgroundColor: `${group.color}1A` }]}>
                  <Ionicons name="albums-outline" size={22} color={group.color} />
                </View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupCount}>{group.wordIndices.length} từ</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </>
        )}

        {ungroupedWords.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Từ chưa chia nhóm ({ungroupedWords.length} từ mới)</Text>
            {ungroupedWords.map((word) => (
              <View key={word.index} style={styles.wordRow}>
                <Text style={styles.wordText}>
                  <Text style={styles.wordEnglish}>{word.vocabulary}: </Text>
                  <Text style={styles.wordTranscription}>{word.transcription}</Text>
                  <Text style={styles.wordMeaning}> - {word.meaning}</Text>
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Pressable style={styles.homeButton} onPress={onBackToHome}>
        <Ionicons name="home" size={18} color="#FFFFFF" />
        <Text style={styles.homeButtonText}>Trở về Trang chủ</Text>
      </Pressable>

      <CreateGroupModal
        visible={modalVisible}
        words={ungroupedWords}
        existingGroups={groups}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  actionButtonBlue: {
    borderColor: colors.primary,
  },
  actionButtonOrange: {
    borderColor: '#D97706',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 12,
  },
  groupIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  groupCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  wordRow: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  wordText: {
    fontSize: 14,
  },
  wordEnglish: {
    fontWeight: '700',
    color: colors.text,
  },
  wordTranscription: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  wordMeaning: {
    color: colors.text,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 28,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
