import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  subtitle?: string;
  backLabel: string;
  onBack: () => void;
};

export default function SuccessScreen({ subtitle, backLabel, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.success}>SUCCESS</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>{backLabel}</Text>
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
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
