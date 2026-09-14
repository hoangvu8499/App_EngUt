import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { getProgressPercent } from '../data/progress';
import { getGrammarLesson } from '../data/grammar';
import AppHeaderCard from '../components/AppHeaderCard';

type Props = {
  fullName: string;
  topicName: string;
  onBackToTopicDetail: () => void;
  onLogout: () => void;
};

export default function GrammarScreen({ fullName, topicName, onBackToTopicDetail, onLogout }: Props) {
  const progressPercent = getProgressPercent();
  const lesson = getGrammarLesson(topicName);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

        <View style={styles.breadcrumbRow}>
          <Ionicons name="book-outline" size={14} color={colors.textMuted} />
          <Text style={styles.breadcrumbText}>{topicName.toUpperCase()} · NGỮ PHÁP</Text>
        </View>

        {lesson ? (
          <>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.titleEnglish}>{lesson.titleEnglish}</Text>

            <Text style={styles.sectionTitle}>Cách dùng</Text>
            <View style={styles.card}>
              {lesson.usage.map((line, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Cấu trúc</Text>
            <View style={styles.card}>
              {lesson.structure.map((row, index) => (
                <View
                  key={index}
                  style={[styles.structureRow, index === lesson.structure.length - 1 && styles.structureRowLast]}
                >
                  <Text style={styles.structureLabel}>{row.label}</Text>
                  <Text style={styles.structureFormula}>{row.formula}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Dấu hiệu nhận biết</Text>
            <View style={styles.card}>
              <Text style={styles.signalText}>{lesson.signalWords}</Text>
            </View>

            <Text style={styles.sectionTitle}>5 câu ví dụ</Text>
            {lesson.examples.map((example, index) => (
              <View key={index} style={styles.exampleCard}>
                <Text style={styles.exampleEng}>
                  {index + 1}. {example.sentenceEng}
                </Text>
                <Text style={styles.exampleMeaning}>→ {example.sentenceMeaning}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyText}>Chưa có bài học ngữ pháp cho chủ đề này.</Text>
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  titleEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: colors.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  structureRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  structureRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  structureLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  structureFormula: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  signalText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  exampleCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  exampleEng: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  exampleMeaning: {
    fontSize: 13.5,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
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
