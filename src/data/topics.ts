import rawTopics from '../../data/Topic_vocabulary.json';

export type VocabularyItem = {
  vocabulary: string;
  transcription: string;
  meaning: string;
  sentenceEng: string;
  sentenceMeaning: string;
};

export type Topic = {
  topic: string;
  vocabularies: VocabularyItem[];
};

export const topics: Topic[] = rawTopics as Topic[];
