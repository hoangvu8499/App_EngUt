import { useState } from 'react';
import {
  Alert,
  Image,
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

import { colors } from '../theme/colors';
import { findUserByLogin } from '../storage/userStorage';

type Props = {
  onNavigateToRegister: () => void;
  onLoginSuccess: (fullName: string) => void;
};

export default function LoginScreen({ onNavigateToRegister, onLoginSuccess }: Props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!login.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập/email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await findUserByLogin(login);
      if (!user || user.password !== password) {
        setError('Tên đăng nhập/email hoặc mật khẩu không đúng.');
        return;
      }
      onLoginSuccess(user.fullName);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image
          source={require('../../design/logo-tron.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcome}>
          Chào mừng bạn đến với <Text style={styles.welcomeBrand}>EngUt!</Text>
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập hoặc Email"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            value={login}
            onChangeText={(value) => {
              setLogin(value);
              setError(null);
            }}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError(null);
            }}
          />
          <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.placeholder}
            />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={styles.forgotPassword}
          onPress={() => Alert.alert('Thông báo', 'Tính năng này chưa khả dụng.')}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
          onPress={handleLogin}
          disabled={submitting}
        >
          <Text style={styles.loginButtonText}>{submitting ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}</Text>
        </Pressable>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Pressable onPress={onNavigateToRegister}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
    backgroundColor: colors.logoBackground,
    borderRadius: 16,
  },
  welcome: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  welcomeBrand: {
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: colors.card,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  errorText: {
    width: '100%',
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: colors.text,
  },
  loginButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: 'row',
  },
  registerText: {
    fontSize: 13,
    color: colors.text,
  },
  registerLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
