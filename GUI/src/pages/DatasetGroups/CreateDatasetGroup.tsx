import { FC, useCallback, useState } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormInput } from 'components';
import { v4 as uuidv4 } from 'uuid';
import ClassHierarchy from 'components/molecules/ClassHeirarchy';
import {
  isValidationRulesSatisfied,
  transformClassHierarchy,
  transformValidationRules,
  validateClassHierarchy,
  validateValidationRules,
} from 'utils/datasetGroupsUtils';
import { DatasetGroup, TreeNode, ValidationRule } from 'types/datasetGroups';
import { useNavigate } from 'react-router-dom';
import ValidationCriteriaCardsView from 'components/molecules/ValidationCriteria/CardsView';
import { useMutation } from '@tanstack/react-query';
import { createDatasetGroup } from 'services/datasets';
import { useDialog } from 'hooks/useDialog';
import { CreateDatasetGroupModals } from 'enums/datasetEnums';
import CreateDatasetGroupModalController from 'components/molecules/CreateDatasetGroupModals/CreateDatasetGroupModal';
import { ButtonAppearanceTypes } from 'enums/commonEnums';

const CreateDatasetGroup: FC = () => {
  const { t } = useTranslation();
  const { open } = useDialog();
  const navigate = useNavigate();

  const initialValidationRules = [
    { id: uuidv4(), fieldName: '', dataType: '', isDataClass: false },
    { id: uuidv4(), fieldName: '', dataType: '', isDataClass: true },
  ];

  const initialClass = [
    { id: uuidv4(), fieldName: '', level: 0, children: [] },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<CreateDatasetGroupModals>(
    CreateDatasetGroupModals.NULL
  );
  const [datasetName, setDatasetName] = useState('');
  const [datasetNameError, setDatasetNameError] = useState(false);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>(
    initialValidationRules
  );
  const [validationRuleError, setValidationRuleError] = useState(false);
  const [nodes, setNodes] = useState<TreeNode[]>(initialClass);
  const [nodesError, setNodesError] = useState(false);

  const validateData = useCallback(() => {
    setNodesError(validateClassHierarchy(nodes));
    setDatasetNameError(!datasetName);
    setValidationRuleError(validateValidationRules(validationRules));
    if (
      !validateClassHierarchy(nodes) &&
      datasetName &&
      !validateValidationRules(validationRules)
    ) {
      if (!isValidationRulesSatisfied(validationRules)) {
        setIsModalOpen(true);
        setModalType(CreateDatasetGroupModals.VALIDATION_ERROR);
      } else {
        const payload: DatasetGroup = {
          groupName: datasetName,
          validationCriteria: { ...transformValidationRules(validationRules) },
          ...transformClassHierarchy(nodes),
        };
        createDatasetGroupMutation.mutate(payload);
      }
    }
  }, [datasetName, nodes, validationRules]);

  const createDatasetGroupMutation = useMutation({
    mutationFn: (data: DatasetGroup) => createDatasetGroup(data),
    onSuccess: async () => {
      setIsModalOpen(true);
      setModalType(CreateDatasetGroupModals.SUCCESS);
    },
    onError: () => {
      open({
        title: t('datasetGroups.modals.createDatasetUnsuccessTitle'),
        content: <p>{t('datasetGroups.modals.errorDesc')}</p>,
      });
    },
  });

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">{t('datasetGroups.createDataset.title')}</div>
        </div>
        <div>
          <Card
            isHeaderLight={false}
            header={t('datasetGroups.createDataset.datasetDetails')}
          >
            <div>
              <FormInput
                label={t('datasetGroups.createDataset.datasetName') ?? ''}
                placeholder={
                  t('datasetGroups.createDataset.datasetInputPlaceholder') ?? ''
                }
                name="datasetName"
                onChange={(e) => setDatasetName(e.target.value)}
                error={
                  !datasetName && datasetNameError
                    ? t(
                        'datasetGroups.createDataset.datasetInputPlaceholder'
                      ) ?? ''
                    : ''
                }
              />
            </div>
          </Card>

          <ValidationCriteriaCardsView
            validationRules={validationRules}
            setValidationRules={setValidationRules}
            validationRuleError={validationRuleError}
            setValidationRuleError={setValidationRuleError}
          />

          <div className="title-sm">Class Hierarchy</div>
          <Card>
            {' '}
            <ClassHierarchy
              nodes={nodes}
              setNodes={setNodes}
              nodesError={nodesError}
              setNodesError={setNodesError}
            />
          </Card>
        </div>

        <CreateDatasetGroupModalController
          modalType={modalType}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
        
        <div className="button-container">
          <Button
            disabled={createDatasetGroupMutation.isLoading}
            onClick={() => validateData()}
          >
            {t('datasetGroups.createDatasetGroupButton')}
          </Button>
          <Button
            appearance={ButtonAppearanceTypes.SECONDARY}
            onClick={() => navigate('/dataset-groups')}
          >
            {t('global.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateDatasetGroup;
