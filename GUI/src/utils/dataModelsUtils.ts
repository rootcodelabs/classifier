export const validateDataModel = (dataModel) => {
  const { modelName, dgName, platform, baseModels, maturity } = dataModel;
  const newErrors: any = {};

  if (!modelName.trim()) newErrors.modelName = 'Model Name is required';
  if (!dgName.trim()) newErrors.dgName = 'Dataset Group Name is required';
  if (!platform.trim()) newErrors.platform = 'Platform is required';
  if (baseModels.length === 0)
    newErrors.baseModels = 'At least one Base Model is required';
  if (!maturity.trim()) newErrors.maturity = 'Maturity is required';

  return newErrors;
};
