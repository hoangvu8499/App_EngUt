import rawPractice from '../../data/Practice.json';

export type ExtraVocabularyItem = {
  word: string;
  meaning: string;
};

export type PracticeSentence = {
  vietnamese: string;
  english: string;
  extraVocabulary?: ExtraVocabularyItem[];
};

export type PracticeExercise = {
  title: string;
  sentences: PracticeSentence[];
};

export type TopicPractice = {
  topic: string;
  exercises: PracticeExercise[];
};

export const practiceTopics: TopicPractice[] = rawPractice as TopicPractice[];

export function getTopicPractice(topicName: string): TopicPractice | undefined {
  return practiceTopics.find((item) => item.topic === topicName);
}
