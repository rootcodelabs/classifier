import { FC, useMemo, useState } from 'react';
import { Button, DataTable, Icon } from '../../components';
import {
  PaginationState,
  Row,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { User } from '../../types/user';
import { MdOutlineDeleteOutline, MdOutlineEdit } from 'react-icons/md';
import './UserManagement.scss';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteUser } from 'services/users';
import { useToast } from 'hooks/useToast';
import { AxiosError } from 'axios';
import apiDev from 'services/api-dev';
import UserModal from './UserModal';
import { userManagementQueryKeys } from 'utils/queryKeys';
import { userManagementEndpoints } from 'utils/endpoints';
import { ButtonAppearanceTypes, ToastTypes } from 'enums/commonEnums';
import { useDialog } from 'hooks/useDialog';
import SkeletonTable from 'components/molecules/TableSkeleton/TableSkeleton';

const UserManagement: FC = () => {
  const columnHelper = createColumnHelper<User>();
  const [newUserModal, setNewUserModal] = useState(false);
  const [editableRow, setEditableRow] = useState<User | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { open, close } = useDialog();

  const fetchUsers = async (
    pagination: PaginationState,
    sorting: SortingState
  ) => {
    const sort =
      sorting?.length === 0
        ? 'name asc'
        : sorting[0]?.id +
          ' ' +
          (sorting[0]?.desc ? t('global.desc') : t('global.asc'));
    const { data } = await apiDev.post(userManagementEndpoints.FETCH_USERS(), {
      page: pagination?.pageIndex + 1,
      page_size: pagination?.pageSize,
      sorting: sort,
    });
    return data?.response ?? [];
  };

  const { data: users, isLoading } = useQuery(
    userManagementQueryKeys.getAllEmployees(),
    () => fetchUsers(pagination, sorting)
  );

  const ActionButtons: FC<{ row: User }> = ({ row }) => (
    <div className="action-button-container">
      <Button
        appearance={ButtonAppearanceTypes.TEXT}
        onClick={() => setEditableRow(row)}
      >
        <Icon icon={<MdOutlineEdit />} />
        {t('global.change')}
      </Button>
      <Button
        appearance={ButtonAppearanceTypes.TEXT}
        onClick={async () => {
          open({
            title: t('userManagement.addUser.deleteUserModalTitle') ?? '',
            content: <p>{t('userManagement.addUser.deleteUserModalDesc')}</p>,
            footer: (
              <div>
                <Button
                  appearance={ButtonAppearanceTypes.SECONDARY}
                  onClick={() => {
                    close();
                  }}
                >
                  {t('global.no')}
                </Button>
                <Button
                  appearance={ButtonAppearanceTypes.ERROR}
                  onClick={() =>
                    deleteUserMutation.mutate({ id: row.useridcode })
                  }
                >
                  {t('global.yes')}
                </Button>
              </div>
            ),
          });
        }}
      >
        <Icon icon={<MdOutlineDeleteOutline />} />
        {t('global.delete')}
      </Button>
    </div>
  );

  const usersColumns = useMemo(
    () => [
      columnHelper.accessor(
        (row: User) => `${row?.firstName ?? ''} ${row?.lastName ?? ''}`,
        {
          id: 'name',
          header: t('userManagement.table.fullName') ?? '',
        }
      ),
      columnHelper.accessor('useridcode', {
        header: t('userManagement.table.personalId') ?? '',
      }),
      columnHelper.accessor(
        (data: User) => {
          const output: string[] = [];
          data.authorities?.forEach((role) => output.push(t(`roles.${role}`)));
          return output;
        },
        {
          header: t('userManagement.table.role') ?? '',
          cell: (props) => props.getValue<string[]>().join(', '),
          filterFn: (row: Row<User>, _, filterValue: string) => {
            const rowAuthorities = row.original.authorities.map((role) =>
              t(`roles.${role}`)
            );
            return rowAuthorities.some((word) =>
              word.toLowerCase().includes(filterValue.toLowerCase())
            );
          },
        }
      ),
      columnHelper.accessor('csaEmail', {
        header: t('userManagement.table.email') ?? '',
      }),
      columnHelper.display({
        id: 'actions',
        header: t('userManagement.table.actions') ?? '',
        cell: (props) => <ActionButtons row={props?.row?.original} />,
        meta: {
          size: '1%',
        },
      }),
    ],
    [t]
  );

  const deleteUserMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        userManagementQueryKeys.getAllEmployees()
      );
      toast.open({
        type: ToastTypes.SUCCESS,
        title: t('global.notification'),
        message: t('toast.success.userDeleted'),
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: ToastTypes.ERROR,
        title: t('global.notificationError'),
        message: error?.message ?? '',
      });
    },
  });

  if (isLoading) return <div> {t('global.loading')}...</div>;

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">{t('userManagement.title')}</div>
          <Button
            appearance={ButtonAppearanceTypes.PRIMARY}
            size="m"
            onClick={() => {
              setNewUserModal(true);
            }}
          >
            {t('userManagement.addUserButton')}
          </Button>
        </div>
        <div>
          {!isLoading && (
            <DataTable
              data={users}
              columns={usersColumns}
              sortable
              filterable
              pagination={pagination}
              setPagination={(state: PaginationState) => {
                if (
                  state?.pageIndex === pagination?.pageIndex &&
                  state?.pageSize === pagination?.pageSize
                )
                  return;
                setPagination(state);
                fetchUsers(state, sorting);
              }}
              sorting={sorting}
              setSorting={(state: SortingState) => {
                setSorting(state);
                fetchUsers(pagination, state);
              }}
              pagesCount={totalPages}
              isClientSide={false}
            />
          )}

          {isLoading && <SkeletonTable rowCount={5} />}

          {newUserModal && (
            <UserModal
              isModalOpen={newUserModal}
              onClose={() => setNewUserModal(false)}
            />
          )}

          {editableRow && (
            <UserModal
              user={editableRow}
              onClose={() => setEditableRow(null)}
              isModalOpen={editableRow !== null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;