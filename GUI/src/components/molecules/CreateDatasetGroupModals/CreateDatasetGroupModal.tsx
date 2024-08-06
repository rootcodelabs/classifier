import { CreateDatasetGroupModals } from 'enums/datasetEnums';
import { Button, Dialog } from 'components';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDialog } from 'hooks/useDialog';

const CreateDatasetGroupModalController = ({
  modalType,
  isModalOpen,
  setIsModalOpen,
}: {
  modalType: CreateDatasetGroupModals;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { open, close } = useDialog();

  const opneValidationErrorModal = (modalType: CreateDatasetGroupModals) => {
    open({
      title: t('datasetGroups.modals.columnInsufficientHeader') ?? "",
      content: (
        <p>
          {t('datasetGroups.modals.columnInsufficientDescription')}
        </p>
      ),
      footer: (
        <div>
              <Button
                appearance={ButtonAppearanceTypes.SECONDARY}
                onClick={() => setIsModalOpen(false)}
              >
                {t('global.cancel')}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                {t('datasetGroups.createDataset.addNowButton')}
              </Button>
            </div>
      )
    })
  }
  return (
    <>
      {modalType === CreateDatasetGroupModals.VALIDATION_ERROR && (
        <Dialog
          isOpen={isModalOpen}
          title={t('datasetGroups.modals.columnInsufficientHeader')}
          footer={
            <div>
              <Button
                appearance={ButtonAppearanceTypes.SECONDARY}
                onClick={() => setIsModalOpen(false)}
              >
                {t('global.cancel')}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                {t('datasetGroups.createDataset.addNowButton')}
              </Button>
            </div>
          }
          onClose={() => setIsModalOpen(false)}
        >
          {t('datasetGroups.modals.columnInsufficientDescription')}
        </Dialog>
      )}
      {modalType === CreateDatasetGroupModals.SUCCESS && (
        <Dialog
          isOpen={isModalOpen}
          title={t('datasetGroups.modals.createDatasetSuccessTitle')}
          footer={
            <div className="flex-grid">
              <Button
                appearance={ButtonAppearanceTypes.SECONDARY}
                onClick={() => setIsModalOpen(false)}
              >
                {t('global.cancel')}
              </Button>
              <Button onClick={() => navigate('/dataset-groups')}>
                {t('datasetGroups.modals.navigateDetailedViewButton')}
              </Button>
            </div>
          }
          onClose={() => setIsModalOpen(false)}
        >
          {t('datasetGroups.modals.createDatasetSucceessDesc')}
        </Dialog>
      )}
    </>
  );
};

export default CreateDatasetGroupModalController;
