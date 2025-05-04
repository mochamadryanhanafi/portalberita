type CategoryColors = Map<string, [string, string]>;

const categoryColors: CategoryColors = new Map([
  ['Politik', ['bg-pink-200 dark:bg-pink-900', 'bg-pink-500/80']],
  ['Ekonomi & Bisnis', ['bg-green-200 dark:bg-green-900', 'bg-green-500/80']],
  ['Teknologi', ['bg-yellow-200 dark:bg-yellow-900', 'bg-yellow-500/80']],
  ['Olahraga', ['bg-blue-200 dark:bg-blue-900', 'bg-blue-500/80']],
  ['Hiburan', ['bg-purple-200 dark:bg-purple-900', 'bg-purple-500/80']],
  ['Olahraga', ['bg-red-200 dark:bg-red-900', 'bg-red-500/80']],
]);

export const categories: string[] = Array.from(categoryColors.keys());

export function getCategoryColors(category: string): [string, string] {
  const colorTuple: [string, string] | undefined = categoryColors.get(category);
  return colorTuple ?? ['bg-cyan-200 dark:bg-cyan-900', 'bg-cyan-500/80'];
}
