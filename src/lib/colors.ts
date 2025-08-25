/**
 * 为分类生成基于ID的颜色
 */
export const generateCategoryColor = (id: number): string => {
  const colors = [
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#F43F5E'  // rose-500
  ];
  return colors[id % colors.length];
};

/**
 * 为标签生成基于ID的颜色
 */
export const generateTagColor = (id: number): string => {
  const colors = [
    '#60A5FA', // blue-400
    '#A78BFA', // violet-400
    '#F87171', // red-400
    '#34D399', // emerald-400
    '#FBBF24', // amber-400
    '#F472B6', // pink-400
    '#22D3EE', // cyan-400
    '#A3E635', // lime-400
    '#FB923C', // orange-400
    '#818CF8', // indigo-400
    '#2DD4BF', // teal-400
    '#FB7185'  // rose-400
  ];
  return colors[id % colors.length];
};