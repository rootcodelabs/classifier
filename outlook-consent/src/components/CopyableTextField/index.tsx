import React, { useRef, useState } from 'react';
import "./CopyableTextField.scss"

const CopyableTextField: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = () => {
    if (textFieldRef.current) {
      textFieldRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }} className='copyable-text-field'>
      <input
        type="text"
        ref={textFieldRef}
        value={value}
        readOnly
        style={{ marginRight: '10px' }}
      />
      <button onClick={copyToClipboard}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default CopyableTextField;
