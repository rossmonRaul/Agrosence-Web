import { useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import "../../../css/Reportes.css";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtieneReporteMedicionesSensor } from "../../../servicios/ServicioReporte.ts";
import { exportToExcel } from "../../../utilities/exportReportToExcel.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../../../img/AGROSENSER.png';
import { ClipLoader } from "react-spinners";

function ReporteMedicionesSensor() {
  // Estado para almacenar todos los usuarios asignados
  const [apiData, setApiData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Función para filtrar datos
  const obtenerRegistros = async () => {
    try {
      setLoading(true);

      // Usar un pequeño delay para asegurarse de que el estado se actualice y se muestre el loader
      new Promise<void>((resolve) => setTimeout(resolve, 50));

      const datos = await ObtieneReporteMedicionesSensor();

      // Actualizar datos de la tabla
      setApiData(datos);

      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const userName = localStorage.getItem("nombreUsuario") || "Usuario";

  // Columnas de la tabla
  const columns = [
    { key: "idMedicion", header: "ID Medición", width: 15 },
    { key: "nombre", header: "Nombre", width: 50 },
    { key: "unidadMedida", header: "Unidad Medida", width: 70 },
    { key: "nomenclatura", header: "Nomenclatura", width: 50 },
    { key: "estadoPalabra", header: "Estado", width: 50 },
  ];

  //
  const reportName = "Reporte Medidas de Sensor";

  const convertirImagenABase64 = (ruta:any):Promise<string> => {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', ruta);
        xhr.responseType = 'blob';
        xhr.send();
    });
};

  const generatePDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Mediciones de sensor", 75, 10);

    const imgBase64 = await convertirImagenABase64(logo);
    const imgWidth = 30;
    const imgHeight = 30;

    doc.addImage(imgBase64, 'PNG', 170, -5, imgWidth, imgHeight);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Usuario: " + userName, 14, 25);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Fecha: " + getFormattedDateTime().slice(0, -9), 165, 25);

    autoTable(doc, {
      startY: 30,
      columns: [
        { key: "idMedicion", header: "ID Medición" },
        { key: "nombre", header: "Nombre" },
        { key: "unidadMedida", header: "Unidad Medida" },
        { key: "nomenclatura", header: "Nomenclatura" },
        { key: "estadoPalabra", header: "Estado" },
      ],
      headStyles: { fillColor: [84, 132, 84] },
      body: apiData,
      didParseCell: (data) => {
        if (data.column.dataKey === "estadoPalabra") {
          const estado = data.cell.raw?.toString().toLocaleLowerCase();
          switch (estado) {
            case "activo":
              data.cell.styles.textColor = "009933";
              break;
            case "inactivo":
              data.cell.styles.textColor = "009933";
              break;
            case "en mantenimiento":
              data.cell.styles.textColor = "e6ac00";
              break;
            case "apagado":
              data.cell.styles.textColor = "e60000";
              break;
            case "fuera de servicio":
              data.cell.styles.textColor = "660000";
              break;
            default:
              data.cell.styles.textColor = [255, 255, 255];
              break;
          }
        }
      },
    });

    doc.save("medicionesSensor.pdf");
  };

  // Función para obtener la fecha y hora formateadas
  const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  return (
    <Sidebar>
      <div className="main-container">
        <Topbar />
        <BordeSuperior text="Reporte Medidas de Sensor" />
        <div>
          <div
            className="filtro-item" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginTop:"10px", marginBottom:"10px" }}
          >
            {apiData.length > 0 && (
              <>
                <button
                  onClick={() => generatePDF()}
                  className="btn-exportar"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    style={{ color: "#0CF25D", fontSize: "27px" }}
                  />
                  <span style={{ marginLeft: "5px" }}>Imprimir</span>
                </button>
                <button
                  onClick={() =>
                    exportToExcel({
                      reportName,
                      data: apiData,
                      columns,
                      userName,
                    })
                  }
                  className="btn-exportar"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "10px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    style={{ color: "#0CF25D", fontSize: "27px" }}
                  />
                  <span style={{ marginLeft: "5px" }}>Exportar</span>
                </button>
              </>
            )}
          </div>
          <br />
          {apiData.length > 0 && (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50%',
                margin: '5%'
                }}>
                {loading ? (
                    <ClipLoader color={"#038c3e"} loading={loading} size={100} />
                ) : (
                    <TableResponsive columns={columns} data={apiData} itemsPerPage={15}/>
                )}
            </div>
          )}
          {apiData.length < 1 && (
            <h2>
              <br />
              No se encontraron registros de medidas de sensor
            </h2>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
export default ReporteMedicionesSensor;
