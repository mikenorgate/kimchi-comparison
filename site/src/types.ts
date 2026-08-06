export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface Example {
  id: string;
  title: string;
  approach: string;
  workflow: string;
  originalPrompt: string;
  questionsAndAnswers: QuestionAnswer[];
  sourcePath: string;
  buildCommand: string;
  entryPoint: string;
  agent: string;
  model: string | null;
  durationMs: number | null;
  cost: string | null;
  thinkingLevel: string | null;
  fermentId: string | null;
}
