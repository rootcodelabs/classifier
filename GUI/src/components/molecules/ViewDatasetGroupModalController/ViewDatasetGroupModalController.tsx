import React, { RefObject } from 'react';
import { Button, Dialog, FormRadios } from 'components';
import DynamicForm from 'components/FormElements/DynamicForm';
import FileUpload, { FileUploadHandle } from 'components/FileUpload';
import formats from '../../../config/formatsConfig.json';
import { ViewDatasetGroupModalContexts } from 'enums/datasetEnums';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { useDialog } from 'hooks/useDialog';
import { useTranslation } from 'react-i18next';
import { SelectedRowPayload } from 'types/datasetGroups';
import './styles.scss';

const ViewDatasetGroupModalController = ({
  setImportStatus,
  fileUploadRef,
  handleFileSelect,
  handleImport,
  importStatus,
  setImportFormat,
  importFormat,
  handleExport,
  setExportFormat,
  selectedRow,
  patchDataUpdate,
  isModalOpen,
  setIsModalOpen,
  setOpenedModalContext,
  openedModalContext,
  closeModals,
  deleteRow,
  file,
  exportFormat,
}: {
  setImportStatus: React.Dispatch<React.SetStateAction<string>>;
  handleFileSelect: (file: File | null) => void;
  fileUploadRef: RefObject<FileUploadHandle>;
  handleImport: () => void;
  importStatus: string;
  setImportFormat: React.Dispatch<React.SetStateAction<string>>;
  importFormat: string;
  handleExport: () => void;
  setExportFormat: React.Dispatch<React.SetStateAction<string>>;
  selectedRow: SelectedRowPayload | undefined;
  patchDataUpdate: (dataset: any) => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openedModalContext: ViewDatasetGroupModalContexts;
  setOpenedModalContext: React.Dispatch<
    React.SetStateAction<ViewDatasetGroupModalContexts>
  >;
  closeModals: () => void;
  deleteRow: (dataRow: any) => void;
  file: File | undefined;
  exportFormat: string;
}) => {
  const { close } = useDialog();
  const { t } = useTranslation();

  return (
    <>
      {isModalOpen &&
        openedModalContext === ViewDatasetGroupModalContexts.IMPORT_MODAL && (
          <Dialog
            isOpen={
              isModalOpen &&
              openedModalContext === ViewDatasetGroupModalContexts.IMPORT_MODAL
            }
            title={t('datasetGroups.detailedView.modals.import.title')}
            footer={
              <div className="flex-grid">
                <Button
                  appearance={ButtonAppearanceTypes.SECONDARY}
                  onClick={() => {
                    setImportStatus('ABORTED');
                    closeModals();
                  }}
                >
                  {t('global.cancel')}
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importFormat || !file}
                >
                  {t('datasetGroups.detailedView.modals.import.import')}
                </Button>
              </div>
            }
            onClose={() => {
              closeModals();
              setImportStatus('ABORTED');
              setImportFormat('');
            }}
          >
            <div>
              <p>
                {t('datasetGroups.detailedView.modals.import.fileFormatlabel')}
              </p>
              <div className="flex-grid">
                <FormRadios
                  label=""
                  name="format"
                  items={formats}
                  onChange={setImportFormat}
                ></FormRadios>
              </div>
              <p>{t('datasetGroups.detailedView.modals.import.attachments')}</p>
              <FileUpload
                ref={fileUploadRef}
                onFileSelect={handleFileSelect}
                accept={importFormat}
                disabled={!importFormat}
              />
              {importStatus === 'STARTED' && (
                <div className='upload-progress-wrapper'>
                  <div className='upload-progress-text-wrapper'>
                    {t(
                      'datasetGroups.detailedView.modals.import.uploadInProgress'
                    )}
                  </div>
                  <p>
                    {t('datasetGroups.detailedView.modals.import.uploadDesc')}
                  </p>
                </div>
              )}
            </div>
          </Dialog>
        )}
      {isModalOpen &&
        openedModalContext === ViewDatasetGroupModalContexts.EXPORT_MODAL && (
          <Dialog
            isOpen={
              isModalOpen &&
              openedModalContext === ViewDatasetGroupModalContexts.EXPORT_MODAL
            }
            title={t('datasetGroups.detailedView.modals.export.export')}
            footer={
              <div className="flex-grid">
                <Button
                  appearance={ButtonAppearanceTypes.SECONDARY}
                  onClick={() => {
                    closeModals();
                  }}
                >
                  {t('global.cancel')}
                </Button>
                <Button onClick={() => handleExport()} disabled={!exportFormat}>
                  {t('datasetGroups.detailedView.modals.export.exportButton')}
                </Button>
              </div>
            }
            onClose={() => {
              closeModals();
              setImportStatus('ABORTED');
              setExportFormat('');
            }}
          >
            <div>
              <p>
                {t('datasetGroups.detailedView.modals.export.fileFormatlabel')}
              </p>
              <div className="flex-grid" style={{ marginBottom: '20px' }}>
                <FormRadios
                  label=""
                  name="format"
                  items={formats}
                  onChange={setExportFormat}
                ></FormRadios>
              </div>
            </div>
          </Dialog>
        )}
      {isModalOpen &&
        openedModalContext ===
          ViewDatasetGroupModalContexts.PATCH_UPDATE_MODAL && (
          <Dialog
            title={'Edit'}
            onClose={closeModals}
            isOpen={
              isModalOpen &&
              openedModalContext ===
                ViewDatasetGroupModalContexts.PATCH_UPDATE_MODAL
            }
          >
            <DynamicForm
              formData={selectedRow ?? {}}
              onSubmit={patchDataUpdate}
              setPatchUpdateModalOpen={setIsModalOpen}
            />
          </Dialog>
        )}

      {isModalOpen &&
        openedModalContext ===
          ViewDatasetGroupModalContexts.DELETE_ROW_MODAL && (
          <Dialog
            isOpen={
              isModalOpen &&
              openedModalContext ===
                ViewDatasetGroupModalContexts.DELETE_ROW_MODAL
            }
            onClose={closeModals}
            title={t('datasetGroups.detailedView.modals.delete.title')}
            footer={
              <div className="flex-grid">
                <Button
                  appearance={ButtonAppearanceTypes.SECONDARY}
                  onClick={() => close()}
                >
                  {t('global.cancel')}
                </Button>
                <Button
                  appearance={ButtonAppearanceTypes.ERROR}
                  onClick={() => deleteRow(selectedRow)}
                >
                  {t('global.delete')}
                </Button>
              </div>
            }
          >
            {t('datasetGroups.detailedView.modals.delete.description')}
          </Dialog>
        )}
    </>
  );
};

export default ViewDatasetGroupModalController;
