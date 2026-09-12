import { useRef, useState } from 'react';
import { Alert, Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { colors } from '../theme/colors';
import { getProgressPercent } from '../data/progress';
import type { VocabularyItem } from '../data/topics';
import AppHeaderCard from '../components/AppHeaderCard';

type Direction = 'EN_VN' | 'VN_EN';

type Props = {
  fullName: string;
  topicName: string;
  groupName: string;
  groupColor: string;
  words: VocabularyItem[];
  onBackToFlashCard: () => void;
  onLogout: () => void;
};

function sequentialOrder(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

function shuffledOrder(count: number): number[] {
  const arr = sequentialOrder(count);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SWIPE_THRESHOLD = 60;
const TAP_TOLERANCE = 12;

export default function FlashCardStudyScreen({
  fullName,
  topicName,
  groupName,
  groupColor,
  words,
  onBackToFlashCard,
  onLogout,
}: Props) {
  const progressPercent = getProgressPercent();
  const [order, setOrder] = useState<number[]>(() => sequentialOrder(words.length));
  const [shuffled, setShuffled] = useState(false);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState<Direction>('EN_VN');
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const word = words[order[position]];

  const resetFlip = () => {
    setFlipped(false);
    flipAnim.setValue(0);
  };

  const goTo = (nextPosition: number) => {
    if (nextPosition < 0 || nextPosition >= words.length || !word) return;
    setPosition(nextPosition);
    resetFlip();
  };

  const toggleShuffle = () => {
    if (shuffled) {
      setOrder(sequentialOrder(words.length));
      setShuffled(false);
    } else {
      setOrder(shuffledOrder(words.length));
      setShuffled(true);
    }
    setPosition(0);
    resetFlip();
  };

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setFlipped((prev) => !prev);
  };

  const handleSpeak = () => {
    if (word) {
      Speech.speak(word.vocabulary, {
        language: 'en-US',
        onError: (error) => Alert.alert('Không thể phát âm', error.message),
      });
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 15 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < TAP_TOLERANCE && Math.abs(gesture.dy) < TAP_TOLERANCE) {
        handleFlip();
      } else if (gesture.dx > SWIPE_THRESHOLD) {
        goTo(position + 1);
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        goTo(position - 1);
      }
    },
  });

  if (!word) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />
          <Text style={styles.emptyText}>Nhóm từ này không có từ nào.</Text>
        </View>
        <Pressable style={styles.homeButton} onPress={onBackToFlashCard}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Trở về Flash Card</Text>
        </Pressable>
      </View>
    );
  }

  const isEnFront = direction === 'EN_VN';
  const frontTitle = isEnFront ? word.vocabulary : word.meaning;
  const frontSubtitle = isEnFront ? word.transcription : null;
  const backTitle = isEnFront ? word.meaning : word.vocabulary;
  const backSubtitle = isEnFront ? null : word.transcription;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppHeaderCard fullName={fullName} progressPercent={progressPercent} onLogout={onLogout} />

        <View style={styles.breadcrumbRow}>
          <Ionicons name="folder-outline" size={14} color={colors.textMuted} />
          <Text style={styles.breadcrumbText}>{topicName.toUpperCase()}</Text>
        </View>
        <Text style={styles.groupTitle}>{groupName}</Text>

        <View style={styles.cardWrapper} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.cardFace,
              { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
            ]}
          >
            <Pressable style={styles.speakerButton} onPress={handleSpeak} hitSlop={8}>
              <Ionicons name="volume-high" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{frontTitle}</Text>
              {frontSubtitle ? <Text style={styles.cardSubtitle}>/{frontSubtitle}/</Text> : null}
              <Text style={styles.exampleText}>
                Example: {word.sentenceEng}
                {'\n'}---&gt; {word.sentenceMeaning}
              </Text>
            </View>
            <View style={[styles.cardFooter, { backgroundColor: `${groupColor}33` }]} />
          </Animated.View>

          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
            ]}
          >
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{backTitle}</Text>
              {backSubtitle ? <Text style={styles.cardSubtitle}>/{backSubtitle}/</Text> : null}
            </View>
            <View style={[styles.cardFooter, { backgroundColor: `${groupColor}33` }]} />
          </Animated.View>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.directionButton, direction === 'EN_VN' && styles.directionButtonActive]}
            onPress={() => {
              setDirection('EN_VN');
              resetFlip();
            }}
          >
            <Text style={[styles.directionText, direction === 'EN_VN' && styles.directionTextActive]}>EN - VN</Text>
          </Pressable>
          <Pressable
            style={[styles.directionButton, direction === 'VN_EN' && styles.directionButtonActive]}
            onPress={() => {
              setDirection('VN_EN');
              resetFlip();
            }}
          >
            <Text style={[styles.directionText, direction === 'VN_EN' && styles.directionTextActive]}>VN - EN</Text>
          </Pressable>
          <Text style={styles.positionText}>
            {position + 1} / {words.length}
          </Text>
          <Pressable style={[styles.shuffleButton, shuffled && styles.shuffleButtonActive]} onPress={toggleShuffle}>
            <Ionicons name="shuffle" size={20} color={shuffled ? '#FFFFFF' : colors.primary} />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.homeButton} onPress={onBackToFlashCard}>
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text style={styles.homeButtonText}>Trở về Flash Card</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  cardWrapper: {
    height: 320,
    marginBottom: 18,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardBack: {
    justifyContent: 'center',
  },
  speakerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    zIndex: 2,
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 22,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.textMuted,
  },
  exampleText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  cardFooter: {
    height: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  directionButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  directionButtonActive: {
    backgroundColor: colors.primary,
  },
  directionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  directionTextActive: {
    color: '#FFFFFF',
  },
  positionText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  shuffleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffleButtonActive: {
    backgroundColor: colors.primary,
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
