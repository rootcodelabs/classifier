import { FormInput } from 'components/FormElements';
import React, {
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  Ref,
  useRef,
} from 'react';

type FileUploadProps = {
  onFileSelect: (file: File | undefined) => void;
  accept?: string | string[];
  disabled?: boolean;
};

export type FileUploadHandle = {
  clearFile: () => void;
};

const FileUpload = forwardRef(
  (props: FileUploadProps, ref: Ref<FileUploadHandle>) => {
    const { onFileSelect, accept, disabled } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      clearFile() {
        onFileSelect(undefined);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    }));

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : undefined;
      onFileSelect(file);
    };

    const restrictFormat = (accept: string | string[]) => {
      if (typeof accept === 'string') {
        console.log("hii")
        if (accept === 'json') return '.json';
        else if (accept === 'xlsx') return '.xlsx';
        else if (accept === 'yaml') return '.yaml, .yml';
        return '';
      } else {
        return accept.map(ext => `.${ext}`).join(', ');
      }

    };

    return (
      <div className="file-upload">
        <FormInput label="" name="" style={{ display: 'none' }}>
          <input
            type="file"
            onChange={handleFileChange}
            accept={restrictFormat(accept ?? '')}
            disabled={disabled}
            ref={fileInputRef}
          />
        </FormInput>
        <button
          type="button"
          onClick={() => {
            onFileSelect(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        >
          Clear
        </button>
      </div>
    );
  }
);

export default FileUpload;
