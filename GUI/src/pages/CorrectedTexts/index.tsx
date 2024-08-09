import React, { FC, useState } from 'react';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { Button, FormInput, FormSelect } from 'components';
import { useNavigate } from 'react-router-dom';
import { formattedArray } from 'utils/commonUtilts';
import CorrectedTextsTables from 'components/molecules/CorrectedTextTables/CorrectedTextsTables';

const CorrectedTexts: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [enableFetch, setEnableFetch] = useState(true);

  const [filters, setFilters] = useState({
    platform: 'all',
    sort: 'asc',
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
            // setNewUserModal(true);
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
              placeholder={t('correctedTexts.platform') ?? ''}
              options={[
                { label: 'Jira', value: 'jira' },
                { label: 'Outlook', value: 'outlook' },
              ]}
              onSelectionChange={(selection) =>
                handleFilterChange('platform', selection?.value ?? '')
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
                handleFilterChange('sort', selection?.value ?? '')
              }
            />
          </div>
          <Button onClick={() => setEnableFetch(true)}>
            {t('global.search')}
          </Button>
          <Button
            onClick={() => {
              navigate(0);
            }}
          >
            {t('global.reset')}
          </Button>
        </div>

        <CorrectedTextsTables filters={filters} enableFetch={enableFetch} />
      </div>
    </div>
  );
};

export default CorrectedTexts;
