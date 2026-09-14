import rawGrammar from '../../data/Grammar.json';

export type GrammarStructureRow = {
  label: string;
  formula: string;
};

export type GrammarExample = {
  sentenceEng: string;
  sentenceMeaning: string;
};

export type GrammarLesson = {
  topic: string;
  title: string;
  titleEnglish: string;
  usage: string[];
  structure: GrammarStructureRow[];
  signalWords: string;
  examples: GrammarExample[];
};

export const grammarLessons: GrammarLesson[] = rawGrammar as GrammarLesson[];

export function getGrammarLesson(topicName: string): GrammarLesson | undefined {
  return grammarLessons.find((lesson) => lesson.topic === topicName);
}
