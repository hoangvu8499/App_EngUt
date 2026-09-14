import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TopicDetailScreen, { TopicMenuKey } from './src/screens/TopicDetailScreen';
import FlashCardScreen from './src/screens/FlashCardScreen';
import FlashCardStudyScreen from './src/screens/FlashCardStudyScreen';
import GrammarScreen from './src/screens/GrammarScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import PracticeExerciseScreen from './src/screens/PracticeExerciseScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import { seedDefaultUser } from './src/storage/userStorage';
import { topics } from './src/data/topics';
import { WordGroup } from './src/data/wordGroups';
import { getTopicPractice } from './src/data/practice';

type Screen =
  | 'login'
  | 'register'
  | 'home'
  | 'topicDetail'
  | 'flashCard'
  | 'flashCardStudy'
  | 'grammar'
  | 'practice'
  | 'practiceExercise'
  | 'placeholderSuccess';

const MENU_LABELS: Record<TopicMenuKey, string> = {
  flashcard: 'Flash Card',
  grammar: 'Ngữ Pháp',
  practice: 'Luyện Tập',
  quiz: 'Kiểm tra',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [fullName, setFullName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [placeholderSubtitle, setPlaceholderSubtitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<WordGroup | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);

  useEffect(() => {
    seedDefaultUser();
  }, []);

  return (
    <>
      {screen === 'login' && (
        <LoginScreen
          onNavigateToRegister={() => setScreen('register')}
          onLoginSuccess={(name) => {
            setFullName(name);
            setScreen('home');
          }}
        />
      )}
      {screen === 'register' && (
        <RegisterScreen
          onNavigateToLogin={() => setScreen('login')}
          onRegisterSuccess={(name) => {
            setFullName(name);
            setScreen('home');
          }}
        />
      )}
      {screen === 'home' && (
        <HomeScreen
          fullName={fullName}
          onSelectTopic={(topicName) => {
            setSelectedTopic(topicName);
            setScreen('topicDetail');
          }}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'topicDetail' && (
        <TopicDetailScreen
          fullName={fullName}
          topicName={selectedTopic}
          onSelectMenuItem={(menuKey) => {
            if (menuKey === 'flashcard') {
              setScreen('flashCard');
              return;
            }
            if (menuKey === 'grammar') {
              setScreen('grammar');
              return;
            }
            if (menuKey === 'practice') {
              setScreen('practice');
              return;
            }
            setPlaceholderSubtitle(`${selectedTopic} · ${MENU_LABELS[menuKey]}`);
            setScreen('placeholderSuccess');
          }}
          onBackToHome={() => setScreen('home')}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'flashCard' && (
        <FlashCardScreen
          fullName={fullName}
          topicName={selectedTopic}
          onSelectGroup={(group) => {
            setSelectedGroup(group);
            setScreen('flashCardStudy');
          }}
          onBackToTopicDetail={() => setScreen('topicDetail')}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'flashCardStudy' && selectedGroup && (
        <FlashCardStudyScreen
          fullName={fullName}
          topicName={selectedTopic}
          groupName={selectedGroup.name}
          groupColor={selectedGroup.color}
          words={selectedGroup.wordIndices
            .map((index) => topics.find((item) => item.topic === selectedTopic)?.vocabularies[index])
            .filter((word): word is NonNullable<typeof word> => Boolean(word))}
          onBackToFlashCard={() => setScreen('flashCard')}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'grammar' && (
        <GrammarScreen
          fullName={fullName}
          topicName={selectedTopic}
          onBackToTopicDetail={() => setScreen('topicDetail')}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'practice' && (
        <PracticeScreen
          fullName={fullName}
          topicName={selectedTopic}
          onSelectExercise={(exerciseIndex) => {
            setSelectedExerciseIndex(exerciseIndex);
            setScreen('practiceExercise');
          }}
          onBackToTopicDetail={() => setScreen('topicDetail')}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'practiceExercise' &&
        (() => {
          const exercise = getTopicPractice(selectedTopic)?.exercises[selectedExerciseIndex];
          if (!exercise) return null;
          return (
            <PracticeExerciseScreen
              fullName={fullName}
              topicName={selectedTopic}
              exerciseTitle={exercise.title}
              sentences={exercise.sentences}
              onBackToPractice={() => setScreen('practice')}
              onLogout={() => setScreen('login')}
            />
          );
        })()}
      {screen === 'placeholderSuccess' && (
        <SuccessScreen
          subtitle={placeholderSubtitle}
          backLabel="Quay lại chủ đề"
          onBack={() => setScreen('topicDetail')}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
