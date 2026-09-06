const PALETTE = ['#2456A6', '#0E9488', '#D97706', '#7C3AED', '#059669', '#DB2777', '#B45309', '#4F46E5'];

const ICONS: Record<string, number> = {
  'Cơ thể con người': require('../../assets/topics/body.png'),
  'Ngoại hình': require('../../assets/topics/appearance.png'),
  'Tính cách': require('../../assets/topics/personality.png'),
  'Cảm xúc': require('../../assets/topics/emotion.png'),
  'Gia đình': require('../../assets/topics/family.png'),
  'Sở thích': require('../../assets/topics/hobby.png'),
  'Quần áo và thời trang': require('../../assets/topics/clothes.png'),
  'Mua sắm': require('../../assets/topics/shopping.png'),
  'Du lịch': require('../../assets/topics/travel.png'),
  'Trường học': require('../../assets/topics/school.png'),
  'Bạn bè': require('../../assets/topics/friends.png'),
  'Thời tiết': require('../../assets/topics/weather.png'),
  'Môi trường': require('../../assets/topics/environment.png'),
  'Con vật nuôi': require('../../assets/topics/pet.png'),
  'Món ăn và thực phẩm': require('../../assets/topics/food.png'),
  'Thức uống': require('../../assets/topics/drink.png'),
  'Màu sắc': require('../../assets/topics/colors.png'),
  'Công việc và nghề nghiệp': require('../../assets/topics/job.png'),
  'Kinh doanh': require('../../assets/topics/business.png'),
  'Chào hỏi và giới thiệu bản thân': require('../../assets/topics/greeting.png'),
  'Nghệ thuật': require('../../assets/topics/art.png'),
  'Máy tính và Internet': require('../../assets/topics/computer.png'),
  'Sức khỏe và y tế': require('../../assets/topics/health.png'),
  'Điện thoại và thư tín': require('../../assets/topics/phone.png'),
  'Truyền hình và báo chí': require('../../assets/topics/tv.png'),
};

export function getTopicVisual(topicName: string, index: number): { icon: number; color: string } {
  return {
    icon: ICONS[topicName] ?? require('../../assets/topics/hobby.png'),
    color: PALETTE[index % PALETTE.length],
  };
}
