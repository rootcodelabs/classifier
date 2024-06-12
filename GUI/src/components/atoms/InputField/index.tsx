import React from 'react';
import * as RadixLabel from '@radix-ui/react-label';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, error }) => {
  return (
    <div className="flex flex-col space-y-2">
      <RadixLabel.Root className="text-gray-700">{label}</RadixLabel.Root>
      <input
        className={`p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-800`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default InputField;
