import { forwardRef, InputHTMLAttributes, PropsWithChildren, useId } from 'react';
import clsx from 'clsx';
import './FormInput.scss';
import { CHAT_INPUT_LENGTH } from 'constants/config';

type InputProps = PropsWithChildren<InputHTMLAttributes<HTMLInputElement>> & {
  label: string;
  name: string;
  hideLabel?: boolean;
  maxLength?: number;
  error?: string;
};

const FormInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, name, disabled, hideLabel, maxLength, error, children, ...rest },
    ref
  ) => {
    const id = useId();

    const inputClasses = clsx('input', disabled && 'input--disabled');

    return (
      <div className={inputClasses}>
        {label && !hideLabel && (
          <label htmlFor={id} className="input__label">
            {label}
          </label>
        )}
        <div className="input__wrapper">
          <input
            className={inputClasses}
            name={name}
            maxLength={CHAT_INPUT_LENGTH}
            id={id}
            ref={ref}
            aria-label={hideLabel ? label : undefined}
            {...rest}
          />
          {error && <p className="input__inline_error">{error}</p>}
          {children}
        </div>
      </div>
    );
  }
);

export default FormInput;
