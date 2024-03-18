import React, { useEffect, useState } from 'react';
import '../../css/Table.css'
import { Table } from 'reactstrap'

// Interface que define la estructura de una columna de la tabla.
interface Column {
  key: string;
  header: string;
  actions?: boolean;
}

// Interface que define la estructura de una fila de la tabla.
interface TableRow {
  [key: string]: any;
}

// Propiedades esperadas por el componente TableResponsive.
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
}

const TableResponsive: React.FC<TableProps> = ({ propClassNameOpcional, columns, data, openModal, toggleStatus, itemsPerPage: defaultItemsPerPage = 5, btnActionName, toggleOptionalStatus, btnToggleOptionalStatus }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);

  // Calcular el número total de elementos y de páginas
  const totalItems: number = data.length;
  const totalPages: number = Math.ceil(totalItems / itemsPerPage);

  // Calcular el índice del primer y último elemento de la página actual
  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const [currentData, setCurrentData] = useState<TableRow[]>(data);
  const currentItems: TableRow[] = currentData.slice(indexOfFirstItem, indexOfLastItem);
 
  //para devolver la tabla a la primera pagina
  useEffect(() => {
    setCurrentData(data);
    setCurrentPage(1);
  }, [data]);

  // Función para cambiar a una página específica
  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Manejar el cambio en el número de elementos por página
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
                            {btnActionName}
                          </button>
                          {toggleStatus && (
                            <button
                              className={item.estado === 1 ? 'btn-inactivate' : 'btn-activate'}
                              onClick={() => toggleStatus(item)}
                            >
                              {item.estado === 1 ? 'Inactivar' : 'Activar'}
                            </button>
                          )}
                          {btnToggleOptionalStatus && toggleOptionalStatus && (
                            <button className={propClassNameOpcional === 'btn-desvincular' ? propClassNameOpcional : 'btn-asignaciones'} onClick={() => toggleOptionalStatus(item)}>{btnToggleOptionalStatus}</button>
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
