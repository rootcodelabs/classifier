import React, { useEffect, useMemo, useState } from 'react';
import SkeletonTable from '../TableSkeleton/TableSkeleton';
import DataTable from 'components/DataTable';
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from 'utils/commonUtilts';
import Card from 'components/Card';
import { InferencePayload } from 'types/correctedTextTypes';
import './CorrectedTextTable.scss';

const CorrectedTextsTables = ({
  correctedTextData,
  totalPages,
  isLoading,
  setPagination,
  pagination,
}: {
  correctedTextData: InferencePayload[];
  totalPages: number;
  isLoading: boolean;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  pagination: PaginationState;
}) => {
  const columnHelper = createColumnHelper<InferencePayload>();
  const { t } = useTranslation();

  const dataColumns = useMemo(
    () => [
      columnHelper.accessor('inferenceTimeStamp', {
        header: () => (
          <div className="inferenceTimeLabel">
            {t('correctedTexts.inferenceTime') ?? ''}
          </div>
        ),
        cell: (props) => (
          <div className="inferenceTimeCell">
            <span>
              {
                formatDateTime(props?.row?.original?.inferenceTimeStamp)
                  .formattedDate
              }
            </span>
            <span>
              {
                formatDateTime(props?.row?.original?.inferenceTimeStamp)
                  .formattedTime
              }
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('platform', {
        header: t('correctedTexts.platform') ?? '',
      }),
      columnHelper.accessor('inferenceText', {
        header: t('correctedTexts.text') ?? '',
      }),
      columnHelper.accessor('predictedLabels', {
        header: () => (
          <div className="correctedHierarchy">
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
          <div className="hierarchyLabels">
            {props?.row?.original?.predictedLabels &&
              formatArray(props?.row?.original?.predictedLabels)}
          </div>
        ),
      }),
      columnHelper.accessor('averagePredictedClassesProbability', {
        header: () => (
          <div className="probabilityLabels">
            {t('correctedTexts.predictedConfidenceProbability') ?? ''}
          </div>
        ),
        cell: (props) => (
          <div className="probabilityLabels">
            {props?.row?.original?.averagePredictedClassesProbability}%
          </div>
        ),
        meta: {
          size: '90%',
        },
      }),
      columnHelper.accessor('correctedLabels', {
        header: () => (
          <div className="correctedHierarchy">
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
          <div className="hierarchyLabels">
            {props?.row?.original?.correctedLabels &&
              formatArray(props?.row?.original?.correctedLabels)}
          </div>
        ),
      }),
      columnHelper.accessor('averageCorrectedClassesProbability', {
        header: () => (
          <div className="probabilityLabels">
            {t('correctedTexts.correctedConfidenceProbability') ?? ''}
          </div>
        ),
        cell: (props) => (
          <div className="probabilityLabels">
            {props?.row?.original?.averageCorrectedClassesProbability && (
              <>{props?.row?.original?.averageCorrectedClassesProbability}%</>
            )}
          </div>
        ),
      }),
    ],
    [t]
  );

  const formatArray = (array: string | string[]) => {
    let formatedArray: string[];
    if (typeof array === 'string') {
      try {
        const cleanedInput = array?.replace(/\s+/g, '');
        formatedArray = JSON.parse(cleanedInput);
      } catch (error) {
        console.error('Error parsing input string:', error);
        return '';
      }
    } else {
      formatedArray = array;
    }

    return formatedArray
      .map((item, index) =>
        index === formatedArray?.length - 1 ? item : item + ' ->'
      )
      .join(' ');
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        {isLoading && <SkeletonTable rowCount={5} />}
        {!isLoading && correctedTextData && correctedTextData.length === 0 && (
          <Card>
            <div
              style={{
                width: '100%',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('datasetGroups.detailedView.noData') ?? ''}
            </div>
          </Card>
        )}
        {!isLoading && correctedTextData && correctedTextData.length > 0 && (
          <DataTable
            data={correctedTextData ?? []}
            columns={dataColumns as ColumnDef<string, string>[]}
            pagination={pagination}
            setPagination={(state: PaginationState) => {
              if (
                state.pageIndex === pagination.pageIndex &&
                state.pageSize === pagination.pageSize
              )
                return;
              setPagination({
                pageIndex: state.pageIndex + 1,
                pageSize: state.pageSize,
              });
            }}
            pagesCount={totalPages}
            isClientSide={false}
          />
        )}
      </div>
    </div>
  );
};

export default CorrectedTextsTables;