import React, { FC, PropsWithChildren, useCallback, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dataTypes from '../../../config/dataTypesConfig.json';
import { MdDehaze, MdDelete, MdExpand } from 'react-icons/md';
import Card from 'components/Card';
import { FormCheckbox, FormInput, FormSelect } from 'components/FormElements';
import Button from 'components/Button';
import { transformValidationRules } from 'utils/datasetGroupsUtils';
import { ValidationRule } from 'types/datasetGroups';

const ItemTypes = {
  ITEM: 'item',
};

type ValidationRulesProps = {
  validationRules?: ValidationRule[];
  setValidationRules: React.Dispatch<React.SetStateAction<ValidationRule[]>>;
  validationRuleError?: boolean;
  setValidationRuleError: React.Dispatch<React.SetStateAction<boolean>>;
};
const ValidationCriteria: FC<PropsWithChildren<ValidationRulesProps>> = ({
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

  const handleChange = useCallback((id, newValue) => {
    setValidationRules((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, fieldName: newValue } : item
      )
    );
  }, []);

  const changeDataType = (id, value) => {
    const updatedItems = validationRules.map((item) =>
      item.id === id ? { ...item, dataType: value } : item
    );
    setValidationRules(updatedItems);
  };

  const DraggableItem = ({ item, index, moveItem }) => {
    const [, ref] = useDrag({
      type: ItemTypes.ITEM,
      item: { index },
    });

    const [, drop] = useDrop({
      accept: ItemTypes.ITEM,
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveItem(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    });

    return (
      <div ref={(node) => ref(drop(node))}>
        <Card>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <FormInput
              label="Field Name"
              placeholder="Enter Field Name"
              name={`fieldName ${index}`}
              defaultValue={item.fieldName}
              onBlur={(e) => handleChange(item.id, e.target.value)}
              error={
                validationRuleError && !item.fieldName
                  ? 'Enter a field name'
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
              <a
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                onClick={() => deleteItem(item.id)}
                className='link'
              >
                <MdDelete />
                Delete
              </a>
              <FormCheckbox
                label=""
                item={{
                  label: 'Data Class',
                  value: 'active',
                }}
                name="dataClass"
                checked={item.isDataClass}
                onChange={() => setIsDataClass(item.id, item.isDataClass)}
              />
              <MdDehaze className='link' size={50} />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const moveItem = (fromIndex, toIndex) => {
    const updatedItems = Array.from(validationRules);
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
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
    <DndProvider backend={HTML5Backend}>
      <div className="title-sm">Create Validation Rule</div>
      {validationRules.map((item, index) => (
        <DraggableItem
          key={item.id}
          index={index}
          item={item}
          moveItem={moveItem}
        />
      ))}
      <div className="flex" style={{ justifyContent: 'end' }}>
        <Button onClick={addNewClass}>Add Class</Button>
      </div>
      
    </DndProvider>
  );
};

export default ValidationCriteria;
