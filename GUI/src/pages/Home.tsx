import { FC, useState } from "react";
import { Button, Tooltip } from "../components";
import Checkbox from "../components/atoms/CheckBox";
import RadioButton from "../components/atoms/RadioButton";

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
    </div>
  );
};

export default Home;
