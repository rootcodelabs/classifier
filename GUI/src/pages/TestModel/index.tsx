import { Button, FormSelect, FormTextarea } from 'components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClass } from 'react-icons/md';
import { formatPredictions } from 'utils/testModelUtil';

const TestModel: FC = () => {
  const { t } = useTranslation();
const testResults={
    predictedClasses:["Police","Special Agency","External","Reports","Annual Report"],
    averageConfidence:89.8,
    predictedProbabilities: [98,82,91,90,88]
}
  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">Test Model</div>
        </div>
        <div className="grey-card">
          <FormSelect label={'Model'} name="" options={[]} placeholder='Choose model'/>
        </div>

        <div style={{ marginTop: '30px' }}>
          <p>Enter Text</p>
          <FormTextarea label="" name="" maxLength={1000} showMaxLength={true} />
        </div>
        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button>Classify</Button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="blue-card">
            <div className="flex">
              <b>{`Predicted Class Hierarchy : `}</b>
              <p>
                {
                  'Police -> Special Agency -> External -> Reports -> Annual Report'
                }
              </p>
            </div>
          </div>
          <div className="blue-card">
            <div className="flex">
              <b>{`Average Confidence : `}</b>
              <p>{'62%'}</p>
            </div>
          </div>
          <div className="blue-card">
            <div>
              <b>{`Class Probabilities : `}</b>
              <ul style={{listStyle:'disc', marginLeft:'30px'}}>
              {formatPredictions(testResults)?.map((prediction)=>{
                return(<li>{prediction}</li>)
              })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestModel;
