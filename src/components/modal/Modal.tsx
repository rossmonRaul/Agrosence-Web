import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import '../../css/Modal.css'

interface CustomModalProps {
  isOpen: boolean;
  toggle: () => void;
  title: string;
  onSubmit?: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  btnSubmit?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, toggle, title, onSubmit, onCancel, children, btnSubmit }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        {btnSubmit && onSubmit && (
          <button className='btn btn-primary' onClick={onSubmit}>{btnSubmit}</button>
        )}
        <button className='btn btn-danger' onClick={onCancel}>Cancelar</button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomModal;
