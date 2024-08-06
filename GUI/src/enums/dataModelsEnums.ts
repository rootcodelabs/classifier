export enum TrainingStatus {
  NOT_TRAINED = 'not trained',
  TRAINING_INPROGRESS = 'training in-progress',
  TRAINED = 'trained',
  RETRAINING_NEEDED = 'retraining needed',
  UNTRAINABLE = 'untrainable',
}

export enum Maturity {
  PRODUCTION = 'production ready',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
}

export enum Platform {
  JIRA = 'jira',
  OUTLOOK = 'outlook',
  PINAL = 'pinal',
  UNDEPLOYED = 'undeployed',

}