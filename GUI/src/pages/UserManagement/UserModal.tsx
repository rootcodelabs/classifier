import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button, Dialog, FormInput, Track } from 'components';
import { User, UserDTO } from 'types/user';
import { checkIfUserExists, createUser, editUser } from 'services/users';
import { useToast } from 'hooks/useToast';
import Select, { components } from 'react-select';
import './SettingsUsers.scss';
import { FC, useMemo } from 'react';
import { ROLES } from 'enums/roles';
import { userManagementQueryKeys } from 'utils/queryKeys';
import { ButtonAppearanceTypes, ToastTypes } from 'enums/commonEnums';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

type UserModalProps = {
  onClose: () => void;
  user?: User | undefined;
  isModalOpen?: boolean;
};

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      {props.selectProps.menuIsOpen ? <FaChevronUp /> : <FaChevronDown />}
    </components.DropdownIndicator>
  );
};

const UserModal: FC<UserModalProps> = ({ onClose, user, isModalOpen }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<UserDTO>({
    defaultValues: {
      useridcode: user?.useridcode,
      authorities: user?.authorities,
      displayName: user?.fullName,
      csaTitle: user?.csaTitle,
      csaEmail: user?.csaEmail,
      fullName: user?.fullName,
    },
  });

  const roles = useMemo(
    () => [
      { label: t('roles.ROLE_ADMINISTRATOR'), value: ROLES.ROLE_ADMINISTRATOR },
      {
        label: t('roles.ROLE_MODEL_TRAINER'),
        value: ROLES.ROLE_MODEL_TRAINER,
      },
    ],
    [t]
  );

  const userCreateMutation = useMutation({
    mutationFn: (data: UserDTO) => createUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        userManagementQueryKeys.getAllEmployees()
      );
      toast.open({
        type: ToastTypes.SUCCESS,
        title: t('global.notification'),
        message: t('toast.success.newUserAdded'),
      });
      onClose();
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: ToastTypes.ERROR,
        title: t('global.notificationError'),
        message: error?.message ?? '',
      });
    },
  });

  const userEditMutation = useMutation({
    mutationFn: ({
      id,
      userData,
    }: {
      id: string | number;
      userData: UserDTO;
    }) => editUser(id, userData),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        userManagementQueryKeys.getAllEmployees()
      );
      toast.open({
        type: ToastTypes.SUCCESS,
        title: t('global.notification'),
        message: t('toast.success.userUpdated'),
      });
      onClose();
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: ToastTypes.ERROR,
        title: t('global.notificationError'),
        message: error?.message ?? '',
      });
    },
  });

  const checkIfUserExistsMutation = useMutation({
    mutationFn: ({ userData }: { userData: UserDTO }) =>
      checkIfUserExists(userData),
    onSuccess: async (data) => {
      if (data.response === 'true') {
        toast.open({
          type: ToastTypes.ERROR,
          title: t('global.notificationError'),
          message: t('userManagement.addUser.userExists'),
        });
      } else {
        createNewUser();
      }
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: ToastTypes.ERROR,
        title: t('global.notificationError'),
        message: error?.message,
      });
    },
  });

  const createNewUser = handleSubmit((userData) =>
    userCreateMutation.mutate(userData)
  );

  const handleUserSubmit = handleSubmit((data) => {
    if (user) userEditMutation.mutate({ id: user.useridcode, userData: data });
    else checkIfUserExistsMutation.mutate({ userData: data });
  });

  return (
    <Dialog
      isOpen={isModalOpen}
      title={
        user
          ? t('userManagement.addUser.editUserModalTitle')
          : t('userManagement.addUser.addUserModalTitle')
      }
      onClose={onClose}
      footer={
        <div className="button-wrapper">
          <Button
            appearance={ButtonAppearanceTypes.SECONDARY}
            onClick={onClose}
          >
            {t('global.cancel')}
          </Button>
          <Button
            onClick={handleUserSubmit}
            disabled={
              !isValid ||
              !isDirty ||
              userEditMutation.isLoading ||
              checkIfUserExistsMutation.isLoading || 
              userCreateMutation.isLoading
            }
          >
            {t('global.confirm')}
          </Button>
        </div>
      }
    >
      <Track direction="vertical" gap={16} align="right">
        <FormInput
          defaultValue={`${user?.firstName ?? ''} ${
            user?.lastName ?? ''
          }`.trim()}
          {...register('fullName', {
            required: t('userManagement.addUser.nameRequired') ?? '',
          })}
          label={t('userManagement.addUser.name')}
          placeholder={t('userManagement.addUser.namePlaceholder') ?? ''}
          maxLength={49}
        />
        {errors?.fullName && (
          <span className="error-span">{errors?.fullName?.message}</span>
        )}

        <Controller
          control={control}
          name="authorities"
          rules={{ required: t('userManagement.addUser.roleRequired') ?? '' }}
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <div className="multiSelect">
              <label className="multiSelect__label">
                {t('userManagement.addUser.role')}
              </label>
              <div className="multiSelect__wrapper">
                <Select
                  name={name}
                  maxMenuHeight={165}
                  ref={ref}
                  onBlur={onBlur}
                  required={true}
                  options={roles}
                  defaultValue={user?.authorities.map((v) => {
                    return { label: t(`roles.${v}`), value: v };
                  })}
                  isMulti={true}
                  placeholder={t('userManagement.addUser.rolePlaceholder')}
                  onChange={onChange}
                  components={{ DropdownIndicator }}
                />
              </div>
            </div>
          )}
        />
        {errors?.authorities && (
          <span className="error-span">{errors?.authorities?.message}</span>
        )}
        {!user && (
          <FormInput
            {...register('useridcode', {
              required: t('userManagement.addUser.idCodeRequired') ?? '',
              pattern: {
                value: /\bEE\d+\b/,
                message: t('userManagement.addUser.invalidIdCode'),
              },
            })}
            label={t('userManagement.addUser.personalId')}
            placeholder={
              t('userManagement.addUser.personalIdPlaceholder') ?? ''
            }
          />
        )}

        {!user && errors?.useridcode && (
          <span className="error-span">{errors?.useridcode?.message}</span>
        )}

        <FormInput
          {...register('csaTitle')}
          label={t('userManagement.addUser.title')}
          placeholder={t('userManagement.addUser.titlePlaceholder') ?? ''}
        />

        <FormInput
          {...register('csaEmail', {
            required: t('userManagement.addUser.emailRequired') ?? '',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('userManagement.addUser.invalidemail'),
            },
          })}
          label={t('userManagement.addUser.email')}
          type="email"
          placeholder={t('userManagement.addUser.emailPlaceholder') ?? ''}
        />
        {errors?.csaEmail && (
          <span className="error-span">{errors?.csaEmail?.message}</span>
        )}
      </Track>
    </Dialog>
  );
};

export default UserModal;