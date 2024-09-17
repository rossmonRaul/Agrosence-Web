import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import '../../css/Modal.css'
import { IoCloseOutline } from 'react-icons/io5';

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
const CustomModal: React.FC<CustomModalProps> = ({ isOpen, toggle, title, onCancel, children }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader>
        <div className='header'>
          {title}
          <button onClick={onCancel}>
              <IoCloseOutline size={20} style={{ marginRight: '1%' }} />
          </button>
        </div>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
    </Modal>
  );
};

export default CustomModal;
