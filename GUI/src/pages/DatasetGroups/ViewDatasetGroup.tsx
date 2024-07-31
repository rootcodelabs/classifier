import {
  FC,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  DataTable,
  Dialog,
  FormRadios,
  FormSelect,
  FormTextarea,
  Icon,
  Label,
  Switch,
} from 'components';
import ClassHierarchy from 'components/molecules/ClassHeirarchy';
import { createColumnHelper, PaginationState } from '@tanstack/react-table'; // Adjust based on your table library
import {
  Dataset,
  DatasetGroup,
  ImportDataset,
  ValidationRule,
} from 'types/datasetGroups';
import BackArrowButton from 'assets/BackArrowButton';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ValidationCriteriaRowsView from 'components/molecules/ValidationCriteria/RowsView';
import { MdOutlineDeleteOutline, MdOutlineEdit } from 'react-icons/md';
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
import { useForm } from 'react-hook-form';
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
import formats from '../../config/formatsConfig.json';
import FileUpload, { FileUploadHandle } from 'components/FileUpload';
import DynamicForm from 'components/FormElements/DynamicForm';

type Props = {
  dgId: number;
  setView: React.Dispatch<React.SetStateAction<string>>;
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [patchUpdateModalOpen, setPatchUpdateModalOpen] = useState(false);
  const [deleteRowModalOpen, setDeleteRowModalOpen] = useState(false);
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [fetchEnabled, setFetchEnabled] = useState(true);
  const [file, setFile] = useState('');
  const [selectedRow, setSelectedRow] = useState({});
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [minorPayload, setMinorPayload] = useState("");
  const [patchPayload, setPatchPayload] = useState("");
  const [deletedDataRows, setDeletedDataRows] = useState([]);
  const [updatePriority, setUpdatePriority] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setFetchEnabled(false);
  }, []);

  const { data: datasets, isLoading } = useQuery(
    ['datasets/groups/data', pagination, dgId],
    () => getDatasets(pagination, dgId),
    {
      keepPreviousData: true,
    }
  );

  const { data: metadata, isLoading: isMetadataLoading } = useQuery(
    ['datasets/groups/metadata', dgId],
    () => getMetadata(dgId),
    { enabled: fetchEnabled }
  );

  const [updatedDataset, setUpdatedDataset] = useState(datasets?.dataPayload);
  useEffect(() => {
    setUpdatedDataset(datasets?.dataPayload);
  }, [datasets]);

  const [nodes, setNodes] = useState(
    reverseTransformClassHierarchy(
      metadata?.response?.data?.[0]?.classHierarchy
    )
  );
  const [validationRules, setValidationRules] = useState<
    ValidationRule[] | undefined
  >(
    transformObjectToArray(
      metadata?.response?.data?.[0]?.validationCriteria?.validationRules
    )
  );

  useEffect(() => {
    setNodes(
      reverseTransformClassHierarchy(
        metadata?.response?.data?.[0]?.classHierarchy
      )
    );
  }, [metadata]);

  useEffect(() => {
    setValidationRules(
      transformObjectToArray(
        metadata?.response?.data?.[0]?.validationCriteria?.validationRules
      )
    );
  }, [metadata]);

  const deleteRow = (dataRow) => {
    setDeletedDataRows((prevDeletedDataRows) => [
      ...prevDeletedDataRows,
      dataRow?.rowId,
    ]);
    const payload = updatedDataset?.filter((row) => {
      if (row.rowId !== selectedRow?.rowId) return row;
    });
    setUpdatedDataset(payload);

    const updatedPayload = {
      dgId,
      updateDataPayload: {
        deletedDataRows: [...deletedDataRows, dataRow?.rowId],
        editedData: payload,
      },
    };
    setPatchPayload(updatedPayload);
    setDeleteRowModalOpen(false);
    // setIsDataChanged(true);
    setBannerMessage(
      'You have edited individual items in the dataset which are not saved. Please save the changes to apply'
    );
  };

  const patchDataUpdate = (dataRow) => {
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
    setPatchUpdateModalOpen(false);
    // setIsDataChanged(true);
    setBannerMessage(
      'You have edited individual items in the dataset which are not saved. Please save the changes to apply'
    );

    // patchUpdateMutation.mutate(updatedPayload);
  };

  const patchUpdateMutation = useMutation({
    mutationFn: (data) => patchUpdate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['datasets/groups/data']);
    },
    onError: () => {
      setPatchUpdateModalOpen(false);
      open({
        title: 'Patch Data Update Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const generateDynamicColumns = (columnsData, editView, deleteView) => {
    const columnHelper = createColumnHelper();
    const dynamicColumns = columnsData?.map((col) => {
      return columnHelper.accessor(col, {
        header: col ?? '',
        id: col,
      });
    });

    const staticColumns = [
      columnHelper.display({
        id: 'edit',
        cell: editView,
        meta: {
          size: '1%',
        },
      }),
      columnHelper.display({
        id: 'delete',
        cell: deleteView,
        meta: {
          size: '1%',
        },
      }),
    ];
    if (dynamicColumns) return [...dynamicColumns, ...staticColumns];
    else return [];
  };

  const editView = (props) => {
    return (
      <Button
        appearance="text"
        onClick={() => {
          setSelectedRow(props.row.original);
          setPatchUpdateModalOpen(true);
        }}
      >
        <Icon icon={<MdOutlineEdit />} />
        {'Edit'}
      </Button>
    );
  };

  const deleteView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => {
        setSelectedRow(props.row.original);
        setDeleteRowModalOpen(true);
      }}
    >
      <Icon icon={<MdOutlineDeleteOutline />} />
      {'Delete'}
    </Button>
  );

  const dataColumns = useMemo(
    () => generateDynamicColumns(datasets?.fields, editView, deleteView),
    [datasets?.fields]
  );

  const handleExport = () => {
    exportDataMutation.mutate({ dgId, exportType: exportFormat });
  };

  const exportDataMutation = useMutation({
    mutationFn: (data) => exportDataset(data?.dgId, data?.exportType),
    onSuccess: async (response) => {
      handleDownload(response, exportFormat);
      open({
        title: 'Data export was successful',
        content: <p>Your data has been successfully exported.</p>,
      });
      setIsExportModalOpen(false);
    },
    onError: () => {
      open({
        title: 'Dataset Export Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setFile(file);
  };

  const handleImport = () => {
    setImportStatus('STARTED');
    const payload = {
      dgId,
      dataFile: file,
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
      setBannerMessage(
        'You have imported new data into the dataset, please save the changes to apply. Any changes you made to the individual data items will be discarded after changes are applied '
      );
      // const payload = {
      //   dgId,
      //   s3FilePath: response?.saved_file_path,
      // };
      // setIsDataChanged(true);
      setIsImportModalOpen(false);
      // minorUpdateMutation.mutate(payload);
    },
    onError: () => {
      open({
        title: 'Dataset Import Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const minorUpdateMutation = useMutation({
    mutationFn: (data) => minorUpdate(data),
    onSuccess: async (response) => {
      open({
        title: 'Dataset uploaded and validation initiated',
        content: (
          <p>
            The dataset file was successfully uploaded. The validation and
            preprocessing is now initiated
          </p>
        ),
        footer: (
          <div className="flex-grid">
            <Button
              appearance="secondary"
              onClick={() => {
                close();
                navigate(0);
              }}
            >
              Cancel
            </Button>
            <Button>View Validation Sessions</Button>
          </div>
        ),
      });
      setIsImportModalOpen(false);
    },
    onError: () => {
      open({
        title: 'Dataset Import Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const renderValidationStatus = (status: string | undefined) => {
    if (status === 'success') {
      return <Label type="success">{'Validation Successful'}</Label>;
    } else if (status === 'fail') {
      return <Label type="error">{'Validation Failed'}</Label>;
    } else if (status === 'unvalidated') {
      return <Label type="info">{'Not Validated'}</Label>;
    } else if (status === 'in-progress') {
      return <Label type="warning">{'Validation In Progress'}</Label>;
    }
  };

  const handleMajorUpdate = () => {
    const payload: DatasetGroup = {
      dgId,
      validationCriteria: { ...transformValidationRules(validationRules) },
      ...transformClassHierarchy(nodes),
    };
    majorUpdateDatasetGroupMutation.mutate(payload);
   
  };

  const datasetGroupUpdate = () => {    
    setNodesError(validateClassHierarchy(nodes));
    setValidationRuleError(validateValidationRules(validationRules));
    if (
      !validateClassHierarchy(nodes) &&
      !validateValidationRules(validationRules) &&
      !nodesError &&
      !validationRuleError
    ) {
      if (
        isMajorUpdate(
          {
            validationRules:
              metadata?.response?.data?.[0]?.validationCriteria?.validationRules,
            classHierarchy: metadata?.response?.data?.[0]?.classHierarchy,
          },
          {
            validationRules:
              transformValidationRules(validationRules)?.validationRules,
            ...transformClassHierarchy(nodes),
          }
        )
      ) {
        open({
          content:
            'Any files imported or edits made to the existing data will be discarded after changes are applied',
          title: 'Confirm major update',
          footer: (
            <div className="flex-grid">
              <Button appearance="secondary">Cancel</Button>
              <Button onClick={() => handleMajorUpdate()}>Confirm</Button>
            </div>
          ),
        });
      }else if (minorPayload) {
        open({
          content:
            'Any changes you made to the individual data items (patch update) will be discarded after changes are applied',
          title: 'Confirm minor update',
          footer: (
            <div className="flex-grid">
              <Button appearance="secondary" onClick={close}>Cancel</Button>
              <Button onClick={() => minorUpdateMutation.mutate(minorPayload)}>
                Confirm
              </Button>
            </div>
          ),
        });
      } else if (patchPayload) {
        open({
          content: 'Changed data rows will be updated in the dataset',
          title: 'Confirm patch update',
          footer: (
            <div className="flex-grid">
              <Button appearance="secondary">Cancel</Button>
              <Button onClick={() => patchUpdateMutation.mutate(patchPayload)}>
                Confirm
              </Button>
            </div>
          ),
        });
      }
    }
     
  };

  const majorUpdateDatasetGroupMutation = useMutation({
    mutationFn: (data: DatasetGroup) => majorUpdate(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['datasetgroup/overview']);
      setView('list');
      close();
    },
    onError: () => {
      open({
        title: 'Dataset Group Update Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  return (
    <div>
      <div className="container">
        <div>
          {metadata && (
            <div>
              {' '}
              <Card
                isHeaderLight={false}
                header={
                  <div className="flex-between">
                    <div className="flex-grid">
                      <Link to={''} onClick={() => navigate(0)}>
                        <BackArrowButton />
                      </Link>
                      <div className="title">
                        {metadata?.response?.data?.[0]?.name}
                      </div>
                      {metadata && (
                        <Label type="success">{`V${metadata?.response?.data?.[0]?.majorVersion}.${metadata?.response?.data?.[0]?.minorVersion}.${metadata?.response?.data?.[0]?.patchVersion}`}</Label>
                      )}
                      {metadata?.response?.data?.[0]?.latest ? (
                        <Label type="success">Latest</Label>
                      ) : null}
                      {renderValidationStatus(
                        metadata?.response?.data?.[0]?.validationStatus
                      )}
                    </div>
                    <Switch
                      label=""
                      checked={metadata?.response?.data?.[0]?.isEnabled}
                    />
                  </div>
                }
              >
                <div className="flex-between">
                  <div>
                    <p>
                      Connected Models :
                      {metadata?.response?.data?.[0]?.linkedModels?.map(
                        (model, index) => {
                          return index === metadata?.linkedModels?.length - 1
                            ? ` ${model?.modelName}`
                            : ` ${model?.modelName}, `;
                        }
                      )}
                    </p>
                    <p>
                      Number of items :
                      {` ${metadata?.response?.data?.[0]?.numSamples}`}
                    </p>
                  </div>
                  <div className="flex-grid">
                    <Button
                      appearance="secondary"
                      onClick={() => setIsExportModalOpen(true)}
                    >
                      Export Dataset
                    </Button>
                    <Button
                      appearance="secondary"
                      onClick={() => setIsImportModalOpen(true)}
                    >
                      Import New Data
                    </Button>
                  </div>
                </div>
              </Card>
              {bannerMessage && <div className="banner">{bannerMessage}</div>}
              {(!datasets || (datasets && datasets?.length < 10)) && (
                <Card>
                  <div
                    style={{
                      padding: '20px 150px',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {!datasets && (
                      <div>
                        <div style={{ marginBottom: '10px', fontSize: '20px' }}>
                          No Data Available
                        </div>
                        <p>
                          You have created the dataset group, but there are no
                          datasets available to show here. You can upload a
                          dataset to view it in this space. Once added, you can
                          edit or delete the data as needed.
                        </p>
                        <Button onClick={() => setIsImportModalOpen(true)}>
                          Import New Data
                        </Button>
                      </div>
                    )}
                    {datasets && datasets?.length < 10 && (
                      <div>
                        <p>
                          Insufficient examples - at least 10 examples are
                          needed to activate the dataset group.
                        </p>
                        <Button onClick={() => setIsImportModalOpen(true)}>
                          Import New Data
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            {!isLoading && updatedDataset && (
              <DataTable
                data={updatedDataset}
                columns={dataColumns}
                pagination={pagination}
                setPagination={(state: PaginationState) => {
                  if (
                    state.pageIndex === pagination.pageIndex &&
                    state.pageSize === pagination.pageSize
                  )
                    return;
                  setPagination(state);
                  getDatasets(state, dgId);
                }}
                pagesCount={datasets?.numPages}
                isClientSide={false}
              />
            )}
          </div>
          {metadata && (
            <div>
              <Card header="Dataset Group Validations" isHeaderLight={false}>
                <ValidationCriteriaRowsView
                  validationRules={validationRules}
                  setValidationRules={setValidationRules}
                  validationRuleError={validationRuleError}
                  setValidationRuleError={setValidationRuleError}
                  setBannerMessage={setBannerMessage}
                />
              </Card>

              <Card header="Class Hierarchies" isHeaderLight={false}>
                {!isMetadataLoading && (
                  <ClassHierarchy
                    nodes={nodes}
                    setNodes={setNodes}
                    nodesError={nodesError}
                    setNodesError={setNodesError}
                    setBannerMessage={setBannerMessage}
                  />
                )}
              </Card>
            </div>
          )}
          <div
            className="flex"
            style={{
              alignItems: 'end',
              gap: '10px',
              justifyContent: 'end',
              marginTop: '25px',
            }}
          >
            <Button
              appearance="error"
              onClick={() =>
                open({
                  title: 'Are you sure?',
                  content: (
                    <p>
                      Once you delete the dataset all models connected to this
                      model will become untrainable. Are you sure you want to
                      proceed?
                    </p>
                  ),
                  footer: (
                    <div className="flex-grid">
                      <Button appearance="secondary" onClick={() => close()}>
                        Cancel
                      </Button>
                      <Button appearance="error" onClick={() => close()}>
                        Delete
                      </Button>
                    </div>
                  ),
                })
              }
            >
              Delete Dataset
            </Button>
            <Button onClick={() => datasetGroupUpdate()}>Save</Button>
          </div>
        </div>
      </div>
      {isImportModalOpen && (
        <Dialog
          isOpen={isImportModalOpen}
          title={'Import New Data'}
          footer={
            <div className="flex-grid">
              <Button
                appearance="secondary"
                onClick={() => {
                  setImportStatus('ABORTED');
                  setIsImportModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          }
          onClose={() => {
            setIsImportModalOpen(false);
            setImportStatus('ABORTED');
          }}
        >
          <div>
            <p>Select the file format</p>
            <div className="flex-grid" style={{ marginBottom: '20px' }}>
              <FormRadios
                label=""
                name="format"
                items={formats}
                onChange={setImportFormat}
              ></FormRadios>
            </div>
            <p>Attachments</p>
            <FileUpload
              ref={fileUploadRef}
              onFileSelect={handleFileSelect}
              accept={importFormat}
              disabled={!importFormat}
            />
            {importStatus === 'STARTED' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ marginBottom: '10px', fontSize: '18px' }}>
                  Upload in Progress...
                </div>
                <p>
                  Uploading dataset. Please wait until the upload finishes. If
                  you cancel midway, the data and progress will be lost.
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}
      {isExportModalOpen && (
        <Dialog
          isOpen={isExportModalOpen}
          title={'Export Data'}
          footer={
            <div className="flex-grid">
              <Button
                appearance="secondary"
                onClick={() => {
                  setIsExportModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => handleExport()}>Export</Button>
            </div>
          }
          onClose={() => {
            setIsExportModalOpen(false);
            setImportStatus('ABORTED');
          }}
        >
          <div>
            <p>Select the file format</p>
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
      {patchUpdateModalOpen && (
        <Dialog
          title={'Edit'}
          onClose={() => setPatchUpdateModalOpen(false)}
          isOpen={patchUpdateModalOpen}
        >
          <DynamicForm
            formData={selectedRow}
            onSubmit={patchDataUpdate}
            setPatchUpdateModalOpen={setPatchUpdateModalOpen}
          />
        </Dialog>
      )}
      {deleteRowModalOpen && (
        <Dialog
          isOpen={deleteRowModalOpen}
          onClose={() => setDeleteRowModalOpen(false)}
          title="Are you sure?"
          footer={
            <div className="flex-grid">
              <Button appearance="secondary" onClick={() => close()}>
                Cancel
              </Button>
              <Button appearance="error" onClick={() => deleteRow(selectedRow)}>
                Delete
              </Button>
            </div>
          }
        >
          Confirm that you are wish to delete the following record
        </Dialog>
      )}
    </div>
  );
};

export default ViewDatasetGroup;
