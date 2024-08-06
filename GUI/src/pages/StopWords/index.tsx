import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, FormInput, FormRadios } from 'components';
import LabelChip from 'components/LabelChip';
import FileUpload from 'components/FileUpload';
import { useForm } from 'react-hook-form';
import importOptions from '../../config/importOptionsConfig.json';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addStopWord, deleteStopWord, getStopWords } from 'services/datasets';

const StopWords: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importOption, setImportOption] = useState('');
  const [file, setFile] = useState('');

  const [addedStopWord, setAddedStopWord] = useState('');

  const { register, setValue, watch } = useForm({
    defaultValues: {
      stopWord: addedStopWord,
    },
  });

  const { data: stopWordsData } = useQuery(['datasetgroups/stopwords'], () =>
    getStopWords()
  );

  const watchedStopWord = watch('stopWord');

  const removeStopWord = (wordToRemove: string) => {
    deleteStopWordMutation.mutate({ stopWords: [wordToRemove] });
  };


  const addStopWordMutation = useMutation({
    mutationFn: (data) => addStopWord(data),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries(['datasetgroups/stopwords']);
      
    },
    onError: () => {},
  });

  const deleteStopWordMutation = useMutation({
    mutationFn: (data) => deleteStopWord(data),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries(['datasetgroups/stopwords']);
      
    },
    onError: () => {},
  });

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">Stop Words</div>
          <Button onClick={() => setIsModalOpen(true)}>
            Import stop words
          </Button>
        </div>
        <Card>
          {stopWordsData?.map((word) => (
            <LabelChip
              key={word}
              label={word}
              onRemove={() => removeStopWord(word)}
            />
          ))}
          <div className="flex-grid" style={{ marginTop: '15px' }}>
            <FormInput
              {...register('stopWord')}
              value={watchedStopWord}
              name="stopWord"
              label=""
              placeholder="Enter stop word"
              
            />
            <Button
              onClick={() => {
                setValue('stopWord', '');
                addStopWordMutation.mutate({ stopWords: [watchedStopWord] });
              }}
            >
              Add
            </Button>
          </div>
        </Card>
        {isModalOpen && (
          <Dialog
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setImportOption('');
            }}
            title={'Import stop words'}
            footer={
              <div className="flex-grid">
                <Button
                  appearance="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setImportOption('');
                  }}
                >
                  Cancel
                </Button>
                <Button>Import</Button>
              </div>
            }
          >
            <div>
              <p>Select the option below</p>
              <FormRadios
                isStack={true}
                name="importOption"
                label=""
                onChange={setImportOption}
                items={importOptions}
                selectedValue={importOption}
              />
              <div style={{ margin: '20px 0px' }}></div>
              <p>Attachments (TXT, XLSX, YAML, JSON)</p>
              <FileUpload
                disabled={importOption === ''}
                onFileSelect={(selectedFile) =>
                  setFile(selectedFile?.name ?? '')
                }
              />
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default StopWords;
