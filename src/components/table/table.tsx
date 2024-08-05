import React, { useEffect, useState } from 'react';
import '../../css/Table.css';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faPenToSquare, faEye, faTrash} from '@fortawesome/free-solid-svg-icons';

interface Column {
  key: string;
  header: string;
  actions?: boolean;
}

interface TableRow {
  [key: string]: any;
}

interface TableProps {
  columns: Column[]; // Columnas de la tabla
  data: TableRow[]; // Datos a mostrar en la tabla
  itemsPerPage?: number; // Número de elementos por página (opcional, por defecto es 5)
  btnActionName: string; // Nombre del botón de acción en cada fila
  openModal: (user: any) => void; // Función para abrir un modal con los detalles de un elemento
  toggleStatus?: (user: any) => void; // Función para cambiar el estado de un elemento (opcional)
  btnToggleOptionalStatus?: string; // Nombre del botón de acción opcional en cada fila (opcional)
  toggleOptionalStatus?: (user: any) => void; // Función para realizar una acción opcional en cada fila (opcional)
  propClassNameOpcional?: string; // Prop opcional para cambiar el estilo del boton
  openDetallesModal?: (user: any) => void; // Función para abrir un modal de detalles de un elemento (opcional)
}

const TableResponsive: React.FC<TableProps> = ({ propClassNameOpcional, columns, data, openModal, toggleStatus, itemsPerPage: defaultItemsPerPage = 5, btnActionName, toggleOptionalStatus, btnToggleOptionalStatus, openDetallesModal }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);

  const totalItems: number = data.length;
  const totalPages: number = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const [currentData, setCurrentData] = useState<TableRow[]>(data);
  const currentItems: TableRow[] = currentData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentData(data);
    setCurrentPage(1);
  }, [data]);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className='table-container'>
      <div className='registros-pagina'>
        <span>Registros por página: </span>
        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
      <div >
        <div>
          <Table responsive>
            <thead>
              <tr>
                {columns.map((column: Column, index: number) => (
                  <th key={index}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item: TableRow, rowIndex: number) => (
                <tr key={rowIndex}>
                  {columns.map((column: Column, colIndex: number) => (
                    <td key={colIndex}>
                      {column.actions ? (
                        <div className='table-btn-container'>
                          <button className='btn-edit' onClick={() => openModal(item)}>
                            <FontAwesomeIcon icon={faPenToSquare} /> {btnActionName}
                          </button>
                          {toggleStatus && (
                            <div className="status-toggle">
                              {item.estado === 1 ? (
                                <button className="btn-inactivate" onClick={() => toggleStatus(item)}>
                                  <FontAwesomeIcon icon={faTrash} /> Eliminar
                                </button>
                              ) : (
                                <button className="btn-activate" onClick={() => toggleStatus(item)}>
                                  <FontAwesomeIcon icon={faCheck} /> Activar
                                </button>
                              )}
                            </div>
                          )}
                          {btnToggleOptionalStatus && toggleOptionalStatus && (
                            <button className={propClassNameOpcional === 'btn-desvincular' ? propClassNameOpcional : 'btn-asignaciones'} onClick={() => toggleOptionalStatus(item)}>{btnToggleOptionalStatus}</button>
                          )}
                          {openDetallesModal && (
                            <button className='btn-details' onClick={() => openDetallesModal(item)}>
                              <FontAwesomeIcon icon={faEye} /> Detalles
                            </button>
                          )}
                        </div>
                      ) : (
                        item[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      {totalItems > itemsPerPage && (
        <div className='pagination'>
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={currentPage === 1 ? 'btn-disabledprevious' : 'btn-previous'}>
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={currentPage === totalPages ? 'btn-disablednext' : 'btn-next'}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TableResponsive;
