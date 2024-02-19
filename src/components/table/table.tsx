import React, { useState } from 'react';
import '../../css/Table.css'
import {Table} from 'reactstrap'

interface Column {
  key: string;
  header: string;
  actions?: boolean;
}

interface TableRow {
  [key: string]: any;
}

interface TableProps {
  columns: Column[];
  data: TableRow[];
  itemsPerPage?: number;
  openModal: (gestor: any) => void;
  toggleStatus: (gestor: any) => void;
}

const TableResponsive: React.FC<TableProps> = ({ columns, data, openModal, toggleStatus, itemsPerPage: defaultItemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);

  const totalItems: number = data.length;
  const totalPages: number = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const currentItems: TableRow[] = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página cuando cambia el número de elementos por página
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
                    <div>
                      <button className='btn-edit' onClick={() => openModal(item)}>
                        Editar
                      </button>
                      <button
                        className={item.estado === 1 ? 'btn-inactivate' : 'btn-activate'}
                        onClick={() => toggleStatus(item)}
                      >
                        {item.estado === 1 ? 'Eliminar' : 'Activar'}
                      </button>
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
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}  className={currentPage === 1? 'btn-disabledprevious' : 'btn-previous'}>
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}  className={currentPage === totalPages? 'btn-disablednext' : 'btn-next'}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TableResponsive;
