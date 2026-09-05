import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SuccessScreen from './src/screens/SuccessScreen';

type Screen = 'login' | 'register' | 'success';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [loginBanner, setLoginBanner] = useState<string | null>(null);
  const [loggedInName, setLoggedInName] = useState('');

  return (
    <>
      {screen === 'login' && (
        <LoginScreen
          banner={loginBanner}
          onNavigateToRegister={() => {
            setLoginBanner(null);
            setScreen('register');
          }}
          onLoginSuccess={(fullName) => {
            setLoggedInName(fullName);
            setScreen('success');
          }}
        />
      )}
      {screen === 'register' && (
        <RegisterScreen
          onNavigateToLogin={() => {
            setLoginBanner(null);
            setScreen('login');
          }}
          onRegisterSuccess={() => {
            setLoginBanner('Đăng ký thành công! Vui lòng đăng nhập.');
            setScreen('login');
          }}
        />
      )}
      {screen === 'success' && (
        <SuccessScreen
          fullName={loggedInName}
          onLogout={() => {
            setLoginBanner(null);
            setScreen('login');
          }}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
