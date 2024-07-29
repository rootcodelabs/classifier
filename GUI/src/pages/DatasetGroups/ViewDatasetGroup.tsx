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
  const [searchParams] = useSearchParams();
  const { open, close } = useDialog();
  const { register } = useForm();
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
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [fetchEnabled, setFetchEnabled] = useState(true);
  const [file, setFile] = useState('');
  const [selectedRow, setSelectedRow] = useState({});

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
  //   dgId: 1,
  //   operationSuccessful: true,
  //   fields: [
  //     'rowId',
  //     'emailAddress',
  //     'emailBody',
  //     'emailSendTime',
  //     'departmentCode',
  //     'ministry',
  //     'division',
  //   ],
  //   dataPayload: [
  //     {
  //       rowId: 1,
  //       emailAddress: 'thiru.dinesh@rootcodelabs.com',
  //       emailBody:
  //         'A generated email body that is interenstingly sophisticated and long enought to fill the screen. This body should also simulate the real life emails recieved by the government authorities in Estonia. Will be very interesting',
  //       emailSendTime: 'Sun, 07 Jul 2024 08:35:54 GMT',
  //       departmentCode: '05ABC',
  //       ministry: 'police and border guard',
  //       division: 'complaints processsing',
  //     },
  //     {
  //       rowId: 2,
  //       emailAddress: 'thiru.dinesh@rootcodelabs.com',
  //       emailBody:
  //         'A generated email body that is interenstingly sophisticated and long enought to fill the screen. This body should also simulate the real life emails recieved by the government authorities in Estonia. Will be very interesting',
  //       emailSendTime: 'Sun, 07 Jul 2024 08:35:54 GMT',
  //       departmentCode: '05ABC',
  //       ministry: 'police and border guard',
  //       division: 'complaints processsing',
  //     },
  //     {
  //       rowId: 3,
  //       emailAddress: 'thiru.dinesh@rootcodelabs.com',
  //       emailBody:
  //         'A generated email body that is interenstingly sophisticated and long enought to fill the screen. This body should also simulate the real life emails recieved by the government authorities in Estonia. Will be very interesting',
  //       emailSendTime: 'Sun, 07 Jul 2024 08:35:54 GMT',
  //       departmentCode: '05ABC',
  //       ministry: 'police and border guard',
  //       division: 'complaints processsing',
  //     },
  //     {
  //       rowId: 4,
  //       emailAddress: 'thiru.dinesh@rootcodelabs.com',
  //       emailBody:
  //         'A generated email body that is interenstingly sophisticated and long enought to fill the screen. This body should also simulate the real life emails recieved by the government authorities in Estonia. Will be very interesting',
  //       emailSendTime: 'Sun, 07 Jul 2024 08:35:54 GMT',
  //       departmentCode: '05ABC',
  //       ministry: 'police and border guard',
  //       division: 'complaints processsing',
  //     },
  //     {
  //       rowId: 5,
  //       emailAddress: 'thiru.dinesh@rootcodelabs.com',
  //       emailBody:
  //         'A generated email body that is interenstingly sophisticated and long enought to fill the screen. This body should also simulate the real life emails recieved by the government authorities in Estonia. Will be very interesting',
  //       emailSendTime: 'Sun, 07 Jul 2024 08:35:54 GMT',
  //       departmentCode: '05ABC',
  //       ministry: 'police and border guard',
  //       division: 'complaints processsing',
  //     },
  //   ],
  // };
  // const isLoading = false;

  const { data: metadata, isLoading: isMetadataLoading } = useQuery(
    ['datasets/groups/metadata', dgId],
    () => getMetadata(dgId),
    { enabled: fetchEnabled }
  );

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

  const patchDataUpdate = (dataset) => {
    const payload=  datasets?.dataPayload?.map((row) =>
      row.rowID === selectedRow?.rowID ? dataset : row
    );

    const updatedPayload = {
      dgId,
      updateDataPayload: payload
    };
    patchUpdateMutation.mutate(updatedPayload);

    console.log(updatedPayload);
    
  };

  const patchUpdateMutation = useMutation({
    mutationFn: (data) => patchUpdate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['datasets/groups/data']);
      setPatchUpdateModalOpen(false);
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
      onClick={() =>
        open({
          title: 'Are you sure?',
          content: (
            <p>Confirm that you are wish to delete the following record</p>
          ),
          footer: (
            <div className="flex-grid">
              <Button appearance="secondary" onClick={() => close()}>
                Cancel
              </Button>
              <Button appearance="error">Delete</Button>
            </div>
          ),
        })
      }
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
      const payload = {
        dgId,
        s3FilePath: response?.saved_file_path,
      };
      minorUpdateMutation.mutate(payload);
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

  const datasetGroupMajorUpdate = () => {
    setNodesError(validateClassHierarchy(nodes));
    setValidationRuleError(validateValidationRules(validationRules));
    if (
      !validateClassHierarchy(nodes) &&
      !validateValidationRules(validationRules) &&
      !nodesError &&
      !validationRuleError
    ) {
      const payload: DatasetGroup = {
        dgId,
        validationCriteria: { ...transformValidationRules(validationRules) },
        ...transformClassHierarchy(nodes),
      };
      majorUpdateDatasetGroupMutation.mutate(payload);
    }
  };

  const majorUpdateDatasetGroupMutation = useMutation({
    mutationFn: (data: DatasetGroup) => majorUpdate(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['datasetgroup/overview']);
      setView('list');
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
              <Card>
                <div
                  style={{
                    padding: '20px 150px',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  {!datasets&& (
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
                      <Button  onClick={() => setIsImportModalOpen(true)}>Import New Data</Button>
                    </div>
                  )}
                  {datasets &&
                    datasets?.length < 10 && (
                      <div>
                        <p>
                          Insufficient examples - at least 10 examples are
                          needed to activate the dataset group.
                        </p>
                        <Button  onClick={() => setIsImportModalOpen(true)}>Import New Data</Button>
                      </div>
                    )}
                </div>
              </Card>
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            {!isLoading && datasets && (
              <DataTable
                data={datasets?.dataPayload}
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
                />
              </Card>

              <Card header="Class Hierarchies" isHeaderLight={false}>
                {!isMetadataLoading && (
                  <ClassHierarchy
                    nodes={nodes}
                    setNodes={setNodes}
                    nodesError={nodesError}
                    setNodesError={setNodesError}
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
            <Button onClick={() => datasetGroupMajorUpdate()}>Save</Button>
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
    </div>
  );
};

export default ViewDatasetGroup;
