import { useState } from 'react';
import {
  Alert,
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
import * as Speech from 'expo-speech';

import { colors } from '../theme/colors';
import { useProgressPercent, isTopicPassed, markTopicPassed } from '../data/progress';
import { topics, VocabularyItem } from '../data/topics';
import { getTopicQuiz, QuizSentence } from '../data/quiz';
import { shuffledSlice } from '../utils/shuffle';
import AppHeaderCard from '../components/AppHeaderCard';

const VOCAB_QUIZ_SIZE = 5;
const SENTENCE_QUIZ_SIZE = 5;

type VocabMode = 'meaning' | 'audio';

type VocabItem = {
  word: VocabularyItem;
  mode: VocabMode;
};

type Props = {
  fullName: string;
  topicName: string;
  onBackToTopicDetail: () => void;
  onLogout: () => void;
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/g, '');
}

function buildVocabQuiz(words: VocabularyItem[]): VocabItem[] {
  return shuffledSlice(words, VOCAB_QUIZ_SIZE).map((word) => ({
    word,
    mode: Math.random() < 0.5 ? 'meaning' : 'audio',
  }));
}

export default function QuizScreen({ fullName, topicName, onBackToTopicDetail, onLogout }: Props) {
  const progressPercent = useProgressPercent();
  const vocabularies = topics.find((item) => item.topic === topicName)?.vocabularies ?? [];
  const sentenceBank = getTopicQuiz(topicName)?.sentences ?? [];
  const alreadyPassed = isTopicPassed(topicName);

  const [vocabQuiz, setVocabQuiz] = useState<VocabItem[]>(() => buildVocabQuiz(vocabularies));
  const [sentenceQuiz, setSentenceQuiz] = useState<QuizSentence[]>(() =>
    shuffledSlice(sentenceBank, SENTENCE_QUIZ_SIZE)
  );
  const [vocabAnswers, setVocabAnswers] = useState<string[]>(() => vocabQuiz.map(() => ''));
  const [sentenceAnswers, setSentenceAnswers] = useState<string[]>(() => sentenceQuiz.map(() => ''));
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [vocabCorrectCount, setVocabCorrectCount] = useState(0);
  const [sentenceCorrectCount, setSentenceCorrectCount] = useState(0);
  const [passed, setPassed] = useState(false);

  const handleRetry = () => {
    const nextVocab = buildVocabQuiz(vocabularies);
    const nextSentences = shuffledSlice(sentenceBank, SENTENCE_QUIZ_SIZE);
    setVocabQuiz(nextVocab);
    setSentenceQuiz(nextSentences);
    setVocabAnswers(nextVocab.map(() => ''));
    setSentenceAnswers(nextSentences.map(() => ''));
    setError(null);
    setSubmitted(false);
    setVocabCorrectCount(0);
    setSentenceCorrectCount(0);
    setPassed(false);
  };

  const handleSpeak = (word: VocabularyItem) => {
    Speech.speak(word.vocabulary, {
      language: 'en-US',
      onError: (speechError) => Alert.alert('Không thể phát âm', speechError.message),
    });
  };

  const handleVocabAnswerChange = (index: number, value: string) => {
    setError(null);
    setVocabAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSentenceAnswerChange = (index: number, value: string) => {
    setError(null);
    setSentenceAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (
      vocabAnswers.some((answer) => answer.trim() === '') ||
      sentenceAnswers.some((answer) => answer.trim() === '')
    ) {
      setError('Phải hoàn thành hết các câu hỏi.');
      return;
    }

    const vocabCorrect = vocabQuiz.reduce(
      (count, item, index) =>
        count + (vocabAnswers[index].trim().toLowerCase() === item.word.vocabulary.trim().toLowerCase() ? 1 : 0),
      0
    );
    const sentenceCorrect = sentenceQuiz.reduce(
      (count, sentence, index) =>
        count + (normalize(sentenceAnswers[index]) === normalize(sentence.english) ? 1 : 0),
      0
    );

    const isPassed =
      vocabQuiz.length > 0 &&
      sentenceQuiz.length > 0 &&
      vocabCorrect === vocabQuiz.length &&
      sentenceCorrect === sentenceQuiz.length;

    setVocabCorrectCount(vocabCorrect);
    setSentenceCorrectCount(sentenceCorrect);
    setPassed(isPassed);
    setError(null);
    setSubmitted(true);

    if (isPassed) {
      markTopicPassed(topicName);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.listContent}>
          <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

          <View style={styles.breadcrumbRow}>
            <Ionicons name="ribbon-outline" size={14} color={colors.textMuted} />
            <Text style={styles.breadcrumbText}>{topicName.toUpperCase()} · KIỂM TRA</Text>
          </View>
          <Text style={styles.title}>Bài kiểm tra chủ đề</Text>
          <Text style={styles.instructionText}>
            Trả lời đúng cả {VOCAB_QUIZ_SIZE} từ vựng và dịch đúng cả {SENTENCE_QUIZ_SIZE} câu để đạt yêu cầu.
          </Text>
          {alreadyPassed && !submitted ? (
            <View style={styles.passedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.passedBannerText}>Bạn đã hoàn thành bài kiểm tra chủ đề này.</Text>
            </View>
          ) : null}

          {submitted ? (
            <View style={[styles.resultBanner, passed ? styles.resultBannerPass : styles.resultBannerFail]}>
              <Ionicons
                name={passed ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={passed ? colors.success : colors.error}
              />
              <Text style={[styles.resultBannerText, { color: passed ? colors.success : colors.error }]}>
                {passed
                  ? `Đạt yêu cầu! Từ vựng ${vocabCorrectCount}/${vocabQuiz.length} · Câu dịch ${sentenceCorrectCount}/${sentenceQuiz.length} · +4% tiến độ.`
                  : `Chưa đạt yêu cầu. Từ vựng ${vocabCorrectCount}/${vocabQuiz.length} · Câu dịch ${sentenceCorrectCount}/${sentenceQuiz.length}.`}
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Phần 1 · Từ vựng ({vocabQuiz.length} từ)</Text>
          {vocabQuiz.length === 0 ? (
            <Text style={styles.emptyText}>Chủ đề này chưa có từ vựng.</Text>
          ) : (
            vocabQuiz.map((item, index) => {
              const isCorrect =
                submitted &&
                vocabAnswers[index].trim().toLowerCase() === item.word.vocabulary.trim().toLowerCase();
              return (
                <View key={`${item.word.vocabulary}-${index}`} style={styles.itemCard}>
                  <View style={styles.promptRow}>
                    <Text style={styles.itemIndex}>{index + 1}.</Text>
                    {item.mode === 'meaning' ? (
                      <Text style={styles.promptText} numberOfLines={2}>
                        {item.word.meaning}
                      </Text>
                    ) : (
                      <Pressable style={styles.speakerButton} onPress={() => handleSpeak(item.word)} hitSlop={8}>
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
                    value={vocabAnswers[index]}
                    onChangeText={(value) => handleVocabAnswerChange(index, value)}
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

          <Text style={styles.sectionTitle}>Phần 2 · Dịch câu ({sentenceQuiz.length} câu)</Text>
          {sentenceQuiz.length === 0 ? (
            <Text style={styles.emptyText}>Chủ đề này chưa có câu kiểm tra.</Text>
          ) : (
            sentenceQuiz.map((sentence, index) => {
              const isCorrect = submitted && normalize(sentenceAnswers[index]) === normalize(sentence.english);
              return (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.vietnameseText}>
                    {index + 1}. {sentence.vietnamese}
                  </Text>
                  {sentence.extraVocabulary && sentence.extraVocabulary.length > 0 ? (
                    <Text style={styles.hintText}>
                      Gợi ý từ vựng:{' '}
                      {sentence.extraVocabulary.map((extra, i) => (
                        <Text key={extra.word}>
                          {extra.word} ({extra.meaning})
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
                    value={sentenceAnswers[index]}
                    onChangeText={(value) => handleSentenceAnswerChange(index, value)}
                    editable={!submitted}
                    multiline
                  />
                  {submitted && !isCorrect ? (
                    <Text style={styles.correctAnswerText}>Đáp án đúng: {sentence.english}</Text>
                  ) : null}
                </View>
              );
            })
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {submitted ? (
            <Pressable style={styles.submitButton} onPress={handleRetry}>
              <Text style={styles.submitButtonText}>Làm lại</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Nộp bài kiểm tra</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
    marginBottom: 12,
  },
  passedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.success}14`,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  passedBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.success,
    flex: 1,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  resultBannerPass: {
    backgroundColor: `${colors.success}14`,
  },
  resultBannerFail: {
    backgroundColor: `${colors.error}14`,
  },
  resultBannerText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 14,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemIndex: {
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
