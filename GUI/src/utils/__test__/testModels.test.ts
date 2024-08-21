import { formatPredictions } from '../testModelUtil';

describe('Test model utils functions', () => {
  describe('formatPredictions', () => {
    it('should return valid array', () => {
      const input = {
        predictedClasses: ['item1', 'item2', 'item3'],
        predictedProbabilities: [12, 13, 14],
        averageConfidence: 10,
      };

      const response = ['item1 - 12%', 'item2 - 13%', 'item3 - 14%'];
      expect(formatPredictions(input)).toEqual(response);
    });
  });
});
