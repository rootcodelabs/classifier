import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, FormInput, FormRadios } from 'components';
import LabelChip from 'components/LabelChip';
import FileUpload, { FileUploadHandle } from 'components/FileUpload';
import { useForm } from 'react-hook-form';
import importOptions from '../../config/importOptionsConfig.json';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addStopWord,
  deleteStopWord,
  deleteStopWords,
  getStopWords,
  importStopWords,
} from 'services/datasets';
import { stopWordsQueryKeys } from 'utils/queryKeys';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { StopWordImportOptions } from 'enums/datasetEnums';
import { useDialog } from 'hooks/useDialog';
import { AxiosError } from 'axios';

const StopWords: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { open } = useDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importOption, setImportOption] = useState('');
  const [file, setFile] = useState<File | null>();
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [addedStopWord, setAddedStopWord] = useState('');

  const { register, setValue, watch } = useForm({
    defaultValues: {
      stopWord: addedStopWord,
    },
  });

  const { data: stopWordsData, refetch: stopWordRefetch } = useQuery(
    stopWordsQueryKeys.GET_ALL_STOP_WORDS(),
    () => getStopWords()
  );

  const watchedStopWord = watch('stopWord');

  const removeStopWord = (wordToRemove: string) => {
    deleteStopWordMutation.mutate({ stopWords: [wordToRemove] });
  };

  const addStopWordMutation = useMutation({
    mutationFn: (data: { stopWords: string[] }) => addStopWord(data),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries(
        stopWordsQueryKeys.GET_ALL_STOP_WORDS()
      );
    },
    onError: () => {},
  });

  const deleteStopWordMutation = useMutation({
    mutationFn: (data: { stopWords: string[] }) => deleteStopWord(data),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries(
        stopWordsQueryKeys.GET_ALL_STOP_WORDS()
      );
    },
    onError: () => {},
  });

  const importMutationSuccessFunc = async () => {
    setIsModalOpen(false);
    open({
      title: t('stopWords.importModal.successTitle') ?? '',
      content: <p>{t('stopWords.importModal.successDesc') ?? ''}</p>,
    });
    setFile(null);
    await queryClient.invalidateQueries(
      stopWordsQueryKeys.GET_ALL_STOP_WORDS()
    );

    if (importOption === StopWordImportOptions.DELETE) {
      stopWordRefetch();
    }
  };

  const importStopWordsMutation = useMutation({
    mutationFn: (file: File) => importStopWords(file),
    onSuccess: async () => {
      setIsModalOpen(false);
      importMutationSuccessFunc();
    },
    onError: async (error: AxiosError) => {
      setIsModalOpen(true);
      open({
        title: t('stopWords.importModal.unsuccessTitle') ?? '',
        content: <p>{t('stopWords.importModal.unsuccessDesc') ?? ''}</p>,
      });
    },
  });

  const deleteStopWordsMutation = useMutation({
    mutationFn: (file: File) => deleteStopWords(file),
    onSuccess: async () => {
      setIsModalOpen(false);
      importMutationSuccessFunc();
    },
    onError: async (error: AxiosError) => {
      setIsModalOpen(true);
      open({
        title: t('stopWords.importModal.unsuccessTitle') ?? '',
        content: <p>{t('stopWords.importModal.unsuccessDesc') ?? ''}</p>,
      });
    },
  });

  const handleFileSelect = (file: File | null) => {
    if (file) setFile(file);
  };

  const handleStopWordFileOperations = () => {
    if (
      importOption === StopWordImportOptions.ADD &&
      file &&
      file !== undefined
    )
      importStopWordsMutation.mutate(file);
    else if (
      importOption === StopWordImportOptions.DELETE &&
      file &&
      file !== undefined
    )
      deleteStopWordsMutation.mutate(file);
  };

  useEffect(() => {
    if (
      importStopWordsMutation.isLoading &&
      !importStopWordsMutation.isSuccess
    ) {
      setIsModalOpen(false);
      open({
        title: t('stopWords.importModal.inprogressTitle') ?? '',
        content: <p>{t('stopWords.importModal.inprogressDesc') ?? ''}</p>,
      });
    }
  }, [importStopWordsMutation]);

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">{t('stopWords.title') ?? ''}</div>
          <Button onClick={() => setIsModalOpen(true)}>
            {t('stopWords.import') ?? ''}
          </Button>
        </div>
        <Card>
          {stopWordsData?.map((word: string) => (
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
              placeholder={t('stopWords.stopWordInputHint') ?? ''}
            />
            <Button
              disabled={watchedStopWord === ''}
              onClick={() => {
                setValue('stopWord', '');
                addStopWordMutation.mutate({ stopWords: [watchedStopWord] });
              }}
            >
              {t('stopWords.add') ?? ''}
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
            title={t('stopWords.importModal.title') ?? ''}
            footer={
              <div className="flex-grid">
                <Button
                  appearance={ButtonAppearanceTypes.SECONDARY}
                  onClick={() => {
                    setIsModalOpen(false);
                    setImportOption('');
                  }}
                >
                  {t('global.cancel') ?? ''}
                </Button>
                <Button
                  onClick={handleStopWordFileOperations}
                  disabled={
                    importOption === '' || file === null || file === undefined
                  }
                >
                  {t('stopWords.importModal.importButton') ?? ''}
                </Button>
              </div>
            }
          >
            <div>
              <p>{t('stopWords.importModal.selectionLabel') ?? ''}</p>
              <FormRadios
                isStack={true}
                name="importOption"
                label=""
                onChange={setImportOption}
                items={importOptions}
                selectedValue={importOption}
              />
              <div style={{ margin: '20px 0px' }}></div>
              <p>{t('stopWords.importModal.attachements') ?? ''}</p>
              <FileUpload
                ref={fileUploadRef}
                disabled={importOption === ''}
                onFileSelect={handleFileSelect}
              />
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default StopWords;