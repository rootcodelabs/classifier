import { FC, useState } from 'react';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { Button, FormSelect } from 'components';
import { useQuery } from '@tanstack/react-query';
import { correctedTextEndpoints } from 'utils/endpoints';
import apiDev from '../../services/api-dev';
import { InferencePayload } from 'types/correctedTextTypes';
import { PaginationState } from '@tanstack/react-table';
import CorrectedTextsTable from 'components/molecules/CorrectedTextTables/CorrectedTextsTables';

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
  return (
    <div className="container">
      <div className="title_container">
        <div className="title">{t('correctedTexts.title')}</div>
        <Button
          appearance={ButtonAppearanceTypes.PRIMARY}
          size="m"
          onClick={() => {
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
        />
      </div>
    </div>
  );
};

export default CorrectedTexts;