import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TopicDetailScreen, { TopicMenuKey } from './src/screens/TopicDetailScreen';
import FlashCardScreen, { FlashCardAction } from './src/screens/FlashCardScreen';
import FlashCardStudyScreen from './src/screens/FlashCardStudyScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import { seedDefaultUser } from './src/storage/userStorage';
import { topics } from './src/data/topics';
import { WordGroup } from './src/data/wordGroups';

type Screen = 'login' | 'register' | 'home' | 'topicDetail' | 'flashCard' | 'flashCardStudy' | 'placeholderSuccess';
type SuccessReturnTo = 'topicDetail' | 'flashCard';

const MENU_LABELS: Record<TopicMenuKey, string> = {
  flashcard: 'Flash Card',
  grammar: 'Ngữ Pháp',
  practice: 'Luyện Tập',
  quiz: 'Kiểm tra',
};

const FLASH_CARD_ACTION_LABELS: Record<FlashCardAction, string> = {
  random: 'Dò bài ngẫu nhiên',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [fullName, setFullName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [placeholderSubtitle, setPlaceholderSubtitle] = useState('');
  const [successReturnTo, setSuccessReturnTo] = useState<SuccessReturnTo>('topicDetail');
  const [selectedGroup, setSelectedGroup] = useState<WordGroup | null>(null);

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
            setPlaceholderSubtitle(`${selectedTopic} · ${MENU_LABELS[menuKey]}`);
            setSuccessReturnTo('topicDetail');
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
          onSelectAction={(action) => {
            setPlaceholderSubtitle(`${selectedTopic} · ${FLASH_CARD_ACTION_LABELS[action]}`);
            setSuccessReturnTo('flashCard');
            setScreen('placeholderSuccess');
          }}
          onSelectGroup={(group) => {
            setSelectedGroup(group);
            setScreen('flashCardStudy');
          }}
          onBackToHome={() => setScreen('home')}
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
      {screen === 'placeholderSuccess' && (
        <SuccessScreen
          subtitle={placeholderSubtitle}
          backLabel={successReturnTo === 'flashCard' ? 'Quay lại Flash Card' : 'Quay lại chủ đề'}
          onBack={() => setScreen(successReturnTo)}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
