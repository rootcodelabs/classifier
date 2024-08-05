import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import dataTypes from '../../../../config/dataTypesConfig.json';
import { MdDehaze, MdDelete } from 'react-icons/md';
import Card from 'components/Card';
import { FormCheckbox, FormInput, FormSelect } from 'components/FormElements';
import { ValidationRule } from 'types/datasetGroups';
import { Link } from 'react-router-dom';
import { isFieldNameExisting } from 'utils/datasetGroupsUtils';

const ItemTypes = {
  ITEM: 'item',
};

const DraggableItem = ({
  item,
  index,
  moveItem,
  setValidationRules,
  validationRuleError,
  validationRules,
}: {
  item: ValidationRule;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
  validationRules?: ValidationRule[];
  setValidationRules: React.Dispatch<React.SetStateAction<ValidationRule[]>>;
  validationRuleError?: boolean;
}) => {
  const [, ref] = useDrag({
    type: ItemTypes.ITEM,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.ITEM,
    hover: (draggedItem: {
        index: number
    }) => {
      if (draggedItem?.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const deleteItem = (idToDelete: string | number) => {
    const updatedItems = validationRules?.filter(
      (item) => item?.id !== idToDelete
    );
    updatedItems && setValidationRules(updatedItems);
  };

  const setIsDataClass = (id: string | number, isDataClass: boolean) => {
    const updatedItems = validationRules?.map((item) =>
      item.id === id ? { ...item, isDataClass: !isDataClass } : item
    );
    updatedItems && setValidationRules(updatedItems);
  };

  const handleChange = useCallback((id: string | number, newValue: string) => {
    setValidationRules((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, fieldName: newValue } : item
      )
    );
  }, []);

  const changeDataType = (id: string | number, value: string) => {
    const updatedItems = validationRules?.map((item) =>
      item.id === id ? { ...item, dataType: value } : item
    );
    updatedItems && setValidationRules(updatedItems);
  };
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
                : validationRuleError &&
                  item.fieldName &&
                  item?.fieldName.toString().toLocaleLowerCase() === 'rowid'
                ? `${item?.fieldName} cannot be used as a field name`
                : item.fieldName &&
                  isFieldNameExisting(validationRules, item?.fieldName)
                ? `${item?.fieldName} alreday exist as field name`
                : ''
            }
          />
          <FormSelect
            label="Data Type"
            name={`dataType ${index}`}
            options={dataTypes}
            defaultValue={item.dataType}
            onSelectionChange={(selection) =>
              changeDataType(item.id, selection?.value ?? "")
            }
            error={
              validationRuleError && !item.dataType ? 'Select a data type' : ''
            }
          />
          <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
            <Link
              to={''}
              style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
              onClick={() => deleteItem(item.id)}
              className="link"
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
              style={{ width: '150px' }}
            />
            <MdDehaze className="link" size={30} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DraggableItem;
