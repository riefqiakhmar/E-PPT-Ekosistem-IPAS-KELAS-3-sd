export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string; // The correct option letter, e.g., 'A', 'B', 'C', 'D'
  explanation: string;
}

export interface DragItem {
  id: string;
  name: string;
  emoji: string;
  type: 'biotik' | 'abiotik';
}

export interface GardenItem {
  id: string;
  name: string;
  emoji: string;
  type: 'biotik' | 'abiotik';
  x: number; // percentage from left
  y: number; // percentage from top
  description: string;
}
