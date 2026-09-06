import { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { topics } from '../data/topics';
import { getTopicVisual } from '../data/topicVisuals';
import { getProgressPercent } from '../data/progress';
import AppHeaderCard from '../components/AppHeaderCard';

type Props = {
  fullName: string;
  onSelectTopic: (topicName: string) => void;
  onLogout: () => void;
};

export default function HomeScreen({ fullName, onSelectTopic, onLogout }: Props) {
  const progressPercent = getProgressPercent();

  const cards = useMemo(
    () => topics.map((item, index) => ({ name: item.topic, ...getTopicVisual(item.topic, index) })),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.name}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />
            <Text style={styles.sectionTitle}>Các Chủ đề Cần học ({topics.length})</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onSelectTopic(item.name)}>
            <View style={[styles.iconBadge, { backgroundColor: `${item.color}1A` }]}>
              <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
            </View>
            <Text style={styles.cardLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
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
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    width: '31%',
    minHeight: 96,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 28,
    height: 28,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
