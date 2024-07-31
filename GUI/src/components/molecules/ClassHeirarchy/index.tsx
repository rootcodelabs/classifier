import React, { FC, PropsWithChildren, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { FormInput } from 'components/FormElements';
import Button from 'components/Button';
import { v4 as uuidv4 } from 'uuid';
import './index.css';
import Dialog from 'components/Dialog';
import { Class } from 'types/datasetGroups';
import { isClassHierarchyDuplicated } from 'utils/datasetGroupsUtils';

type ClassHierarchyProps = {
  nodes?: Class[];
  setNodes: React.Dispatch<React.SetStateAction<Class[] | []>>;
  nodesError?: boolean;
  setNodesError: React.Dispatch<React.SetStateAction<boolean>>;
  setBannerMessage:React.Dispatch<React.SetStateAction<string>>;

};

const ClassHierarchy: FC<PropsWithChildren<ClassHierarchyProps>> = ({
  nodes,
  setNodes,
  nodesError,
  setNodesError,
  setBannerMessage
}) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const TreeNode = ({ node, onAddSubClass, onDelete }) => {
    const [fieldName, setFieldName] = useState(node.fieldName);

    const handleChange = (e) => {
      setFieldName(e.target.value);
      node.fieldName = e.target.value;
      if(isClassHierarchyDuplicated(nodes,e.target.value))
        setNodesError(true)
      else
      setNodesError(false)
    };

    return (
      <div
        style={{
          marginLeft: node.level * 20,
          width: '450px',
          marginTop: '10px',
        }}
      >
        <div className="class-grid">
          <div>
            <FormInput
              label=""
              name="className"
              placeholder="Enter Field Name"
              value={fieldName}
              onChange={handleChange}
              error={
                nodesError && !fieldName
                  ? 'Enter a field name'
                  : fieldName && isClassHierarchyDuplicated(nodes, fieldName)
                  ? 'Class name already exists'
                  : ''
              }
            />
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', color: 'blue' }}
            className="link"
          >
            <a onClick={() => onAddSubClass(node.id)}>Add Subclass</a>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center' }}
            className="link"
          >
            <MdDeleteOutline /> <a onClick={() => onDelete(node.id)}>Delete</a>
          </div>
        </div>
        {node.children &&
          node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onAddSubClass={onAddSubClass}
              onDelete={onDelete}
            />
          ))}
      </div>
    );
  };

  const addMainClass = () => {
    setNodes([
      ...nodes,
      { id: uuidv4(), fieldName: '', level: 0, children: [] },
    ]);
  };

  const addSubClass = (parentId) => {
    const addSubClassRecursive = (nodes) => {
      return nodes?.map((node) => {
        if (node.id === parentId) {
          const newNode = {
            id: uuidv4(),
            fieldName: '',
            level: node.level + 1,
            children: [],
          };
          return { ...node, children: [...node.children, newNode] };
        }
        if (node.children.length > 0) {
          return { ...node, children: addSubClassRecursive(node.children) };
        }
        return node;
      });
    };
    setNodes(addSubClassRecursive(nodes));
    setNodesError(false);
  };

  const deleteNode = (nodeId) => {
    const deleteNodeRecursive = (nodes) => {
      return nodes
        .map((node) => {
          if (node.children.length > 0) {
            return { ...node, children: deleteNodeRecursive(node.children) };
          }
          return node;
        })
        .filter((node) => {
          if (node.id === nodeId) {
            if (node.children.length > 0 || node.fieldName) {
              setCurrentNode(node);
              setIsModalOpen(true);
              return true; // Keep the node for now, until user confirms deletion
            }
          }
          return !(
            node.id === nodeId &&
            node.children.length === 0 &&
            !node.fieldName
          );
        });
    };

    setNodes(deleteNodeRecursive(nodes));
  };

  const confirmDeleteNode = () => {
    const deleteNodeRecursive = (nodes) => {
      return nodes?.filter((node) => {
        if (node.id === currentNode.id) {
          return false; // Remove this node
        }
        if (node.children.length > 0) {
          node.children = deleteNodeRecursive(node.children);
        }
        return true;
      });
    };

    setNodes(deleteNodeRecursive(nodes));
    setIsModalOpen(false);
    setCurrentNode(null);
  };

  return (
    <div>
      <div>
        <Button onClick={addMainClass}>Add Main Class</Button>
        <div>
          {nodes?.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onAddSubClass={addSubClass}
              onDelete={deleteNode}
            />
          ))}
        </div>
      </div>
      <Dialog
        isOpen={isModalOpen}
        title={'Are you sure?'}
        footer={
          <div>
            <Button
              appearance="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button appearance="error" onClick={() => confirmDeleteNode()}>
              Delete
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
      >
        Confirm that you are wish to delete the following record. This will delete the current class and all subclasses of it
      </Dialog>
    </div>
  );
};

export default ClassHierarchy;
