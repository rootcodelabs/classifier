import { FC } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormInput, FormSelect, Switch } from 'components';
import Jira from 'assets/Jira';

const DatasetGroups: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="container">
        <div className="title_container">
          <div className="title">Dataset Groups</div>
          <Button appearance="primary" size="m">
            Create Dataset Group
          </Button>
        </div>
        <div>
          <div className="search-panel">
            <FormInput
              placeholder="search dataset groups"
              name="search"
              label=""
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Filter by alphabetical order"
              options={[
                { label: 'A-Z', value: 'az' },
                { label: 'Z-A', value: 'za' },
              ]}
            />
          </div>
          <div className="bordered-card" style={{padding:"20px"}}>
            <div className="bordered-card">
              <div className='row' style={{float:"right"}}>
                <Switch label="" />
              </div>
              <div >
                  <Jira/> </div>
                  <div style={{textAlign:"center"}}>
                  Dataset 1     </div>
                           
              <div className="status">
                <span className="dot"></span> connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatasetGroups;
