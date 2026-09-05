import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  fullName: string;
  onLogout: () => void;
};

export default function SuccessScreen({ fullName, onLogout }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.success}>SUCCESS</Text>
      <Text style={styles.subtitle}>Xin chào, {fullName}!</Text>
      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  success: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
