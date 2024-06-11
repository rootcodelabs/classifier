import React from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { MdCheck } from "react-icons/md";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
}) => {
  return (
    <label className="flex items-center space-x-2">
      <RadixCheckbox.Root
        className={`w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md ${checked? 'bg-blue-800':'bg-white'}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <RadixCheckbox.Indicator>
          <MdCheck className="w-4 h-4 text-white" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
