import { FormInput } from 'components/FormElements';
import React, {
  useState,
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react';

type FileUploadProps = {
  label?: string;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
};

export type FileUploadHandle = {
  clearFile: () => void;
};

const FileUpload = forwardRef(
  (props: FileUploadProps, ref: Ref<FileUploadHandle>) => {
    const { onFileSelect, accept,disabled } = props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useImperativeHandle(ref, () => ({
      clearFile() {
        setSelectedFile(null);
        onFileSelect(null);
      },
    }));

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      setSelectedFile(file);
      onFileSelect(file);
    };

    const restrictFormat = (accept: string) => {
      if (accept === 'json') return '.json';
      else if (accept === 'xlsx') return '.xlsx';
      else if (accept === 'yaml') return '.yaml, .yml';
    };

    return (
      <div className="file-upload">
        <FormInput label="" name="" style={{ display: 'none' }}>
          <input
            type="file"
            onChange={handleFileChange}
            accept={restrictFormat(accept ?? '')}
            disabled={disabled}
          />
        </FormInput>
        <button type="button" onClick={() => setSelectedFile(null)}>
          Clear
        </button>
      </div>
    );
  }
);

export default FileUpload;
