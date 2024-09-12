import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import "../../../css/Reportes.css";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerReporteSensores } from "../../../servicios/ServicioReporte.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { exportToExcel } from "../../../utilities/exportReportToExcel.ts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../img/AGROSENSER.png";
import { ClipLoader } from "react-spinners";

function ReporteSensores() {
  // Estado para almacenar todos los usuarios asignados
  const [apiData, setApiData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerDatos();
  }, []); // Ejecutar solo una vez al montar el componente

  const obtenerDatos = async () => {
    try {
      setLoading(true);

      // Usar un pequeño delay para asegurarse de que el estado se actualice y se muestre el loader
      new Promise<void>((resolve) => setTimeout(resolve, 50));

      const idEmpresa = localStorage.getItem("empresaUsuario");
      if (idEmpresa) {
        const formData = {
          idEmpresa: idEmpresa,
        };
        const datos = await ObtenerReporteSensores(formData);

        // Actualizar datos de la tabla
        setApiData(datos);

        setLoading(false);
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setLoading(false);
    }
  };

  const convertirImagenABase64 = (ruta: any): Promise<string> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", ruta);
      xhr.responseType = "blob";
      xhr.send();
    });
  };

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

  const generatePDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Reporte de sensores", 75, 10);

    const imgBase64 = await convertirImagenABase64(logo);
    const imgWidth = 30;
    const imgHeight = 30;

    doc.addImage(imgBase64, "PNG", 170, -5, imgWidth, imgHeight);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Usuario: " + userName, 14, 25);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Fecha: " + getFormattedDateTime().slice(0, -9), 165, 25);

    autoTable(doc, {
      startY: 30,
      // Columnas de la tabla con propiedad de ancho
      columns: [
        { key: "idSensor", header: "Id" },
        { key: "identificadorSensor", header: "EUI" },
        { key: "nombreSensor", header: "Nombre" },
        { key: "codigoPuntoMedicion", header: "Punto Medición" },
        { key: "parcela", header: "Parcela" },
        { key: "finca", header: "Finca" },
        { key: "estadoSensor", header: "Estado" },
      ],
      headStyles: { fillColor: [84, 132, 84] },
      body: apiData,
      didParseCell: (data) => {
        if (data.column.dataKey === "estadoSensor") {
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

    doc.save("sensores.pdf");
  };

  //
  const reportName = "Reporte de Sensores";
  const userName = localStorage.getItem("nombreUsuario") || "Usuario";

  // Columnas de la tabla con propiedad de ancho
  const columns = [
    { key: "idSensor", header: "Id Sensor", width: 15 },
    { key: "identificadorSensor", header: "EUI", width: 20 },
    { key: "nombreSensor", header: "Nombre", width: 20 },
    { key: "codigoPuntoMedicion", header: "Punto Medicion", width: 20 },
    { key: "parcela", header: "Parcela", width: 30 },
    { key: "finca", header: "Finca", width: 30 },
    { key: "estadoSensor", header: "Estado", width: 20 },
  ];

  return (
    <Sidebar>
      <div className="main-container">
        <Topbar />
        <BordeSuperior text="Reporte de Sensores" />
        <div className="content" style={{width: '90%'}}>
          <div
            className="filtro-item"
            style={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            {apiData.length > 0 && (
              <>
                <button
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => generatePDF()}
                  className="btn-exportar"
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
          {apiData.length > 0 && (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50%',
                marginTop: '5%'
                }}>
                {loading ? (
                    <ClipLoader color={"#038c3e"} loading={loading} size={100} />
                ) : (
                    <TableResponsive columns={columns} data={apiData}/>
                )}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
export default ReporteSensores;
