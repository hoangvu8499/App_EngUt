import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { MAX_GROUP_SIZE, MIN_GROUP_SIZE, WordGroup, validateNewGroup } from '../data/wordGroups';
import type { VocabularyItem } from '../data/topics';

export type UngroupedWord = VocabularyItem & { index: number };

type Props = {
  visible: boolean;
  words: UngroupedWord[];
  existingGroups: WordGroup[];
  onClose: () => void;
  onConfirm: (groupName: string, selectedIndices: number[]) => void;
};

export default function CreateGroupModal({ visible, words, existingGroups, onClose, onConfirm }: Props) {
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setGroupName('');
    setSelected(new Set());
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleWord = (index: number) => {
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const validationError = validateNewGroup(groupName, existingGroups, selected.size);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(groupName.trim(), Array.from(selected));
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Tạo nhóm từ mới</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Tên nhóm (bắt buộc)"
            placeholderTextColor={colors.placeholder}
            value={groupName}
            onChangeText={(value) => {
              setGroupName(value);
              setError(null);
            }}
          />

          <Text style={styles.selectedCount}>
            Đã chọn {selected.size} từ (tối thiểu {MIN_GROUP_SIZE}, tối đa {MAX_GROUP_SIZE})
          </Text>

          <FlatList
            data={words}
            keyExtractor={(item) => String(item.index)}
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = selected.has(item.index);
              return (
                <Pressable style={styles.wordRow} onPress={() => toggleWord(item.index)}>
                  <Text style={styles.wordText} numberOfLines={1}>
                    <Text style={styles.wordEnglish}>{item.vocabulary}: </Text>
                    <Text style={styles.wordTranscription}>{item.transcription}</Text>
                    <Text> - {item.meaning}</Text>
                  </Text>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>Không còn từ nào để chia nhóm.</Text>}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Thêm Từ vào nhóm</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 41, 77, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  selectedCount: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 10,
  },
  list: {
    marginBottom: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  wordText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
  },
  wordEnglish: {
    fontWeight: '700',
    color: colors.text,
  },
  wordTranscription: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
