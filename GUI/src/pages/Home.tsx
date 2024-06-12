import { FC, useState } from "react";
import { Button, Tooltip } from "../components";
import Checkbox from "../components/atoms/CheckBox";
import RadioButton from "../components/atoms/RadioButton";
import InputField from "../components/atoms/InputField";

const Home: FC = () => {
  //check box
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };

  //radio button
  const [selectedValue, setSelectedValue] = useState("option1");

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
  };

  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
  ];

  //input field
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Example validation
    if (value.length < 5) {
      setError('Input must be at least 5 characters long');
    } else {
      setError('');
    }
  };

  return (
    <div className="text-black">
      <div> This is list of components</div>
      <div className="p-2">
        <Tooltip content="test">
          <span>Tooltip</span>
        </Tooltip>
      </div>
      <div className="p-2">
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleCheckboxChange}
          label="Checkbox"
        />{" "}
      </div>

      <div className="p-2">
        <RadioButton
          options={options}
          value={selectedValue}
          onValueChange={handleValueChange}
          name="example"
        />{" "}
      </div>
      <div className="p-2">
        <Button appearance="primary" size="m">Button</Button>
      </div>
      <div className="p-4">
      <InputField
        label="Input Field"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter your username"
        error={error}
      />
    </div>
    </div>
  );
};

export default Home;
