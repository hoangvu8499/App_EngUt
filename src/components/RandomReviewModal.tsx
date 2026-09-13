import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { colors } from '../theme/colors';
import type { VocabularyItem } from '../data/topics';

const QUIZ_SIZE = 10;

type QuizMode = 'meaning' | 'audio';

type QuizItem = {
  word: VocabularyItem;
  mode: QuizMode;
};

type Props = {
  visible: boolean;
  words: VocabularyItem[];
  onClose: () => void;
};

function buildQuiz(words: VocabularyItem[]): QuizItem[] {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(QUIZ_SIZE, shuffled.length)).map((word) => ({
    word,
    mode: Math.random() < 0.5 ? 'meaning' : 'audio',
  }));
}

export default function RandomReviewModal({ visible, words, onClose }: Props) {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const startNewQuiz = () => {
    const next = buildQuiz(words);
    setQuiz(next);
    setAnswers(next.map(() => ''));
    setError(null);
    setSubmitted(false);
    setCorrectCount(0);
  };

  useEffect(() => {
    if (visible) {
      startNewQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleSpeak = (word: VocabularyItem) => {
    Speech.speak(word.vocabulary, {
      language: 'en-US',
      onError: (error) => Alert.alert('Không thể phát âm', error.message),
    });
  };

  const handleAnswerChange = (index: number, value: string) => {
    setError(null);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (answers.some((answer) => answer.trim() === '')) {
      setError('Phải hoàn thành hết các từ.');
      return;
    }
    const correct = quiz.reduce(
      (count, item, index) =>
        count + (answers[index].trim().toLowerCase() === item.word.vocabulary.trim().toLowerCase() ? 1 : 0),
      0
    );
    setCorrectCount(correct);
    setError(null);
    setSubmitted(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Dò bài ngẫu nhiên</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          {submitted ? (
            <Text style={styles.resultText}>
              Kết quả: {correctCount}/{quiz.length} từ đúng
            </Text>
          ) : (
            <Text style={styles.instructionText}>Nhập từ tiếng Anh phù hợp với mỗi gợi ý bên dưới.</Text>
          )}

          <ScrollView style={styles.list}>
            {quiz.length === 0 ? (
              <Text style={styles.emptyText}>Chủ đề này chưa có từ nào.</Text>
            ) : (
              quiz.map((item, index) => {
                const isCorrect =
                  submitted &&
                  answers[index].trim().toLowerCase() === item.word.vocabulary.trim().toLowerCase();
                return (
                  <View key={`${item.word.vocabulary}-${index}`} style={styles.quizRow}>
                    <View style={styles.quizPrompt}>
                      <Text style={styles.quizIndex}>{index + 1}.</Text>
                      {item.mode === 'meaning' ? (
                        <Text style={styles.promptText} numberOfLines={2}>
                          {item.word.meaning}
                        </Text>
                      ) : (
                        <Pressable
                          style={styles.speakerButton}
                          onPress={() => handleSpeak(item.word)}
                          hitSlop={8}
                        >
                          <Ionicons name="volume-high" size={18} color={colors.primary} />
                          <Text style={styles.speakerText}>Nghe phát âm</Text>
                        </Pressable>
                      )}
                    </View>
                    <TextInput
                      style={[
                        styles.answerInput,
                        submitted ? (isCorrect ? styles.answerCorrect : styles.answerWrong) : null,
                      ]}
                      placeholder="Nhập từ tiếng Anh"
                      placeholderTextColor={colors.placeholder}
                      value={answers[index]}
                      onChangeText={(value) => handleAnswerChange(index, value)}
                      editable={!submitted}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {submitted && !isCorrect ? (
                      <Text style={styles.correctAnswerText}>Đáp án đúng: {item.word.vocabulary}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {submitted ? (
            <Pressable style={styles.submitButton} onPress={startNewQuiz}>
              <Text style={styles.submitButtonText}>Làm lại</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Hoàn Thành</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 41, 77, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  instructionText: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  list: {
    marginBottom: 8,
  },
  quizRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  quizPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  quizIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  promptText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.text,
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  speakerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
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
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 20,
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
