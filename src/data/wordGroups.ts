export const MIN_GROUP_SIZE = 5;
export const MAX_GROUP_SIZE = 10;
export const FINAL_GROUP_THRESHOLD = 10;
export const FINAL_GROUP_NAME = 'Nhóm cuối';

export const GROUP_COLOR_PALETTE = ['#2E8B57', '#D64545', '#2456A6', '#D97706', '#7C3AED'];

export type WordGroup = {
  id: string;
  name: string;
  wordIndices: number[];
  color: string;
};

export function validateNewGroup(
  name: string,
  existingGroups: WordGroup[],
  selectedCount: number
): string | null {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Vui lòng nhập tên nhóm.';
  }

  const normalizedName = trimmedName.toLowerCase();
  if (existingGroups.some((group) => group.name.trim().toLowerCase() === normalizedName)) {
    return 'Tên nhóm đã tồn tại, vui lòng chọn tên khác.';
  }

  if (selectedCount < MIN_GROUP_SIZE || selectedCount > MAX_GROUP_SIZE) {
    return `Vui lòng chọn từ ${MIN_GROUP_SIZE} đến ${MAX_GROUP_SIZE} từ.`;
  }

  return null;
}
