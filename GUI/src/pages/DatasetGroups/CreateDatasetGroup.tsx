import { FC, useCallback, useState } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, FormInput } from 'components';
import { v4 as uuidv4 } from 'uuid';
import ClassHierarchy from 'components/molecules/ClassHeirarchy';
import {
  getTimestampNow,
  isValidationRulesSatisfied,
  transformClassHierarchy,
  transformValidationRules,
  validateClassHierarchy,
  validateValidationRules,
} from 'utils/datasetGroupsUtils';
import ValidationCriteria from 'components/molecules/ValidationCriteria';
import { ValidationRule } from 'types/datasetGroups';
import { useNavigate } from 'react-router-dom';

const CreateDatasetGroup: FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();

  const initialValidationRules = [
    { id: 1, fieldName: '', dataType: '', isDataClass: false },
    { id: 2, fieldName: '', dataType: '', isDataClass: true },
  ];

  const initialClass = [
    { id: uuidv4(), fieldName: '', level: 0, children: [] },
  ];

  const [datasetName, setDatasetName] = useState('');
  const [datasetNameError, setDatasetNameError] = useState(false);

  const [validationRules, setValidationRules] = useState<ValidationRule[]>(
    initialValidationRules
  );
  const [validationRuleError, setValidationRuleError] = useState(false);

  const [nodes, setNodes] = useState(initialClass);
  const [nodesError, setNodesError] = useState(false);

  const validateData = useCallback(() => {
    setNodesError(validateClassHierarchy(nodes));
    setDatasetNameError(!datasetName && true);
    setValidationRuleError(validateValidationRules(validationRules));
    if (
      !validateClassHierarchy(nodes) &&
      datasetName &&
      true &&
      !validateValidationRules(validationRules)
    ) {
      if (!isValidationRulesSatisfied(validationRules)) {
        setIsModalOpen(true);
        setModalType('VALIDATION_ERROR');
      }else{
        const payload = {
          name: datasetName,
          major_version: 1,
          minor_version: 0,
          patch_version: 0,
          created_timestamp: getTimestampNow(),
          last_updated_timestamp: getTimestampNow(),
          ...transformValidationRules(validationRules),
          ...transformClassHierarchy(nodes),
        };
  
        console.log(payload);
        setIsModalOpen(true);
        setModalType('SUCCESS');
      }
      
    }
    
  }, [datasetName, nodes, validationRules]);

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">Create Dataset Group</div>
        </div>
        <div>
          <Card isHeaderLight={false} header={' Dataset Details'}>
            <div>
              <FormInput
                label="Dataset Name"
                placeholder="Enter dataset name"
                name="datasetName"
                onChange={(e) => setDatasetName(e.target.value)}
                error={
                  !datasetName && datasetNameError ? 'Enter dataset name' : ''
                }
              />
            </div>
          </Card>
          <ValidationCriteria
            validationRules={validationRules}
            setValidationRules={setValidationRules}
            validationRuleError={validationRuleError}
            setValidationRuleError={setValidationRuleError}
          />
          <ClassHierarchy
            nodes={nodes}
            setNodes={setNodes}
            nodesError={nodesError}
            setNodesError={setNodesError}
          />
        </div>
        {modalType === 'VALIDATION_ERROR' && (
          <Dialog
            isOpen={isModalOpen}
            title={'Insufficient Columns in Dataset'}
            footer={
              <div>
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Add now</Button>
              </div>
            }
            onClose={() => setIsModalOpen(false)}
          >
            The dataset must have at least 2 columns. Additionally, there needs
            to be at least one column designated as a data class and one column
            that is not a data class. Please adjust your dataset accordingly.
          </Dialog>
        )}
        {modalType === 'SUCCESS' && (
          <Dialog
            isOpen={isModalOpen}
            title={'Dataset Group Created Successfully'}
            footer={
              <div>
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Go to Detailed View
                </Button>
              </div>
            }
            onClose={() => setIsModalOpen(false)}
          >
            You have successfully created the dataset group. In the detailed
            view, you can now see and edit the dataset as needed.
          </Dialog>
        )}
        <div
          className="flex"
          style={{ alignItems: 'end', gap: '10px', justifyContent: 'end', marginTop:"25px" }}
        >
          <Button onClick={() => validateData()}>Create Dataset Group</Button>
          <Button appearance="secondary" onClick={()=>navigate('/dataset-groups')}>Cancel</Button>
        </div>
        
      </div>
    </div>
  );
};

export default CreateDatasetGroup;
