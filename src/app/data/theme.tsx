// 类型定义
export interface Reference {
  id: string;
  link: string[];
  isSelected: boolean;
}

export interface ThemeCard {
  id: string;
  title: string;
  objectives: string[];
  references: Reference[];
  duration: number;
  status: 0 | 1 | 2; // 0: 进行中, 1: 待开始, 2: 已完成
  order: number; // 添加顺序属性
}
