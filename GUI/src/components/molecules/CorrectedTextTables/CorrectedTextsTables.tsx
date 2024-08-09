import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { generateDynamicColumns } from 'utils/dataTableUtils';
import SkeletonTable from '../TableSkeleton/TableSkeleton';
import DataTable from 'components/DataTable';
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
} from '@tanstack/react-table';
import { CorrectedTextResponseType } from 'types/correctedTextsTypes';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import mockDev from '../../../services/api-mock';
import { correctedTextEndpoints } from 'utils/endpoints';
import { correctedData } from 'data/mockData';
import { formatDateTime } from 'utils/commonUtilts';

const CorrectedTextsTables = ({
  filters,
  enableFetch,
}: {
  filters: {
    platform: string;
    sort: string;
  };
  enableFetch: boolean;
}) => {
  console.log(filters);
  const columnHelper = createColumnHelper<CorrectedTextResponseType>();
  const [filteredData, setFilteredData] = useState<CorrectedTextResponseType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [platform, setPlatform] = useState<string>('all');
  const [sortType, setSortType] = useState<string>('all');

  // const { data, isLoading } = useQuery({
  //   queryKey: ['correctedText', platform, sortType, pagination.pageIndex],
  //   queryFn: async () => {
  //     return await mockDev.get(
  //       correctedTextEndpoints.GET_CORRECTED_WORDS(
  //         pagination.pageIndex,
  //         pagination.pageSize,
  //         platform,
  //         sortType
  //       )
  //     );
  //   },
  //   onSuccess: () => {},
  // });
  const dataColumns = useMemo(
    () => [
      columnHelper.accessor('inferenceTime', {
        header: () => (
          <div
            style={{
              textAlign: 'right',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            {t('correctedTexts.inferenceTime') ?? ''}
          </div>
        ),
        cell: (props) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            <span>
              {
                formatDateTime(props?.row?.original?.inferenceTime)
                  .formattedDate
              }
            </span>
            <span>
              {
                formatDateTime(props?.row?.original?.inferenceTime)
                  .formattedTime
              }
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('platform', {
        header: t('correctedTexts.platform') ?? '',
      }),
      columnHelper.accessor('inferencedText', {
        header: t('correctedTexts.text') ?? '',
      }),
      columnHelper.accessor('predictedLabels', {
        header: () => (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              textWrap: 'wrap',
              width: '100%',
            }}
          >
            <span
              style={{
                width: '150px',
              }}
            >
              {t('correctedTexts.predictedHierarchy') ?? ''}
            </span>
          </div>
        ),
        cell: (props) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '500px',
              textWrap: 'wrap',
            }}
          >
            {formatArray(props?.row?.original?.predictedLabels)}
          </div>
        ),
      }),
      columnHelper.accessor('averagePredictedClassesProbability', {
        header: () => (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'center',
              width: '200px',
              textWrap: 'wrap',
            }}
          >
            {t('correctedTexts.predictedConfidenceProbability') ?? ''}
          </div>
        ),
        cell: (props) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '200px',
            }}
          >
            {props.row.original.averagePredictedClassesProbability}%
          </div>
        ),
        meta: {
          size: '90%',
        },
      }),
      columnHelper.accessor('correctedLabels', {
        header: () => (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              textWrap: 'wrap',
              width: '100%',
            }}
          >
            <span
              style={{
                width: '150px',
              }}
            >
              {t('correctedTexts.correctedHierarchy') ?? ''}
            </span>
          </div>
        ),
        cell: (props) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '500px',
              textWrap: 'wrap',
            }}
          >
            {formatArray(props?.row?.original?.correctedLabels)}
          </div>
        ),
      }),
      columnHelper.accessor('averageCorrectedClassesProbability', {
        header: () => (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'center',
              width: '200px',
              textWrap: 'wrap',
            }}
          >
            {t('correctedTexts.correctedConfidenceProbability') ?? ''}
          </div>
        ),
        cell: (props) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '200px',
            }}
          >
            {props.row.original.averageCorrectedClassesProbability}%
          </div>
        ),
      }),
    ],
    [t]
  );

  function paginateDataset(data: any[], pageIndex: number, pageSize: number) {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;

    const pageData = data.slice(startIndex, endIndex);

    setFilteredData(pageData);
  }

  const calculateNumberOfPages = (data: any[], pageSize: number) => {
    return Math.ceil(data.length / pageSize);
  };

  const formatArray = (array: string[]) => {
    return array
      .map((item, index) => (index === array.length - 1 ? item : item + ' ->'))
      .join(' ');
  };

  const filterItems = useCallback(() => {
    if (!enableFetch) {
      return;
    }

    let newData = correctedData;

    if (filters.platform && filters.platform !== 'all') {
      newData = newData.filter((item) => item.platform === filters.platform);
    }

    if (filters.sort && filters.sort !== 'all') {
      newData = newData.sort((a, b) => {
        if (filters.sort === 'asc') {
          return a.inferenceTime.localeCompare(b.inferenceTime);
        } else if (filters.sort === 'desc') {
          return b.inferenceTime.localeCompare(a.inferenceTime);
        }
        return 0;
      });
    }

    setFilteredData(newData);
  }, [filters, enableFetch]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  useEffect(() => {
    paginateDataset(correctedData, pagination.pageIndex, pagination.pageSize);
  }, []);
  return (
    <div>
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        {/* {isLoading && <SkeletonTable rowCount={5} />} */}
        {/* {!isLoading && (
          <DataTable
            data={[]}
            columns={dataColumns as ColumnDef<string, string>[]}
            pagination={pagination}
            setPagination={(state: PaginationState) => {
              if (
                state?.pageIndex === pagination?.pageIndex &&
                state?.pageSize === pagination?.pageSize
              )
                return;
              setPagination(state);
            }}
            pagesCount={pagination.pageIndex}
            isClientSide={false}
          />
        )} */}

        <DataTable
          data={filteredData}
          columns={dataColumns as ColumnDef<string, string>[]}
          pagination={pagination}
          setPagination={(state: PaginationState) => {
            if (
              state?.pageIndex === pagination?.pageIndex &&
              state?.pageSize === pagination?.pageSize
            )
              return;
            setPagination(state);
          }}
          pagesCount={calculateNumberOfPages(
            correctedData,
            pagination.pageSize
          )}
          isClientSide={false}
        />
      </div>
    </div>
  );
};

export default CorrectedTextsTables;
