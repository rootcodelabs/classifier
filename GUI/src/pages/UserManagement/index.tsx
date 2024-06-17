import { FC, useMemo, useState } from 'react';
import {
  Button,
  DataTable,
  Dialog,
  FormInput,
  FormSelect,
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

  const editView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => setEditableRow(props.row.original)}
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
        <div className="title">User Management</div>
        <Button
          appearance="primary"
          size="m"
          onClick={() => setNewUserModal(true)}
        >
          Add a user
        </Button>
      </div>
      <div className="container">
        <DataTable data={users} columns={usersColumns} />

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
                  }}
                >
                  Cancel
                </Button>
                <Button appearance="primary">Confirm</Button>
              </>
            }
          >
            <>
              <div className="form-container">
                <form>
                  <div className="form-group">
                    <FormInput
                      label="First and last name"
                      placeholder="Enter name"
                      name="fullName"
                      value={editableRow?.fullName}
                    />
                  </div>
                  <div className="form-group">
                    <FormSelect name="role" label="Role" options={roles} value={editableRow?.csaTitle} />
                  </div>
                  <div className="form-group">
                    <FormInput
                      label="Personal ID"
                      placeholder="Enter personal ID"
                      name="personalID"
                    />
                  </div>
                  <div className="form-group">
                    <FormInput
                      label="Title"
                      placeholder="Enter title"
                      name="title"
                    />
                  </div>
                  <div className="form-group">
                    <FormInput
                      label="Email"
                      placeholder="Enter email"
                      name="email"
                      type="email"
                    />
                  </div>
                </form>
              </div>
            </>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default UserManagement;
