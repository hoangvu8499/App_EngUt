import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

type Props = {
  fullName: string;
  progressPercent: number;
  onLogout: () => void;
};

export default function AppHeaderCard({ fullName, progressPercent, onLogout }: Props) {
  return (
    <View style={styles.headerCard}>
      <Image source={require('../../design/logo-tron.jpg')} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerText}>
        <Text style={styles.greeting}>
          Xin chào, <Text style={styles.greetingName}>{fullName}</Text>!
        </Text>
        <Text style={styles.progressLabel}>Tiến độ học tập: {progressPercent}% hoàn thành</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
      <Pressable style={styles.logoutButton} onPress={onLogout} hitSlop={8}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.logoBackground,
  },
  headerText: {
    flex: 1,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  greeting: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  greetingName: {
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 6,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});
