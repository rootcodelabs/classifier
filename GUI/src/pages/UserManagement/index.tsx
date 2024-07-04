import { FC, useMemo, useState } from 'react';
import {
  Button,
  DataTable,
  Dialog,
  FormInput,
  FormMultiselect,
  Icon,
} from '../../components';
import users from '../../config/users.json';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { User } from '../../types/user';
import { MdOutlineDeleteOutline, MdOutlineEdit } from 'react-icons/md';
import './UserManagement.scss';
import roles from '../../config/rolesConfig.json';
import { useTranslation } from 'react-i18next';
import { ROLES } from 'utils/constants';

const UserManagement: FC = () => {
  const columnHelper = createColumnHelper<User>();
  const [newUserModal, setNewUserModal] = useState(false);
  const [editableRow, setEditableRow] = useState<User | null>(null);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(
    null
  );
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    idCode: '',
    csaTitle: '',
    csaEmail: '',
    authorities: [],
  });

  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    idCode: '',
    csaTitle: '',
    csaEmail: '',
    authorities: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleMultiselectChange = (name: string, value: any) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const validateForm = () => {
    let errors: any = {};
    if (!formValues.firstName) errors.firstName = 'First name is required';
    if (!formValues.lastName) errors.lastName = 'Last name is required';
    if (!formValues.idCode) errors.idCode = 'Personal ID is required';
    if (!formValues.csaTitle) errors.csaTitle = 'Title is required';
    if (!formValues.csaEmail) errors.csaEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formValues.csaEmail))
      errors.csaEmail = 'Email is invalid';
    if (!formValues.authorities.length)
      errors.authorities = 'At least one role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted successfully', formValues);
      // Handle form submission logic
    }
  };

  const editView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => {
        setEditableRow(props.row.original);
        setFormValues(props.row.original);
      }}
    >
      <Icon icon={<MdOutlineEdit />} />
      {'Edit'}
    </Button>
  );

  const deleteView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => setDeletableRow(props.row.original.idCode)}
    >
      <Icon icon={<MdOutlineDeleteOutline />} />
      {'Delete'}
    </Button>
  );

  const usersColumns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`,
        {
          id: `name`,
          header: t('settings.users.name') ?? '',
        }
      ),
      columnHelper.accessor('idCode', {
        header: t('settings.users.idCode') ?? '',
      }),
      columnHelper.accessor(
        (data: { authorities: ROLES[] }) => {
          const output: string[] = [];
          data.authorities?.map?.((role) => {
            return output.push(t(`roles.${role}`));
          });
          return output;
        },
        {
          header: t('settings.users.role') ?? '',
          cell: (props) => props.getValue().join(', '),
          filterFn: (row: Row<User>, _, filterValue) => {
            const rowAuthorities: string[] = [];
            row.original.authorities.map((role) => {
              return rowAuthorities.push(t(`roles.${role}`));
            });
            const filteredArray = rowAuthorities.filter((word) =>
              word.toLowerCase().includes(filterValue.toLowerCase())
            );
            return filteredArray.length > 0;
          },
        }
      ),
      columnHelper.accessor('csaEmail', {
        header: t('settings.users.email') ?? '',
      }),
      columnHelper.display({
        id: 'edit',
        cell: editView,
        meta: {
          size: '1%',
        },
      }),
      columnHelper.display({
        id: 'delete',
        cell: deleteView,
        meta: {
          size: '1%',
        },
      }),
    ],
    []
  );

  return (
    <>
      <div className="container">
        <div className='title_container'>
        <div className="title">User Management</div>
        <Button
          appearance="primary"
          size="m"
          onClick={() => {
            setNewUserModal(true);
            setFormValues({
              firstName: '',
              lastName: '',
              idCode: '',
              csaTitle: '',
              csaEmail: '',
              authorities: [],
            });
          }}
        >
          Add a user
        </Button>
      </div>
      <div>
        <DataTable data={users} columns={usersColumns} sortable filterable />

        {deletableRow !== null && (
          <Dialog
            title={t('settings.users.deleteUser')}
            onClose={() => setDeletableRow(null)}
            isOpen={true}
            footer={
              <>
                <Button
                  appearance="secondary"
                  onClick={() => setDeletableRow(null)}
                >
                  {t('global.no')}
                </Button>
                <Button
                  appearance="error"
                  // onClick={() => deleteUserMutation.mutate({ id: deletableRow })}
                >
                  {t('global.yes')}
                </Button>
              </>
            }
          >
            <p>{t('global.removeValidation')}</p>
          </Dialog>
        )}
        {(newUserModal || editableRow) && (
          <Dialog
            onClose={() => {
              setNewUserModal(false);
              setEditableRow(null);
              setFormErrors({});
            }}
            title={newUserModal ? 'Add User' : 'Edit User'}
            isOpen={newUserModal || editableRow !== null}
            footer={
              <>
                <Button
                  appearance="secondary"
                  onClick={() => {
                    setEditableRow(null);
                    setNewUserModal(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button appearance="primary" onClick={handleSubmit}>
                  Confirm
                </Button>
              </>
            }
          >
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <FormInput
                    label="First and last name"
                    placeholder="Enter name"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    error={formErrors.firstName}
                  />
                </div>
                <div className="form-group">
                  <FormMultiselect
                    name="authorities"
                    label="Role"
                    options={roles}
                    value={formValues.authorities}
                    onChange={(value) => handleMultiselectChange('authorities', value)}
                    selectedOptions={formValues.authorities.map((role) => ({
                      value: role,
                      label: role
                        .replace('ROLE_', '')
                        .split('_')
                        .map(
                          (word) =>
                            word.charAt(0) + word.slice(1).toLowerCase()
                        )
                        .join(' '),
                    }))}
                    error={formErrors.authorities}
                  />
                </div>
                <div className="form-group">
                  <FormInput
                    label="Personal ID"
                    placeholder="Enter personal ID"
                    name="idCode"
                    value={formValues.idCode}
                    onChange={handleInputChange}
                    error={formErrors.idCode}
                  />
                </div>
                <div className="form-group">
                  <FormInput
                    label="Title"
                    placeholder="Enter title"
                    name="csaTitle"
                    value={formValues.csaTitle}
                    onChange={handleInputChange}
                    error={formErrors.csaTitle}
                  />
                </div>
                <div className="form-group">
                  <FormInput
                    label="Email"
                    placeholder="Enter email"
                    name="csaEmail"
                    type="email"
                    value={formValues.csaEmail}
                    onChange={handleInputChange}
                    error={formErrors.csaEmail}
                  />
                </div>
              </form>
            </div>
          </Dialog>
        )}
      </div>
      </div>
    </>
  );
};

export default UserManagement;
