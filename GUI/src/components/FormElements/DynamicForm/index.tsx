import React from 'react';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import Button from 'components/Button';
import Track from 'components/Track';

type DynamicFormProps = {
  formData: { [key: string]: string };
  onSubmit: (data: any) => void;
  setPatchUpdateModalOpen: React.Dispatch<React.SetStateAction<boolean>>
};

const DynamicForm: React.FC<DynamicFormProps> = ({ formData, onSubmit,setPatchUpdateModalOpen }) => {
  const { register, handleSubmit } = useForm();

  const renderInput = (key: string, type: string) => {
    

    return (
      <FormInput
        label=""
        {...register(key)}
        type="text"
        placeholder={key}
        defaultValue={formData[key]}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {Object.keys(formData).map((key) => (
        <div key={key}>
          {key.toLowerCase() !== 'rowid' && (
            <div style={{ marginBottom: '15px' }}>
              <label>{key}</label>
              {renderInput(key, formData[key])}
            </div>
          )}
        </div>
      ))}
      <Track className="dialog__footer" gap={16} justify="end">
        <div className="flex-grid">
          <Button appearance="secondary" onClick={()=>setPatchUpdateModalOpen(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </Track>
    </form>
  );
};

export default DynamicForm;
