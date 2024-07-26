import React, { FC, PropsWithChildren, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dataTypes from '../../../config/dataTypesConfig.json';
import { MdAdd, MdDehaze, MdDelete } from 'react-icons/md';
import Card from 'components/Card';
import { FormCheckbox, FormInput, FormSelect } from 'components/FormElements';
import Button from 'components/Button';
import { ValidationRule } from 'types/datasetGroups';
import { Link } from 'react-router-dom';
import { isFieldNameExisting } from 'utils/datasetGroupsUtils';

type ValidationRulesProps = {
  validationRules?: ValidationRule[];
  setValidationRules: React.Dispatch<React.SetStateAction<ValidationRule[] |undefined>>;
  validationRuleError?: boolean;
  setValidationRuleError: React.Dispatch<React.SetStateAction<boolean>>;
};
const ValidationCriteriaRowsView: FC<PropsWithChildren<ValidationRulesProps>> = ({
  validationRules,
  setValidationRules,
  setValidationRuleError,
  validationRuleError,
}) => {
  const setIsDataClass = (id, isDataClass) => {
    const updatedItems = validationRules.map((item) =>
      item.id === id ? { ...item, isDataClass: !isDataClass } : item
    );
    setValidationRules(updatedItems);
  };

  const changeName = (id, newValue) => {
    setValidationRules((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, fieldName: newValue } : item
      )
    );

    if(isFieldNameExisting(validationRuleError,newValue))
      setValidationRuleError(true);
    else
    setValidationRuleError(false)
  }

  const changeDataType = (id, value) => {
    const updatedItems = validationRules.map((item) =>
      item.id === id ? { ...item, dataType: value } : item
    );
    setValidationRules(updatedItems);
  };

  const addNewClass = () => {
    setValidationRuleError(false)
    const newId = validationRules[validationRules?.length - 1]?.id + 1;
    
    const updatedItems = [
      ...validationRules,
      { id: newId, fieldName: '', dataType: '', isDataClass: false },
    ];
    

    setValidationRules(updatedItems);
  };

  const deleteItem = (idToDelete) => {
    const updatedItems = validationRules.filter(
      (item) => item.id !== idToDelete
    );
    setValidationRules(updatedItems);
  };

  return (
    <div style={{margin:"-16px"}}>
      {validationRules?.map((item, index) => (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center',padding:"25px",background:`${index%2===1?`#F9F9F9`:`#FFFFFF`}` }}>
        <FormInput
        key={index}
          label="Field Name"
          placeholder="Enter Field Name"
          name={`fieldName ${index}`}
          defaultValue={item.fieldName}
          onBlur={(e) => changeName(item.id, e.target.value)}
          error={
            validationRuleError && !item.fieldName
              ? 'Enter a field name'
              : validationRuleError &&
                item.fieldName &&
                item?.fieldName.toString().toLocaleLowerCase() === 'rowid'
              ? `${item?.fieldName} cannot be used as a field name`
              : item.fieldName && isFieldNameExisting(validationRules,item?.fieldName)?`${item?.fieldName} alreday exist as field name`
              : ''
          }
        />
        <FormSelect
          label="Data Type"
          name={`dataType ${index}`}
          options={dataTypes}
          defaultValue={item.dataType}
          onSelectionChange={(selection) =>
            changeDataType(item.id, selection?.value)
          }
          error={
            validationRuleError && !item.dataType
              ? 'Select a data type'
              : ''
          }
        />
        <div
          style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}
        >
          <Link
          to={""}
            style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
            onClick={() => addNewClass()}
            className='link'
          >
            <MdAdd />
            Add
          </Link>
          <Link
          to={""}
            style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
            onClick={() => deleteItem(item.id)}
            className='link'
          >
            <MdDelete />
            Delete
          </Link>
          <FormCheckbox
            label=""
            item={{
              label: 'Data Class',
              value: 'active',
            }}
            name="dataClass"
            checked={item.isDataClass}
            onChange={() => setIsDataClass(item.id, item.isDataClass)}
            style={{width:"150px"}}
          />
        </div>
      </div>
      ))}
     
      
    </div>
  );
};

export default ValidationCriteriaRowsView;
