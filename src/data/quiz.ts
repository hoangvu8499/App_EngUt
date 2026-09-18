import rawQuiz from '../../data/Quiz.json';
import type { ExtraVocabularyItem } from './practice';

export type QuizSentence = {
  vietnamese: string;
  english: string;
  extraVocabulary?: ExtraVocabularyItem[];
};

export type TopicQuiz = {
  topic: string;
  sentences: QuizSentence[];
};

export const topicQuizzes: TopicQuiz[] = rawQuiz as TopicQuiz[];

export function getTopicQuiz(topicName: string): TopicQuiz | undefined {
  return topicQuizzes.find((item) => item.topic === topicName);
}
