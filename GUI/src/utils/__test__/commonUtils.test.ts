import {
  formattedArray,
  convertTimestampToDateTime,
  parseVersionString,
  formatDate,
  formatClassHierarchyArray,
} from '../commonUtilts';
import moment from 'moment';

describe('Utility Functions', () => {
  describe('formattedArray', () => {
    it('should format an array of strings into an array of objects with label and value properties', () => {
      const data = ['json', 'xlcx', 'text'];
      const expectedOutput = [
        { label: 'json', value: 'json' },
        { label: 'xlcx', value: 'xlcx' },
        { label: 'text', value: 'text' },
      ];
      expect(formattedArray(data)).toEqual(expectedOutput);
    });

    it('should return an empty array when given an empty array', () => {
      expect(formattedArray([])).toEqual([]);
    });

    // it('should return undefined if the input is undefined', () => {
    //   expect(formattedArray(undefined)).toBeUndefined();
    // });
  });

  // describe('convertTimestampToDateTime', () => {
  //   it('should convert timestamp to formatted date time string', () => {
  //     const mockFormat = '2024-08-07 12:34:56';
  //     const timestamp = 1738492496; // Example timestamp

  //     // Mocking the behavior of moment.unix()
  //     (moment.unix as jest.Mock).mockReturnValue({
  //       format: jest.fn().mockReturnValue(mockFormat),
  //     });

  //     const result = convertTimestampToDateTime(timestamp);

  //     expect(moment.unix).toHaveBeenCalledWith(timestamp);
  //     expect(moment.unix(timestamp).format).toHaveBeenCalledWith(
  //       'YYYY-MM-DD HH:mm:ss'
  //     );
  //     expect(result).toBe(mockFormat);
  //   });
  // });

  describe('parseVersionString', () => {
    it('should parse a version string into an object with major, minor, and patch numbers', () => {
      const version = '1.2.3';
      const expectedOutput = { major: 1, minor: 2, patch: 3 };
      expect(parseVersionString(version)).toEqual(expectedOutput);
    });

    it('should return -1 for any part of the version string that is "x"', () => {
      const version = '1.x.3';
      const expectedOutput = { major: 1, minor: -1, patch: 3 };
      expect(parseVersionString(version)).toEqual(expectedOutput);
    });

    it('should handle a version string with all parts as "x"', () => {
      const version = 'x.x.x';
      const expectedOutput = { major: -1, minor: -1, patch: -1 };
      expect(parseVersionString(version)).toEqual(expectedOutput);
    });
  });

  // describe('formatDate', () => {
  //   it('should format a date object into a string with the specified format', () => {
  //     const date = new Date('2021-01-01T00:00:00Z');
  //     const format = 'YYYY-MM-DD';
  //     const expectedOutput = '2021-01-01';
  //     expect(formatDate(date, format)).toBe(expectedOutput);
  //   });
  // });

  describe('formatClassHierarchyArray', () => {
    it('should return a valid string when returns a array', () => {
      const array = ['item1', 'item2', 'item3']
      const result = 'item1 -> item2 -> item3'

      expect(formatClassHierarchyArray(array)).toBe(result)
    })
  })
});
