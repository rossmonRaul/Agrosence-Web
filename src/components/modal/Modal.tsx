import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import '../../css/Modal.css'

/**
 * Props para el componente CustomModal.
 */
interface CustomModalProps {
  isOpen: boolean; // Indica si el modal está abierto o cerrado
  toggle: () => void; // Función para abrir/cerrar el modal
  title: string; // Título del modal
  onSubmit?: () => void; // Función para manejar el evento de envío (opcional)
  onCancel: () => void; // Función para manejar el evento de cancelación
  children: React.ReactNode; // Contenido del modal
  btnSubmit?: string; // Texto del botón de envío (opcional)
}

/**
 * Componente funcional que representa un modal personalizado.
 */
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
