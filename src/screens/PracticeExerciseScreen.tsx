import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { getProgressPercent } from '../data/progress';
import type { PracticeSentence } from '../data/practice';
import AppHeaderCard from '../components/AppHeaderCard';

type Props = {
  fullName: string;
  topicName: string;
  exerciseTitle: string;
  sentences: PracticeSentence[];
  onBackToPractice: () => void;
  onLogout: () => void;
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/g, '');
}

export default function PracticeExerciseScreen({
  fullName,
  topicName,
  exerciseTitle,
  sentences,
  onBackToPractice,
  onLogout,
}: Props) {
  const progressPercent = getProgressPercent();
  const [answers, setAnswers] = useState<string[]>(() => sentences.map(() => ''));
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const handleAnswerChange = (index: number, value: string) => {
    setError(null);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRetry = () => {
    setAnswers(sentences.map(() => ''));
    setError(null);
    setSubmitted(false);
    setCorrectCount(0);
  };

  const handleSubmit = () => {
    if (answers.some((answer) => answer.trim() === '')) {
      setError('Phải hoàn thành hết các câu.');
      return;
    }
    const correct = sentences.reduce(
      (count, sentence, index) => count + (normalize(answers[index]) === normalize(sentence.english) ? 1 : 0),
      0
    );
    setCorrectCount(correct);
    setError(null);
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.listContent}>
          <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

          <View style={styles.breadcrumbRow}>
            <Ionicons name="create-outline" size={14} color={colors.textMuted} />
            <Text style={styles.breadcrumbText}>{topicName.toUpperCase()} · LUYỆN TẬP</Text>
          </View>
          <Text style={styles.title}>{exerciseTitle}</Text>

          {submitted ? (
            <Text style={styles.resultText}>
              Kết quả: {correctCount}/{sentences.length} câu đúng
            </Text>
          ) : (
            <Text style={styles.instructionText}>Dịch các câu sau sang tiếng Anh.</Text>
          )}

          {sentences.map((sentence, index) => {
            const isCorrect = submitted && normalize(answers[index]) === normalize(sentence.english);
            return (
              <View key={index} style={styles.sentenceCard}>
                <Text style={styles.vietnameseText}>
                  {index + 1}. {sentence.vietnamese}
                </Text>
                {sentence.extraVocabulary && sentence.extraVocabulary.length > 0 ? (
                  <Text style={styles.hintText}>
                    Gợi ý từ vựng:{' '}
                    {sentence.extraVocabulary.map((item, i) => (
                      <Text key={item.word}>
                        {item.word} ({item.meaning})
                        {i < sentence.extraVocabulary!.length - 1 ? ', ' : ''}
                      </Text>
                    ))}
                  </Text>
                ) : null}
                <TextInput
                  style={[
                    styles.answerInput,
                    submitted ? (isCorrect ? styles.answerCorrect : styles.answerWrong) : null,
                  ]}
                  placeholder="Nhập câu tiếng Anh"
                  placeholderTextColor={colors.placeholder}
                  value={answers[index]}
                  onChangeText={(value) => handleAnswerChange(index, value)}
                  editable={!submitted}
                  multiline
                />
                {submitted && !isCorrect ? (
                  <Text style={styles.correctAnswerText}>Đáp án đúng: {sentence.english}</Text>
                ) : null}
              </View>
            );
          })}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {submitted ? (
            <Pressable style={styles.submitButton} onPress={handleRetry}>
              <Text style={styles.submitButtonText}>Làm lại</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Nộp bài</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Pressable style={styles.homeButton} onPress={onBackToPractice}>
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text style={styles.homeButtonText}>Trở về Luyện Tập</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 14,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 14,
  },
  sentenceCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  vietnameseText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  hintText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginBottom: 10,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
  },
  answerCorrect: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}14`,
  },
  answerWrong: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}14`,
  },
  correctAnswerText: {
    fontSize: 12.5,
    color: colors.error,
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
