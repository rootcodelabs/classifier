export type CorrectedTextResponseType = {
  inferenceId: number;
  itemId: string;
  inferenceTime: string;
  inferencedText: string;
  predictedLabels: string[];
  averagePredictedClassesProbability: number;
  platform: string;
  correctedLabels: string[];
  averageCorrectedClassesProbability: number;
};
