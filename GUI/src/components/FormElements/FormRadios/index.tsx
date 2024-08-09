import { FC, useId } from 'react';
import './FormRadios.scss';

type FormRadiosType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  items: {
    label: string;
    value: string;
  }[];
  onChange: (selectedValue: string) => void;
  selectedValue?: string; // New prop for the selected value
  isStack?: boolean;
  error?: string;
};

const FormRadios: FC<FormRadiosType> = ({
  label,
  name,
  hideLabel,
  items,
  onChange,
  selectedValue, // Use selectedValue to control the selected radio button
  isStack = false,
  error,
}) => {
  const id = useId();

  return (
    <div>
      <div>
        <fieldset className="radios" role="group">
          {label && !hideLabel && (
            <label className="radios__label">{label}</label>
          )}
          <div className={isStack ? 'radios__stack' : 'radios__wrapper'}>
            {items?.map((item, index) => (
              <div key={`${item.value}-${index}`} className="radios__item">
                <input
                  type="radio"
                  name={name}
                  id={`${id}-${item.value}`}
                  value={item.value}
                  checked={selectedValue === item.value} // Check if the radio button should be selected
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
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

export default FormRadios;




