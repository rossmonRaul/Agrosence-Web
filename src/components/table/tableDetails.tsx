import React, { useEffect, useState } from 'react';
import '../../css/TableDetails.css';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faPenToSquare, faSearch } from '@fortawesome/free-solid-svg-icons';

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
    openModal: (item: TableRow) => void; // Función para abrir un modal con los detalles de un elemento
    openModalDetalles: (item: TableRow) => void; // Función para abrir un modal con los detalles de un elemento
    btnActionNameDetails: string; // Nombre del botón de acción en cada fila
    toggleStatus?: (item: TableRow) => void; // Función para cambiar el estado de un elemento (opcional)
    btnToggleOptionalStatus?: string; // Nombre del botón de acción opcional en cada fila (opcional)
    toggleOptionalStatus?: (item: TableRow) => void; // Función para realizar una acción opcional en cada fila (opcional)
    propClassNameOpcional?: string; // Prop opcional para cambiar el estilo del boton
}

const TableResponsive: React.FC<TableProps> = ({
    columns,
    data,
    openModal,
    toggleStatus,
    openModalDetalles,
    itemsPerPage: defaultItemsPerPage = 5,
    btnActionName,
    btnActionNameDetails,
    toggleOptionalStatus,
    btnToggleOptionalStatus,
    propClassNameOpcional,
}) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);

    // Calcular el número total de elementos y de páginas
    const totalItems: number = data.length;
    const totalPages: number = Math.ceil(totalItems / itemsPerPage);

    // Calcular el índice del primer y último elemento de la página actual
    const indexOfLastItem: number = currentPage * itemsPerPage;
    const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
    const currentItems: TableRow[] = data.slice(indexOfFirstItem, indexOfLastItem);

    // Cambiar a una página específica
    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Manejar el cambio en el número de elementos por página
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value, 10);
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
                                                {btnActionName === 'Detalles' ? (
                                                    <>
                                                        <button className='btn-detalils' onClick={() => openModalDetalles(item)}>
                                                            <FontAwesomeIcon icon={faSearch} /> {btnActionNameDetails}
                                                        </button></>

                                                ) : (
                                                    <>
                                                        <button className='btn-detalils' onClick={() => openModalDetalles(item)}>{btnActionNameDetails}
                                                        </button>
                                                    </>
                                                )
                                                }
                                                {btnActionName === 'Editar' ? (
                                                    <>
                                                        <button className='btn-edit' onClick={() => openModal(item)}>
                                                            <FontAwesomeIcon icon={faPenToSquare} /> {btnActionName}
                                                        </button></>

                                                ) : (
                                                    <>
                                                        <button className='btn-edit' onClick={() => openModal(item)}>{btnActionName}
                                                        </button>
                                                    </>
                                                )
                                                }

                                                {toggleStatus && (
                                                    <div className='status-toggle'>
                                                        {item.estado === 1 ? (
                                                            <button className='btn-inactivate' onClick={() => toggleStatus(item)}>
                                                                <FontAwesomeIcon icon={faTimes} /> Eliminar
                                                            </button>
                                                        ) : (
                                                            <button className='btn-activate' onClick={() => toggleStatus(item)}>
                                                                <FontAwesomeIcon icon={faCheck} /> Activar
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {btnToggleOptionalStatus && toggleOptionalStatus && (
                                                    <button
                                                        className={
                                                            propClassNameOpcional === 'btn-desvincular' ? propClassNameOpcional : 'btn-asignaciones'
                                                        }
                                                        onClick={() => toggleOptionalStatus(item)}
                                                    >
                                                        {btnToggleOptionalStatus}
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
            {totalItems > itemsPerPage && (
                <div className='pagination'>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={currentPage === 1 ? 'btn-disabledprevious' : 'btn-previous'}>
                        Anterior
                    </button>
                    <span>
                        Página {currentPage} de {totalPages}
                    </span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={currentPage === totalPages ? 'btn-disablednext' : 'btn-next'}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default TableResponsive;
