import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';

export interface Column {
    key: string;
    header: string;
    width?: number;
}

interface ExportToExcelProps {
    reportName: string;
    data: any[];
    columns: Column[];
    userName: string;
    totales?: any[]; // Parámetro opcional para los totales
}

export const exportToExcel = ({ reportName, data, columns, userName,totales }: ExportToExcelProps) => {
    try {
        const nombreUsuario = ['Usuario: ' + userName];
        const fecha = ['Fecha: ' + getFormattedDateTime().slice(0, -9)];
    
        // Crear una hoja de cálculo vacía
        const ws = XLSX.utils.aoa_to_sheet([]);

        // Configurar las longitudes de las columnas usando la propiedad `width` de cada columna
        let propiedades: XLSX.ColInfo[] = columns.map(col => ({ width: col.width || 15 }));
        ws["!cols"] = propiedades;

        const lastColumnLetter = XLSX.utils.encode_col(columns.length - 1); 
        const midColumnLetter = XLSX.utils.encode_col((columns.length - 1) /2); 
        const midColumnLetter2 = XLSX.utils.encode_col(((columns.length - 1) /2)+1); 
        //console.log("lastColumnLetter: "+ lastColumnLetter);
        //console.log("midColumnLetter: "+ midColumnLetter);
        //console.log("midColumnLetter2: "+ midColumnLetter2);
        
        // Definir el rango de celdas a fusionar
        ws["!merges"] = [
            XLSX.utils.decode_range(`A1:${midColumnLetter}1`),
            XLSX.utils.decode_range(`${midColumnLetter2}1:${lastColumnLetter}1`),
            XLSX.utils.decode_range(`A2:${lastColumnLetter}3`),
        ];

        const titulo = [reportName];

        XLSX.utils.sheet_add_aoa(ws, [nombreUsuario], { origin: 'A1' }); // Agregar usuario
        XLSX.utils.sheet_add_aoa(ws, [fecha], { origin: `${midColumnLetter2}1`}); // Agregar fecha

        const headers = columns.map(col => col.header);
        XLSX.utils.sheet_add_aoa(ws, [titulo], { origin: 'A2' }); // Agregar título
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A4' }); // Agregar los encabezados

        // Añadir los datos a la hoja de cálculo con colores según el estado
        data.forEach((dataRow, index) => {
            const rowData = columns.map(col => dataRow[col.key] ?? '');
            const rowIndex = index + 5;
            XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${rowIndex}` });


             // Aplica el estilo a las celdas nombre y fecha
            ws["A1"].s = {  //nombre
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: { rgb: "ffffff" } 
                },
                font: {
                    sz: 12,
                    bold: true,
                },
            };
             
            ws[`${midColumnLetter2}1`].s = {//fecha
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: { rgb: "ffffff" } 
                },
                font: {
                    sz: 12,
                    bold: true,
                },
                alignment: {
                    horizontal: "right"}
            };
            

            // Aplicar estilo al título
            ws['A2'].s = {
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: { rgb: "548454" }
                },
                font: {
                    sz: 14,
                    color: { rgb: "ffffff" },
                    bold: true,
                },
                alignment: {
                    horizontal: "center", 
                    vertical: "center" 
                }
            }
            
        // Aplicar estilo a encabezados
            const headerRange = XLSX.utils.decode_range(`A4:${lastColumnLetter}4`);
            for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: 3, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    fill: {
                        patternType: "solid", 
                        fgColor: {rgb: "548454"},
                        },
                    font: {
                        sz: 12,
                        color: {rgb: "ffffff"},
                        bold: true,
                        },
                    alignment: {
                            horizontal: "center", 
                            vertical: "center" 
                        }
                };                
            }

            // Aplicar el estilo a todos las celdas de datos
            for (let C = 0; C < columns.length; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    fill: {
                        patternType: "solid", 
                        fgColor: {rgb: "f8f4f4"},
                        }, 
                    alignment: {
                        horizontal: "center", 
                        vertical: "center" 
                    }      
                };
                if( (rowIndex - 1) % 2 === 0){
                    ws[cellAddress].s = {
                        fill: {
                            patternType: "solid", 
                            fgColor: {rgb: "ffffff"},
                            }, 
                        alignment: {
                                horizontal: "center", 
                                vertical: "center" 
                            }  
                    };
                }
            }

             // Estilo basado en el estado
            const estadoColIndex = columns.findIndex(col => col.key.includes('estado'));
            let color: string;
            if(estadoColIndex !== -1){const estadoValue = (dataRow[columns[estadoColIndex].key] ?? '').toLowerCase();
  
                switch (estadoValue) {
                    case "activo":
                        color = "009933";
                        break;
                    case "inactivo":
                        color = "009933";
                        break;
                    case "en mantenimiento":
                        color = "e6ac00";
                        break;
                    case "apagado":
                        color = "e60000";
                        break;
                    case "fuera de servicio":
                        color = "660000";
                        break;
                    default:
                        color = "000000";
                        break;
                }    
            }else{
                color = "000000";
            }
          

             // Aplicar el estilo solo a la celda del estado
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: estadoColIndex });
            if (ws[cellAddress]) {
                ws[cellAddress].s = {
                    font: {
                        sz: 12,
                        color: {rgb: color},
                        bold: true,
                        },
                    alignment: {
                            horizontal: "center", 
                            vertical: "center" 
                        }
                };

                if( (rowIndex - 1) % 2 === 1){
                    ws[cellAddress].s = {
                        font: {
                            sz: 12,
                            color: {rgb: color},
                            bold: true,
                            },
                        fill: {
                            patternType: "solid", 
                            fgColor: {rgb: "f8f4f4"},
                            }, 
                        alignment: {
                                horizontal: "center", 
                                vertical: "center" 
                            }  
                    };
                }

            }
        });

         // Agregar los totales si se proporcionan
         if (totales && totales.length > 0) {
            const totalRowIndex = data.length + 5; // +5 porque el índice de las filas comienza en 5
            XLSX.utils.sheet_add_aoa(ws, [totales], { origin: `A${totalRowIndex}` });

            // Aplicar estilo a la fila de totales
            for (let C = 0; C < totales.length; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex - 1, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    font: {
                        sz: 12,
                        bold: true,
                    },
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "d9d9d9" }, // Color gris claro para la fila de totales
                    },
                    alignment: {
                        horizontal: "center",
                        vertical: "center"
                    }
                };
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName  = generateFileName(reportName);

        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, fileName);
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
    }
};

// Función para obtener la fecha y hora formateadas
const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// Función para generar el nombre del archivo
const generateFileName = (reportName:string) => {
    const formattedName = reportName.replace(/\s+/g, '_'); // Sustituir espacios por guiones bajos
    const formattedDateTime = getFormattedDateTime(); // Obtener la fecha y hora formateadas
    return `${formattedName}_${formattedDateTime}.xlsx`; // Retornar el nombre del archivo
};
