import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { useProgressPercent } from '../data/progress';
import { getTopicPractice } from '../data/practice';
import AppHeaderCard from '../components/AppHeaderCard';

type Props = {
  fullName: string;
  topicName: string;
  onSelectExercise: (exerciseIndex: number) => void;
  onBackToTopicDetail: () => void;
  onLogout: () => void;
};

export default function PracticeScreen({ fullName, topicName, onSelectExercise, onBackToTopicDetail, onLogout }: Props) {
  const progressPercent = useProgressPercent();
  const topicPractice = getTopicPractice(topicName);
  const exercises = topicPractice?.exercises ?? [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

        <View style={styles.breadcrumbRow}>
          <Ionicons name="create-outline" size={14} color={colors.textMuted} />
          <Text style={styles.breadcrumbText}>{topicName.toUpperCase()} · LUYỆN TẬP</Text>
        </View>
        <Text style={styles.title}>Đặt câu với từ liên quan</Text>

        {exercises.length === 0 ? (
          <Text style={styles.emptyText}>Chủ đề này chưa có bài luyện tập.</Text>
        ) : (
          exercises.map((exercise, index) => (
            <Pressable key={exercise.title} style={styles.exerciseCard} onPress={() => onSelectExercise(index)}>
              <View style={styles.exerciseIconBadge}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseSubtitle}>{exercise.sentences.length} câu dịch Việt - Anh</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <Pressable style={styles.homeButton} onPress={onBackToTopicDetail}>
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text style={styles.homeButtonText}>Trở về Chủ đề</Text>
      </Pressable>
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
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  exerciseIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}1A`,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  exerciseSubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
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
