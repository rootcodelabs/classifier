import React from 'react';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';

interface RadioButtonProps {
  options: { label: string, value: string }[];
  value: string;
  onValueChange: (value: string) => void;
  name: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({ options, value, onValueChange, name }) => {
  return (
    <RadixRadioGroup.Root
      className="flex flex-col space-y-2"
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((option, index) => (
        <label key={index} className="flex items-center space-x-2">
          <RadixRadioGroup.Item
            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded-full"
            value={option.value}
            id={`${name}-${option.value}`}
          >
            <RadixRadioGroup.Indicator className="w-4 h-4 bg-blue-600 rounded-full" />
          </RadixRadioGroup.Item>
          <span>{option.label}</span>
        </label>
      ))}
    </RadixRadioGroup.Root>
  );
};

export default RadioButton;
