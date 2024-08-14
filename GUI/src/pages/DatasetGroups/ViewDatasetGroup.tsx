import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button } from 'components';
import { PaginationState } from '@tanstack/react-table';
import {
  DatasetGroup,
  SelectedRowPayload,
  ImportDataset,
  MinorPayLoad,
  PatchPayLoad,
  TreeNode,
  ValidationRule,
} from 'types/datasetGroups';
import { useNavigate } from 'react-router-dom';
import {
  exportDataset,
  getDatasets,
  getMetadata,
  importDataset,
  majorUpdate,
  minorUpdate,
  patchUpdate,
} from 'services/datasets';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDialog } from 'hooks/useDialog';
import {
  handleDownload,
  isMajorUpdate,
  reverseTransformClassHierarchy,
  transformClassHierarchy,
  transformObjectToArray,
  transformValidationRules,
  validateClassHierarchy,
  validateValidationRules,
} from 'utils/datasetGroupsUtils';
import { datasetQueryKeys } from 'utils/queryKeys';
import {
  DatasetViewEnum,
  UpdatePriority,
  ViewDatasetGroupModalContexts,
} from 'enums/datasetEnums';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import ViewDatasetGroupModalController from 'components/molecules/ViewDatasetGroupModalController/ViewDatasetGroupModalController';
import { FileUploadHandle } from 'components/FileUpload';
import DatasetDetailedViewTable from 'components/molecules/DatasetDetailedViewTable/DatasetDetailedViewTable';
import ValidationAndHierarchyCards from 'components/molecules/ValidationAndHierarchyCards/ValidationAndHierarchyCards';

type Props = {
  dgId: number;
  setView: React.Dispatch<React.SetStateAction<DatasetViewEnum>>;
};

const ViewDatasetGroup: FC<PropsWithChildren<Props>> = ({ dgId, setView }) => {
  const { t } = useTranslation();
  const { open, close } = useDialog();
  const queryClient = useQueryClient();

  const [validationRuleError, setValidationRuleError] = useState(false);
  const [nodesError, setNodesError] = useState(false);
  const [importFormat, setImportFormat] = useState('');
  const [exportFormat, setExportFormat] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [fetchEnabled, setFetchEnabled] = useState(true);
  const [file, setFile] = useState<File>();
  const [selectedRow, setSelectedRow] = useState<SelectedRowPayload>();
  const [bannerMessage, setBannerMessage] = useState('');
  const [minorPayload, setMinorPayload] = useState<MinorPayLoad>();
  const [patchPayload, setPatchPayload] = useState<PatchPayLoad>();
  const [deletedDataRows, setDeletedDataRows] = useState<number[]>([]);
  const [updatePriority, setUpdatePriority] = useState<UpdatePriority>(
    UpdatePriority.NULL
  );
  const [openedModalContext, setOpenedModalContext] =
    useState<ViewDatasetGroupModalContexts>(ViewDatasetGroupModalContexts.NULL);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    setFetchEnabled(false);
  }, []);

  useEffect(() => {
    if (updatePriority === UpdatePriority.MAJOR)
      setBannerMessage(t('datasetGroups.detailedView.majorUpdateBanner') ?? '');
    else if (updatePriority === UpdatePriority.MINOR)
      setBannerMessage(t('datasetGroups.detailedView.minorUpdateBanner') ?? '');
    else if (updatePriority === UpdatePriority.PATCH)
      setBannerMessage(t('datasetGroups.detailedView.patchUpdateBanner') ?? '');
    else setBannerMessage('');
  }, [updatePriority]);

  const { data: datasets, isLoading } = useQuery(
    datasetQueryKeys.GET_DATA_SETS(dgId, pagination),
    () => getDatasets(pagination, dgId),
    {
      keepPreviousData: true,
    }
  );

  const { data: metadata, isLoading: isMetadataLoading } = useQuery(
    datasetQueryKeys.GET_MATA_DATA(dgId),
    () => getMetadata(dgId),
    { enabled: fetchEnabled }
  );

  const [updatedDataset, setUpdatedDataset] = useState(datasets?.dataPayload);

  useEffect(() => {
    setUpdatedDataset(datasets?.dataPayload);
  }, [datasets]);

  const [nodes, setNodes] = useState<TreeNode[]>(
    reverseTransformClassHierarchy(metadata?.[0]?.classHierarchy)
  );
  const [validationRules, setValidationRules] = useState<
    ValidationRule[] | undefined
  >(transformObjectToArray(metadata?.[0]?.validationCriteria?.validationRules));

  useEffect(() => {
    setNodes(reverseTransformClassHierarchy(metadata?.[0]?.classHierarchy));
  }, [metadata]);

  useEffect(() => {
    setValidationRules(
      transformObjectToArray(metadata?.[0]?.validationCriteria?.validationRules)
    );
  }, [metadata]);

  useEffect(() => {
    if (
      metadata &&
      isMajorUpdate(
        {
          validationRules: metadata?.[0]?.validationCriteria?.validationRules,
          classHierarchy: metadata?.[0]?.classHierarchy,
        },
        {
          validationRules:
            transformValidationRules(validationRules)?.validationRules,
          ...transformClassHierarchy(nodes),
        }
      )
    ) {
      setUpdatePriority(UpdatePriority.MAJOR);
    } else {
      setUpdatePriority(UpdatePriority.NULL);
    }
  }, [validationRules, nodes]);

  const deleteRow = (dataRow: SelectedRowPayload) => {
    setDeletedDataRows((prevDeletedDataRows) => [
      ...prevDeletedDataRows,
      dataRow?.rowId,
    ]);
    const payload = updatedDataset?.filter(
      (row) => row.rowId !== selectedRow?.rowId
    );
    setUpdatedDataset(payload);

    const updatedPayload = {
      dgId,
      updateDataPayload: {
        deletedDataRows: [...deletedDataRows, dataRow?.rowId],
        editedData: payload,
      },
    };
    setPatchPayload(updatedPayload);
    handleCloseModals();
    if (
      updatePriority !== UpdatePriority.MAJOR &&
      updatePriority !== UpdatePriority.MINOR
    )
      setUpdatePriority(UpdatePriority.PATCH);
  };

  const patchDataUpdate = (dataRow: SelectedRowPayload) => {
    const payload = updatedDataset?.map((row) =>
      row.rowId === selectedRow?.rowId ? dataRow : row
    );
    setUpdatedDataset(payload);

    const updatedPayload = {
      dgId,
      updateDataPayload: {
        deletedDataRows,
        editedData: payload,
      },
    };
    setPatchPayload(updatedPayload);
    handleCloseModals();
    if (
      updatePriority !== UpdatePriority.MAJOR &&
      updatePriority !== UpdatePriority.MINOR
    )
      setUpdatePriority(UpdatePriority.PATCH);
  };

  const patchUpdateMutation = useMutation({
    mutationFn: (data: PatchPayLoad) => patchUpdate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(datasetQueryKeys.GET_DATA_SETS());
      close();
      setView(DatasetViewEnum.LIST);
    },
    onError: () => {
      handleCloseModals();
      open({
        title: t('datasetGroups.detailedView.patchDataUnsuccessfulTitle') ?? '',
        content: (
          <p>
            {t('datasetGroups.detailedView.patchDataUnsuccessfulDesc') ?? ''}
          </p>
        ),
      });
    },
  });

  const handleExport = () => {
    exportDataMutation.mutate({ dgId, exportType: exportFormat });
  };

  const exportDataMutation = useMutation({
    mutationFn: (data: { dgId: number; exportType: string }) =>
      exportDataset(data?.dgId, data?.exportType),
    onSuccess: async (response) => {
      handleDownload(response, exportFormat);
      open({
        title: t('datasetGroups.detailedView.exportDataSuccessTitle') ?? '',
        content: (
          <p>{t('datasetGroups.detailedView.exportDataSuccessDesc') ?? ''}</p>
        ),
      });
      handleCloseModals();
    },
    onError: () => {
      open({
        title: t('datasetGroups.detailedView.exportDataUnsucessTitle') ?? '',
        content: (
          <p>{t('datasetGroups.detailedView.exportDataUnsucessDesc') ?? ''}</p>
        ),
      });
    },
  });

  const handleFileSelect = (file: File | null) => {
    if (file) setFile(file);
  };

  const handleImport = () => {
    setImportStatus('STARTED');
    const payload = {
      dgId,
      dataFile: file as File,
    };

    importDataMutation.mutate(payload);
  };

  const importDataMutation = useMutation({
    mutationFn: (data: ImportDataset) =>
      importDataset(data?.dataFile, data?.dgId),
    onSuccess: async (response) => {
      setMinorPayload({
        dgId,
        s3FilePath: response?.saved_file_path,
      });
      if (updatePriority !== UpdatePriority.MAJOR)
        setUpdatePriority(UpdatePriority.MINOR);

      handleCloseModals();
    },
    onError: () => {
      open({
        title: t('datasetGroups.detailedView.ImportDataUnsucessTitle') ?? '',
        content: (
          <p>{t('datasetGroups.detailedView.importDataUnsucessDesc') ?? ''}</p>
        ),
      });
    },
  });

  const minorUpdateMutation = useMutation({
    mutationFn: (data: MinorPayLoad) => minorUpdate(data),
    onSuccess: async () => {
      open({
        title: t('datasetGroups.detailedView.validationInitiatedTitle') ?? '',
        content: (
          <p>{t('datasetGroups.detailedView.validationInitiatedDesc') ?? ''}</p>
        ),
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={() => {
                close();
                navigate(0);
              }}
            >
              {t('global.cancel')}
            </Button>
            <Button onClick={()=>{navigate('/validation-sessions');close()}}>
              {t('datasetGroups.detailedView.viewValidations') ?? ''}
            </Button>
          </div>
        ),
      });
      setIsModalOpen(false);
      setOpenedModalContext(ViewDatasetGroupModalContexts.NULL);
    },
    onError: () => {
      open({
        title: t('datasetGroups.detailedView.ImportDataUnsucessTitle') ?? '',
        content: (
          <p>{t('datasetGroups.detailedView.importDataUnsucessDesc') ?? ''}</p>
        ),
      });
    },
  });

  const handleMajorUpdate = () => {
    const payload: DatasetGroup = {
      dgId,
      validationCriteria: { ...transformValidationRules(validationRules) },
      ...transformClassHierarchy(nodes),
    };
    majorUpdateDatasetGroupMutation.mutate(payload);
  };

  const datasetGroupUpdate = () => {
    const classHierarchyError = validateClassHierarchy(nodes);
    const validationRulesError = validateValidationRules(validationRules);

    setNodesError(classHierarchyError);
    setValidationRuleError(validationRulesError);

    if (
      classHierarchyError ||
      validationRulesError ||
      nodesError ||
      validationRuleError
    ) {
      return;
    }

    const isMajorUpdateDetected = isMajorUpdate(
      {
        validationRules: metadata?.[0]?.validationCriteria?.validationRules,
        classHierarchy: metadata?.[0]?.classHierarchy,
      },
      {
        validationRules:
          transformValidationRules(validationRules)?.validationRules,
        ...transformClassHierarchy(nodes),
      }
    );

    const openConfirmationModal = (
      content: string,
      title: string,
      onConfirm: () => void
    ) => {
      open({
        content,
        title,
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={close}
            >
              {t('global.cancel')}
            </Button>
            <Button onClick={onConfirm}>{t('global.confirm')}</Button>
          </div>
        ),
      });
    };

    if (isMajorUpdateDetected) {
      openConfirmationModal(
        t('datasetGroups.detailedView.confirmMajorUpdatesDesc'),
        t('datasetGroups.detailedView.confirmMajorUpdatesTitle'),
        handleMajorUpdate
      );
    } else if (minorPayload) {
      openConfirmationModal(
        t('datasetGroups.detailedView.confirmMinorUpdatesDesc'),
        t('datasetGroups.detailedView.confirmMinorUpdatesTitle'),
        () => minorUpdateMutation.mutate(minorPayload)
      );
    } else if (patchPayload) {
      openConfirmationModal(
        t('datasetGroups.detailedView.confirmPatchUpdatesDesc'),
        t('datasetGroups.detailedView.confirmPatchUpdatesTitle'),
        () => patchUpdateMutation.mutate(patchPayload)
      );
    }
  };

  const majorUpdateDatasetGroupMutation = useMutation({
    mutationFn: (data: DatasetGroup) => majorUpdate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(datasetQueryKeys.DATASET_OVERVIEW());
      setView(DatasetViewEnum.LIST);
      close();
    },
    onError: () => {
      open({
        title: 'Dataset Group Update Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const handleOpenModals = (context: ViewDatasetGroupModalContexts) => {
    setIsModalOpen(true);
    setOpenedModalContext(context);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setOpenedModalContext(ViewDatasetGroupModalContexts.NULL);
  };

  return (
    <div>
      <div className="container">
        <div className="content-wrapper">
          <DatasetDetailedViewTable
            metadata={metadata ?? []}
            handleOpenModals={handleOpenModals}
            bannerMessage={bannerMessage}
            datasets={datasets}
            isLoading={isLoading}
            updatedDataset={updatedDataset}
            setSelectedRow={setSelectedRow}
            pagination={pagination}
            setPagination={setPagination}
            dgId={dgId}
          />

          <ValidationAndHierarchyCards
            metadata={metadata}
            isMetadataLoading={isMetadataLoading}
            validationRules={validationRules}
            setValidationRules={setValidationRules}
            validationRuleError={validationRuleError}
            setValidationRuleError={setValidationRuleError}
            nodes={nodes}
            setNodes={setNodes}
            nodesError={nodesError}
            setNodesError={setNodesError}
          />

          <div className="button-container">
            <Button
              appearance={ButtonAppearanceTypes.ERROR}
              onClick={() =>
                open({
                  title:
                    t('datasetGroups.detailedView.modals.delete.title') ?? '',
                  content: (
                    <p>
                      {t(
                        'datasetGroups.detailedView.modals.delete.description'
                      )}
                    </p>
                  ),
                  footer: (
                    <div className="flex-grid">
                      <Button
                        appearance={ButtonAppearanceTypes.SECONDARY}
                        onClick={() => close()}
                      >
                        {t('global.cancel')}
                      </Button>
                      <Button
                        appearance={ButtonAppearanceTypes.ERROR}
                        onClick={() => close()}
                      >
                        {t('global.delete')}
                      </Button>
                    </div>
                  ),
                })
              }
            >
              {t('datasetGroups.detailedView.delete') ?? ''}
            </Button>
            <Button
              disabled={
                majorUpdateDatasetGroupMutation.isLoading ||
                minorUpdateMutation.isLoading ||
                patchUpdateMutation.isLoading
              }
              onClick={() => datasetGroupUpdate()}
            >
              {t('global.save') ?? ''}
            </Button>
          </div>
        </div>
      </div>
      <ViewDatasetGroupModalController
        setImportStatus={setImportStatus}
        handleFileSelect={handleFileSelect}
        fileUploadRef={fileUploadRef}
        handleImport={handleImport}
        importStatus={importStatus}
        setImportFormat={setImportFormat}
        importFormat={importFormat}
        handleExport={handleExport}
        setExportFormat={setExportFormat}
        selectedRow={selectedRow}
        patchDataUpdate={patchDataUpdate}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        openedModalContext={openedModalContext}
        setOpenedModalContext={setOpenedModalContext}
        closeModals={handleCloseModals}
        deleteRow={deleteRow}
        file={file}
        exportFormat={exportFormat}
      />
    </div>
  );
};

export default ViewDatasetGroup;