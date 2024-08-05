import { ChangeEvent, FC, useId, useState } from 'react';

import './FormCheckboxes.scss';

type FormCheckboxesType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  onValuesChange?: (values: Record<string, string[]>) => void;
  items: {
    label: string;
    value: string;
  }[];
  isStack?: boolean;
  error?: string;
};

const FormCheckboxes: FC<FormCheckboxesType> = ({
  label,
  name,
  hideLabel,
  onValuesChange,
  items,
  isStack = true,
  error,
}) => {
  const id = useId();
  const [selectedValues, setSelectedValues] = useState<
    Record<string, string[]>
  >({ [name]: [] });

  const handleValuesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;

    setSelectedValues((prevState) => {
      const newValues = checked
        ? [...prevState[name], value] // Add the checked value to the array
        : prevState[name].filter((v: string) => v !== value); // Remove the unchecked value from the array

      const updatedValues = { ...prevState, [name]: newValues };

      if (onValuesChange) onValuesChange(updatedValues);

      return updatedValues;
    });
  };

  return (
    <div>
      <div>
        <fieldset className="checkboxes" role="group">
          {label && !hideLabel && (
            <label className="checkboxes__label">{label}</label>
          )}
          <div className={isStack ? 'checkboxes__wrapper' : 'checkboxes__row'}>
            {items.map((item, index) => (
              <div key={`${item.value}-${index}`} className="checkboxes__item">
                <input
                  type="checkbox"
                  name={name}
                  id={`${id}-${item.value}`}
                  value={item.value}
                  onChange={handleValuesChange}
                  checked={selectedValues[name].includes(item.value)} // Manage checkbox state
                />
                <label htmlFor={`${id}-${item.value}`}>{item.label}</label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>{error && <p className="input__inline_error">{error}</p>}</div>
    </div>
  );
};

export default FormCheckboxes;
