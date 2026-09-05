import { useState } from 'react';
import {
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
import { isUsernameOrEmailTaken, registerUser } from '../storage/userStorage';

type Props = {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = 'fullName' | 'username' | 'email' | 'password' | 'confirmPassword';

type FormState = Record<FieldKey, string>;

const FIELD_LABELS: Record<FieldKey, string> = {
  fullName: 'Họ và tên',
  username: 'Tên đăng nhập',
  email: 'Email',
  password: 'Mật khẩu',
  confirmPassword: 'Xác nhận mật khẩu',
};

export default function RegisterScreen({ onNavigateToLogin, onRegisterSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: FieldKey) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validate = (): string | null => {
    const requiredKeys: FieldKey[] = ['fullName', 'username', 'email', 'password', 'confirmPassword'];
    for (const key of requiredKeys) {
      if (!form[key].trim()) {
        return `Vui lòng nhập ${FIELD_LABELS[key]}.`;
      }
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      return 'Email không hợp lệ.';
    }
    if (form.password.length <= 8) {
      return 'Mật khẩu phải có nhiều hơn 8 ký tự.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Xác nhận mật khẩu không khớp.';
    }
    return null;
  };

  const handleRegister = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const taken = await isUsernameOrEmailTaken(form.username, form.email);
      if (taken) {
        setError('Tên đăng nhập hoặc Email đã được sử dụng.');
        return;
      }

      await registerUser({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      onRegisterSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          Tạo tài khoản <Text style={styles.titleBrand}>EngUt</Text>
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor={colors.placeholder}
            value={form.fullName}
            onChangeText={setField('fullName')}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="at-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            value={form.username}
            onChangeText={setField('username')}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={form.email}
            onChangeText={setField('email')}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu (hơn 8 ký tự)"
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={setField('password')}
          />
          <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.placeholder}
            />
          </Pressable>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!showConfirmPassword}
            value={form.confirmPassword}
            onChangeText={setField('confirmPassword')}
          />
          <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)} hitSlop={8}>
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.placeholder}
            />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.registerButton, pressed && styles.registerButtonPressed]}
          onPress={handleRegister}
          disabled={submitting}
        >
          <Text style={styles.registerButtonText}>{submitting ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}</Text>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <Pressable onPress={onNavigateToLogin}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
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
  title: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 24,
    fontWeight: '600',
  },
  titleBrand: {
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
  registerButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  registerButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
  },
  loginText: {
    fontSize: 13,
    color: colors.text,
  },
  loginLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
