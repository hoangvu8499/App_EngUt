import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TopicDetailScreen, { TopicMenuKey } from './src/screens/TopicDetailScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import { seedDefaultUser } from './src/storage/userStorage';

type Screen = 'login' | 'register' | 'home' | 'topicDetail' | 'menuSuccess';

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
  const [selectedMenuKey, setSelectedMenuKey] = useState<TopicMenuKey>('flashcard');

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
            setSelectedMenuKey(menuKey);
            setScreen('menuSuccess');
          }}
          onBackToHome={() => setScreen('home')}
          onLogout={() => setScreen('login')}
        />
      )}
      {screen === 'menuSuccess' && (
        <SuccessScreen
          subtitle={`${selectedTopic} · ${MENU_LABELS[selectedMenuKey]}`}
          backLabel="Quay lại chủ đề"
          onBack={() => setScreen('topicDetail')}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
