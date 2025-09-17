export interface ThemeCard {
  id: string;
  title: string;
  objectives: string[];
  references: Reference[][];
  duration: number;
}

export interface Reference {
  id: string;
  link: string;
  isSelected: boolean;
}
