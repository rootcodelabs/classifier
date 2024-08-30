import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { Button, Dialog, FormRadios, FormSelect } from 'components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { correctedTextEndpoints } from 'utils/endpoints';
import apiDev from '../../services/api-dev';
import { InferencePayload } from 'types/correctedTextTypes';
import { PaginationState } from '@tanstack/react-table';
import CorrectedTextsTable from 'components/molecules/CorrectedTextTables/CorrectedTextsTables';
import formats from '../../config/formatsConfig.json';
import { handleDownload } from 'utils/datasetGroupsUtils';
import { exportCorrectedTexts } from 'services/datasets';

const CorrectedTexts: FC = () => {
  const { t } = useTranslation();
  const [enableFetch, setEnableFetch] = useState(true);

  const [filters, setFilters] = useState({
    platform: 'all',
    sort: 'asc',
  });

  const [totalPages, setTotalPages] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalDiscription, setModalDiscription] = useState<string>('');
  const [modalType, setModalType] = useState('');
  const [exportFormat, setExportFormat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: correctedTextData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['correctedText', pagination.pageIndex],
    queryFn: async () => {
      const response = await apiDev.get(
        correctedTextEndpoints.GET_CORRECTED_WORDS(
          pagination.pageIndex,
          pagination.pageSize,
          filters.platform,
          filters.sort
        )
      );

      return (
        (await response?.data?.response?.data) ?? ([] as InferencePayload[])
      );
    },
    onSuccess: (data: InferencePayload[]) => {
      setTotalPages(data[0]?.totalPages ?? 1);
      if (enableFetch) setEnableFetch(false);
    },
    enabled: enableFetch,
  });

  const handleFilterChange = (name: string, value: string) => {
    setEnableFetch(false);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleExport = () => {
    mutate();
  };

  const { mutate, isLoading: downloadLoading } = useMutation({
    mutationFn: async () =>
      await exportCorrectedTexts(filters.platform, exportFormat),
    onSuccess: async (response) => {
      handleDownload(response, exportFormat);
      setIsModalOpen(true);
      setModalTitle(t('correctedTexts.exportSuccessTitle') ?? '');
      setModalDiscription(t('correctedTexts.exportDataUnsucessDesc') ?? '');
      setModalType('success');
    },
    onError: async () => {
      setIsModalOpen(true);
      setModalTitle(t('correctedTexts.exportDataUnsucessTitle') ?? '');
      setModalDiscription(t('correctedTexts.exportDataUnsucessDesc') ?? '');
      setModalType('error');
    },
  });

  return (
    <div className="container">
      <div className="title_container">
        <div className="title">{t('correctedTexts.title')}</div>
        <Button
          appearance={ButtonAppearanceTypes.PRIMARY}
          size="m"
          disabled={correctedTextData?.length===0}
          onClick={() => {
            setIsModalOpen(true);
            setModalType('export');
            setModalTitle(
              t('datasetGroups.detailedView.modals.export.export') ?? ''
            );
          }}
        >
          {t('correctedTexts.export')}
        </Button>
      </div>

      <div>
        <div className="search-panel">
          <div
            style={{
              width: '50%',
              display: 'flex',
              gap: '30px',
              marginRight: '30px',
            }}
          >
            <FormSelect
              label=""
              name="sort"
              value={filters.platform}
              placeholder={t('correctedTexts.platform') ?? ''}
              options={[
                { label: 'Jira', value: 'JIRA' },
                { label: 'Outlook', value: 'OUTLOOK' },
              ]}
              onSelectionChange={(selection) =>
                handleFilterChange('platform', selection?.value as string)
              }
            />
            <FormSelect
              label=""
              name="sort"
              placeholder={
                filters.sort === 'asc'
                  ? t('correctedTexts.filterAsc') ?? ''
                  : t('correctedTexts.filterDesc') ?? ''
              }
              options={[
                { label: t('correctedTexts.filterAsc'), value: 'asc' },
                { label: t('correctedTexts.filterDesc'), value: 'desc' },
              ]}
              onSelectionChange={(selection) =>
                handleFilterChange('sort', (selection?.value as string) ?? '')
              }
            />
          </div>
          <Button
            onClick={() => {
              setEnableFetch(true);
              refetch();
            }}
          >
            {t('global.search')}
          </Button>
          <Button
            onClick={() => {
              setFilters({
                platform: 'all',
                sort: 'asc',
              });
              refetch();
            }}
          >
            {t('global.reset')}
          </Button>
        </div>

        <CorrectedTextsTable
          correctedTextData={correctedTextData ?? []}
          totalPages={totalPages}
          isLoading={isLoading}
          setPagination={setPagination}
          pagination={pagination}
          setEnableFetch={setEnableFetch}
        />
      </div>

      <Dialog
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        title={modalTitle}
        footer={
          modalType === 'export' && (
            <div className="flex-grid">
              <Button
                appearance={ButtonAppearanceTypes.SECONDARY}
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                {t('global.cancel')}
              </Button>
              <Button
                onClick={() => handleExport()}
                disabled={!exportFormat || downloadLoading}
                showLoadingIcon={downloadLoading}
              >
                {t('datasetGroups.detailedView.modals.export.exportButton')}
              </Button>
            </div>
          )
        }
      >
        {modalType === 'export' ? (
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
                selectedValue={exportFormat}
              ></FormRadios>
            </div>
          </div>
        ) : (
          <>
            <p>{modalDiscription}</p>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default CorrectedTexts;