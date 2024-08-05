export enum TrainingStatus {
    TRAINING_INPROGRESS = 'training in-progress',
    TRAINED = 'trained',
    RETRAINING_NEEDED = 'retraining needed',
    UNTRAINABLE = 'untrainable',
  }

  export enum Maturity {
    PRODUCTION = 'production',
    STAGING = 'staging',
    DEVELOPMENT = 'development',
    TESTING = 'testing',
  }