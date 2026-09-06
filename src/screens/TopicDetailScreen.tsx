import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { getProgressPercent } from '../data/progress';
import AppHeaderCard from '../components/AppHeaderCard';

export type TopicMenuKey = 'flashcard' | 'grammar' | 'practice' | 'quiz';

type MenuItem = {
  key: TopicMenuKey;
  title: string;
  subtitle: string;
  icon: number;
  accent: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'flashcard',
    title: 'Flash Card',
    subtitle: 'Học từ vựng qua thẻ',
    icon: require('../../assets/menu/flashcard.png'),
    accent: '#D64545',
  },
  {
    key: 'grammar',
    title: 'Ngữ Pháp',
    subtitle: 'Cấu trúc câu & Quy tắc',
    icon: require('../../assets/menu/grammar.png'),
    accent: '#2E8B57',
  },
  {
    key: 'practice',
    title: 'Luyện Tập',
    subtitle: 'Đặt câu với từ liên quan',
    icon: require('../../assets/menu/practice.png'),
    accent: '#7C3AED',
  },
  {
    key: 'quiz',
    title: 'Kiểm tra',
    subtitle: 'Đánh giá kết quả',
    icon: require('../../assets/menu/quiz.png'),
    accent: '#D97706',
  },
];

type Props = {
  fullName: string;
  topicName: string;
  onSelectMenuItem: (item: TopicMenuKey) => void;
  onBackToHome: () => void;
  onLogout: () => void;
};

export default function TopicDetailScreen({ fullName, topicName, onSelectMenuItem, onBackToHome, onLogout }: Props) {
  const progressPercent = getProgressPercent();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

        <Text style={styles.topicTitle}>Chủ đề: {topicName}</Text>

        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.menuCard, { borderColor: item.accent }]}
            onPress={() => onSelectMenuItem(item.key)}
          >
            <View style={[styles.iconBadge, { backgroundColor: `${item.accent}1A` }]}>
              <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.homeButton} onPress={onBackToHome}>
        <Ionicons name="home" size={18} color="#FFFFFF" />
        <Text style={styles.homeButtonText}>Trở về Trang chủ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 28,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
