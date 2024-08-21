import register from 'ignore-styles';
register(['.css', '.sass', '.scss']);
export {};

module.exports = {
  setupFiles: ['./jest.setup.ts'],
  preset: 'ts-jest',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!**/vendor/**'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage',
    'package.json',
    'package-lock.json',
    'reportWebVitals.ts',
    'setupTests.ts',
    'index.tsx',
  ],

  moduleNameMapper: {
    '^components/Button': '<rootDir>/src/components/Button/$1',
    // '^components/Dialog': '<rootDir>/src/components/Dialog/$1',
    '^components/molecules/ClassHeirarchy/TreeNode/ClassHeirarchyTreeNode':
      '<rootDir>/src/components/molecules/ClassHeirarchy/TreeNode/ClassHeirarchyTreeNode/$1',
    '^components/Label': '<rootDir>/__mocks__/LabelMock.tsx',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.ts',
    '^enums/(.*)$': '<rootDir>/src/enums/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^context/(.*)$': '<rootDir>/src/context/$1',
    '^components': '<rootDir>/src/components/$1',
    '\\.svg$': '<rootDir>/__mocks__/fileMock.ts',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// moduleNameMapper: {
//   '^components/Button': '<rootDir>/src/components/Button/$1',
//   '^components': '<rootDir>/src/components/$1',
//   '^components/molecules/ClassHeirarchy/TreeNode/ClassHeirarchyTreeNode': '<rootDir>/src/components/molecules/ClassHeirarchy/TreeNode/ClassHeirarchyTreeNode/$1',
//   "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.ts",
//   "^components/Label": "<rootDir>/__mocks__/LabelMock.tsx",
//   // '^enums/(.*)$': '<rootDir>/src/enums/$1',
//   '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
//   '^@formkit/auto-animate$': '<rootDir>/__mocks__/@formkit/auto-animate.ts',
// },
