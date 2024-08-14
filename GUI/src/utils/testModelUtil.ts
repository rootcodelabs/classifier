import { FormattedPrediction, PredictionInput } from "types/testModel";

export function formatPredictions(input: PredictionInput): FormattedPrediction[] {
    const { predictedClasses, predictedProbabilities } = input;
    
    return predictedClasses.map((predictedClass, index) => {
      const probability = predictedProbabilities[index];
      return `${predictedClass} - ${probability}%`;
    });
  }