import { FC, useMemo, useState } from "react";
import { Button, Icon } from "../components";
import DataTable from "../components/molecules/DataTable";
import users from "../config/users.json";
import { Row, createColumnHelper } from "@tanstack/react-table";
import { User } from "../types/user";
import { MdOutlineDeleteOutline, MdOutlineEdit } from "react-icons/md";
import Dialog from "../components/molecules/Dialog";

const UserManagement: FC = () => {
  const [data, setData] = useState([]);
  const columnHelper = createColumnHelper<User>();
  const [editableRow, setEditableRow] = useState<User | null>(null);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(
    null
  );
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const editView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => setEditableRow(props.row.original)}
    >
      <Icon icon={<MdOutlineEdit />} />
      {"Edit"}
    </Button>
  );

  const deleteView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => setDeletableRow(props.row.original.idCode)}
    >
      <Icon icon={<MdOutlineDeleteOutline />} />
      {"Delete"}
    </Button>
  );

  const usersColumns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.firstName ?? ""} ${row.lastName ?? ""}`,
        {
          id: `name`,
          header: "name",
        }
      ),
      columnHelper.accessor("idCode", {
        header: "idCode",
      }),
      columnHelper.accessor(
        (data: { authorities: any }) => {
          const output: string[] = [];
          data.authorities?.map?.((role) => {
            return output.push("role");
          });
          return output;
        },
        {
          header: "role" ?? "",
          cell: (props) => props.getValue().join(", "),
          filterFn: (row: Row<User>, _, filterValue) => {
            const rowAuthorities: string[] = [];
            row.original.authorities.map((role) => {
              return rowAuthorities.push("role");
            });
            const filteredArray = rowAuthorities.filter((word) =>
              word.toLowerCase().includes(filterValue.toLowerCase())
            );
            return filteredArray.length > 0;
          },
        }
      ),
      columnHelper.accessor("displayName", {
        header: "displayName" ?? "",
      }),
      columnHelper.accessor("csaTitle", {
        header: "csaTitle" ?? "",
      }),
      columnHelper.accessor("csaEmail", {
        header: "csaEmail" ?? "",
      }),
      columnHelper.display({
        id: "edit",
        cell: editView,
        meta: {
          size: "1%",
        },
      }),
      columnHelper.display({
        id: "delete",
        cell: deleteView,
        meta: {
          size: "1%",
        },
      }),
    ],
    []
  );

  return (
    <>
      <div className="flex justify-between items-center px-12 py-20 bg-gray-100">
        <div className="text-2xl text-black font-semibold">User Management</div>
        <Button appearance="primary" size="m" onClick={()=>setShowAddUserModal(true)}>
          Add a user
        </Button>
      </div>
      <>
        <DataTable data={users} columns={usersColumns} />
        <Dialog
          onClose={() => setShowAddUserModal(false)}
          title={"Add User"}
          isOpen={showAddUserModal}
          footer={
            <>
              <Button
                appearance="secondary"
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
               
              >
                Confirm
              </Button>
            </>
          }
        >

            body
        </Dialog>
      </>
    </>
  );
};

export default UserManagement;
