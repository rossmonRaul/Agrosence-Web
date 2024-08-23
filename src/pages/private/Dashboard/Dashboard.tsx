import React, { useEffect, useState, useRef } from "react";
import { FormGroup, Label, Input, Col, FormFeedback, Button } from "reactstrap";
import { useSelector } from "react-redux";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Sidebar from "../../../components/sidebar/Sidebar";
import Topbar from "../../../components/topbar/Topbar";
import "../../../css/AdministacionAdministradores.css";
import Select, { MultiValue } from "react-select";
import "../../../css/Dashboard.css";
import { ObtenerFincas } from "../../../servicios/ServicioFincas";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas";
import { ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario";
import { ObtenerPuntoMedicionFincaParcela } from "../../../servicios/ServicioContenidoDeNitrogeno";
import {
  ObtenerFincasParcelasDeEmpresaPorUsuario,
  ObtenerMedicionesSensores,
  ObtenerMedicionesSensoresPorUbicacionPM,
  ObtenerPuntosMedicionPorIdEmpresa,
} from "../../../servicios/ServiciosDashboard";
import { AppStore } from "../../../redux/Store";
import ReactEcharts from "echarts-for-react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";

interface Option {
  identificacion: string;
  idEmpresa: number;
  nombre: string;
  idParcela: number;
  idFinca: number;
  idPuntoMedicion: number;
  codigo: string;
}

interface Mediciones {
  idPuntoMedicion: number;
  codigo: string;
  idFinca: number;
  idParcela: number;
  idSensor: number;
  identificadorSensor: string;
  sensorEstado: string;
  idMedicion: number;
  valor: number;
  nombreMedicion: string;
  unidadMedida: string;
  fechaMedicion: string;
}
interface PuntoMedicion {
  idPuntoMedicion: number;
  codigo: string;
  latitud: number;
  longitud: number;
}
const Dashboard: React.FC = () => {
  const opcionInicial = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: [],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: [],
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],

    series: [],
  };
  const [puntosMedicionMaps, setPuntosMedicionMaps] = useState<PuntoMedicion[]>(
    []
  );
  //Graficos
  const [graficoPH, setGraficoPH] = useState<any>(opcionInicial);
  const [graficoVWC, setGraficoVWC] = useState<any>(opcionInicial);
  const [graficoConductividad, setGraficoConductividad] =
    useState<any>(opcionInicial);
  const [graficoHr, setGraficoHr] = useState<any>(opcionInicial);
  const [graficoTs, setGraficoTs] = useState<any>(opcionInicial);
  const [graficoTa, setGraficoTa] = useState<any>(opcionInicial);

  const [keyRender, setKeyRender] = useState(0);
  const userState = useSelector((store: AppStore) => store.user);
  const [fincas, setFincas] = useState<Option[]>([]);
  const [parcelas, setParcelas] = useState<Option[]>([]);
  const [puntosMedicion, setPuntosMedicion] = useState<Option[]>([]);
  const [selectedParcelas, setSelectedParcelas] = useState<MultiValue<any>>([]);
  const [selectedPuntosMedicion, setSelectedPuntosMedicion] = useState<
    MultiValue<any>
  >([]);
  const [selectedFincas, setSelectedFincas] = useState<MultiValue<any>>([]);
  const [filteredParcelas, setFilteredParcelas] = useState([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingPuntos, setLoadingPuntos] = useState("");

  const chartRefs = useRef<any[]>([]);

  const [visibleCharts, setVisibleCharts] = useState({
    ph: true,
    vwc: true,
    conductividad: true,
    hr: true,
    ts: true,
    ta: true,
  });

  const obtenerFechaHaceUnMes = () => {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    const formatoISO = (fecha: Date) => fecha.toISOString().split("T")[0];

    return formatoISO(haceUnMes);
  };
  const obtenerFechaHoy = () => {
    const hoy = new Date();

    const formatoISO = (fecha: Date) => fecha.toISOString().split("T")[0];

    return formatoISO(hoy);
  };

  const [formData, setFormData] = useState({
    fechaInicio: obtenerFechaHaceUnMes(),
    fechaFin: obtenerFechaHoy(),
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setVisibleCharts((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    const obtenerFincas = async () => {
      try {
        const idEmpresaString = localStorage.getItem("empresaUsuario");
        const identificacionString = localStorage.getItem(
          "identificacionUsuario"
        );
        if (identificacionString && idEmpresaString) {
          const identificacion = identificacionString;
          const datos = {
            usuario: identificacion,
          };
          const datosPuntoMedicion = {
            idEmpresa: idEmpresaString,
          };

          const usuariosAsignados =
            await ObtenerFincasParcelasDeEmpresaPorUsuario(datos);

          const puntosMedicionEmpresa = await ObtenerPuntosMedicionPorIdEmpresa(
            datosPuntoMedicion
          );
          setPuntosMedicionMaps(puntosMedicionEmpresa);
          const idFincasUsuario = usuariosAsignados.map(
            (usuario: any) => usuario.idFinca
          );
          const idEmpresa = localStorage.getItem("empresaUsuario");
          if (idEmpresa) {
            const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));

            const fincasUsuario = fincasResponse.filter((finca: any) =>
              idFincasUsuario.includes(finca.idFinca)
            );
            setFincas(fincasUsuario);

            // Seleccionar automáticamente la primera finca
            if (fincasUsuario.length > 0) {
              const primeraFinca = fincasUsuario[0];
              setSelectedFincas([
                {
                  value: primeraFinca.idFinca.toString(),
                  label: primeraFinca.nombre,
                },
              ]);

              const parcelasResponse = await ObtenerParcelas(
                parseInt(idEmpresa)
              );

              const parcelasUsuario = parcelasResponse.filter(
                (parcela: any) => parcela.idFinca === primeraFinca.idFinca
              );
              setParcelas(parcelasUsuario);

              if (parcelasUsuario.length > 0) {
                const primeraParcela = parcelasUsuario[0];
                setSelectedParcelas([
                  {
                    value: primeraParcela.idParcela.toString(),
                    label: primeraParcela.nombre,
                  },
                ]);

                const fincaParcela = {
                  idFinca: primeraFinca.idFinca,
                  idParcela: primeraParcela.idParcela,
                };

                const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(
                  fincaParcela
                );

                setPuntosMedicion(puntosMedicion);

                if (puntosMedicion.length > 0) {
                  const primerPuntoMedicion = puntosMedicion[0];
                  setSelectedPuntosMedicion([
                    {
                      value: primerPuntoMedicion.idPuntoMedicion.toString(),
                      label: primerPuntoMedicion.codigo,
                    },
                  ]);
                }
              }
            }
          }
        } else {
          console.error(
            "La identificación y/o el ID de la empresa no están disponibles en el localStorage."
          );
        }
      } catch (error) {
        console.error("Error al obtener las fincas del usuario:", error);
      }
    };
    obtenerFincas();
  }, []);

  useEffect(() => {
    const cargarParcelas = async () => {
      if (selectedFincas) {
        const idEmpresa = localStorage.getItem("empresaUsuario");
        if (idEmpresa) {
          const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
          const codigosFincas = selectedFincas.map((f: { value: string }) =>
            parseInt(f.value)
          );

          const parcelasUsuario = parcelasResponse.filter((parcela: any) =>
            codigosFincas.includes(parcela.idFinca)
          );
          setParcelas(parcelasUsuario);
          setFilteredParcelas(parcelasUsuario);

          if (parcelasUsuario.length > 0) {
            const primeraParcela = parcelasUsuario[0];
            setSelectedParcelas([
              {
                value: primeraParcela.idParcela.toString(),
                label: primeraParcela.nombre,
              },
            ]);
            const fincaParcela = {
              idFinca: parseInt(selectedFincas[0].value),
              idParcela: primeraParcela.idParcela,
            };

            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(
              fincaParcela
            );

            setPuntosMedicion(puntosMedicion);

            if (puntosMedicion.length > 0) {
              const primerPuntoMedicion = puntosMedicion[0];
              setSelectedPuntosMedicion([
                {
                  value: primerPuntoMedicion.idPuntoMedicion.toString(),
                  label: primerPuntoMedicion.codigo,
                },
              ]);
            }
          } else {
            setParcelas([]);
            setPuntosMedicion([]);
            setSelectedParcelas([]);
            setSelectedPuntosMedicion([]);
          }
        }
      }
    };
    cargarParcelas();
  }, [selectedFincas]);

  useEffect(() => {
    const cargarPuntoMedicion = async () => {
      if (selectedFincas.length > 0 && selectedParcelas.length > 0) {
        const fincaParcela = {
          idFinca: parseInt(selectedFincas[0].value),
          idParcela: parseInt(selectedParcelas[0].value),
        };
        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(
          fincaParcela
        );
        setPuntosMedicion(puntosMedicion);
      } else {
        setSelectedPuntosMedicion([]);
        setPuntosMedicion([]);
      }
    };
    cargarPuntoMedicion();
  }, [selectedParcelas]);

  useEffect(() => {
    if (loading) {
      const intervalo = setInterval(() => {
        setLoadingPuntos((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(intervalo);
    }
  }, [loading]);

  //Formato a las fechas
  const formatDateToLocalString = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year}  ${hours}:${minutes}:${seconds}`;
  };

  const onChangeParcelasSeleccionados = (seleccionados: MultiValue<any>) => {
    setSelectedParcelas(seleccionados);
  };

  const onChangePuntosMedicionSeleccionados = (seleccionados: MultiValue<any>) => {
      setSelectedPuntosMedicion(seleccionados);
  };
  
  const onChangeFincasSeleccionados = (seleccionados: MultiValue<any>) => {
    setSelectedFincas(seleccionados);
  };

  const handleObtenerMedicionesSensores = async () => {
    setGraficoPH(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoVWC(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoConductividad(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoHr(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoTs(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoTa(JSON.parse(JSON.stringify(opcionInicial)));
    setKeyRender((prevKey) => prevKey + 10);
    setLoading(true);
    try {
      const data = {
        Usuario: userState.identificacion,
        FechaInicio: formData.fechaInicio,
        FechaFin: formData.fechaFin,
        IdFincas: selectedFincas
          ? selectedFincas.map((f: { value: any }) => f.value).toString()
          : null,
        IdParcelas: selectedParcelas
          ? selectedParcelas.map((p: { value: any }) => p.value).toString()
          : null,
        IdPuntosMedicion: selectedPuntosMedicion
          ? selectedPuntosMedicion
              .map((p: { value: any }) => p.value)
              .toString()
          : null,
      };
      const mediciones: Mediciones[] = await ObtenerMedicionesSensores(data);

      const puntosMedicionUnicosph = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 17)
            .map((obj) => obj.codigo)
        )
      );

      const fechasMedicionUnicasph = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 17)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosVWC = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 18)
            .map((obj) => obj.codigo)
        )
      );

      const fechasMedicionUnicasVWC = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 18)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosConductividad = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 9)
            .map((obj) => obj.codigo)
        )
      );

      // const fechasMedicionUnicasConductividad = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 9).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const fechasMedicionUnicasConductividad = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 9)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosHr = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 21)
            .map((obj) => obj.codigo)
        )
      );
      const fechasMedicionUnicasHr = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 21)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosTs = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 10)
            .map((obj) => obj.codigo)
        )
      );
      const fechasMedicionUnicasTs = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 10)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosTa = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 20)
            .map((obj) => obj.codigo)
        )
      );
      const fechasMedicionUnicasTa = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 10)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const phData: {
        name: string;
        type: string;
        stack: string;
        areaStyle: {};
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const vwcData: {
        name: string;
        type: string;
        stack: string;
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const conductividadElectricaData: {
        name: string;
        type: string;
        stack: string;
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const HrData: { name: string; type: string; data: number[] }[] = [];
      const TsData: {
        name: string;
        type: string;
        stack: string;
        label: { show: boolean };
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const TaData: {
        name: string;
        type: string;
        showSymbol: string;
        data: number[];
      }[] = [];

      mediciones.forEach((item: Mediciones) => {
        const puntoMedicion = item.codigo;
        const idMedicion = item.idMedicion;
        const valorMedicion = item.valor;

        let ArrayArea: {
          name: string;
          type: string;
          stack: string;
          areaStyle: {};
          emphasis: { focus: string };
          data: number[];
        }[];
        let ArrayLineal: {
          name: string;
          type: string;
          stack: string;
          data: number[];
        }[];
        let ArrayLinealHr: { name: string; type: string; data: number[] }[];
        let ArrayLinealTs: {
          name: string;
          type: string;
          stack: string;
          label: { show: boolean };
          emphasis: { focus: string };
          data: number[];
        }[];
        let ArrayLinealTa: {
          name: string;
          type: string;
          showSymbol: string;
          data: number[];
        }[];
        let ArrayBarras: {
          name: string;
          type: string;
          stack: string;
          emphasis: { focus: string };
          data: number[];
        }[];
        let existingItem;

        if (idMedicion === 17) {
          ArrayArea = phData;
          existingItem = ArrayArea.find((obj) => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              stack: "Total",
              areaStyle: {},
              emphasis: { focus: "series" },
              data: [],
            };
            ArrayArea.push(existingItem);
          }
        } else if (idMedicion === 9) {
          ArrayBarras = conductividadElectricaData;
          existingItem = ArrayBarras.find((obj) => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "bar",
              stack: "Search Engine",
              emphasis: {
                focus: "series",
              },
              data: [],
            };
            ArrayBarras.push(existingItem);
          }
        } else if (idMedicion === 18) {
          ArrayLineal = vwcData;
          existingItem = ArrayLineal.find((obj) => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              stack: "Total",
              data: [],
            };
            ArrayLineal.push(existingItem);
          }
        } else if (idMedicion === 20) {
          ArrayLinealTa = TaData;
          existingItem = ArrayLinealTa.find(
            (obj) => obj.name === puntoMedicion
          );
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              showSymbol: "false",
              data: [],
            };
            ArrayLinealTa.push(existingItem);
          }
        } else if (idMedicion === 10) {
          ArrayLinealTs = TsData;
          existingItem = ArrayLinealTs.find(
            (obj) => obj.name === puntoMedicion
          );
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "bar",
              stack: "total",
              label: { show: true },
              emphasis: { focus: "series" },
              data: [],
            };
            ArrayLinealTs.push(existingItem);
          }
        } else if (idMedicion === 21) {
          ArrayLinealHr = HrData;
          existingItem = ArrayLinealHr.find(
            (obj) => obj.name === puntoMedicion
          );
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              data: [],
            };
            ArrayLinealHr.push(existingItem);
          }
        } else {
          return;
        }
        existingItem.data.push(valorMedicion);
      });

      setGraficoPH({
        ...graficoPH,
        title: {
          text: "pH del suelo",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosph,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoPH.xAxis[0],
            data: fechasMedicionUnicasph,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: phData,
      });

      setGraficoVWC({
        ...graficoVWC,
        title: {
          text: "VWC",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosVWC,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoVWC.xAxis[0],
            data: fechasMedicionUnicasVWC,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 20,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: vwcData,
      });

      setGraficoConductividad({
        ...graficoConductividad,
        title: {
          text: "Ce",
          left: "center",
          top: 10,
        },
        legend: {
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoConductividad.xAxis[0],
            data: fechasMedicionUnicasConductividad,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: conductividadElectricaData,
      });

      setGraficoTa({
        ...graficoTa,
        title: {
          text: "Ta",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTa,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoTa.xAxis[0],
            data: fechasMedicionUnicasTa,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: TaData,
      });

      setGraficoTs({
        ...graficoTs,
        title: {
          text: "Ts",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTs,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoTs.xAxis[0],
            data: fechasMedicionUnicasTs,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: TsData,
      });

      setGraficoHr({
        ...graficoHr,
        title: {
          text: "Hr",
          left: "center",
          top: 10,
        },
        legend: {
          top: 35,
          data: puntosMedicionUnicosHr,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoHr.xAxis[0],
            data: fechasMedicionUnicasHr,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: HrData,
      });

      setKeyRender((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error al obtener las mediciones de sensores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = async (idPuntoMedicion: number) => {
    setGraficoPH(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoVWC(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoConductividad(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoHr(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoTs(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoTa(JSON.parse(JSON.stringify(opcionInicial)));
    setKeyRender((prevKey) => prevKey + 10);
    try {
      const data = {
        FechaInicio: formData.fechaInicio,
        FechaFin: formData.fechaFin,
        IdPuntoMedicion: idPuntoMedicion,
      };
      const mediciones: Mediciones[] =
        await ObtenerMedicionesSensoresPorUbicacionPM(data);

      const puntosMedicionUnicosph = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 17)
            .map((obj) => obj.codigo)
        )
      );

      const fechasMedicionUnicasph = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 17)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosVWC = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 18)
            .map((obj) => obj.codigo)
        )
      );

      const fechasMedicionUnicasVWC = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 18)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosConductividad = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 9)
            .map((obj) => obj.codigo)
        )
      );

      // const fechasMedicionUnicasConductividad = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 9).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const fechasMedicionUnicasConductividad = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 9)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosHr = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 21)
            .map((obj) => obj.codigo)
        )
      );
      const fechasMedicionUnicasHr = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 21)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosTs = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 10)
            .map((obj) => obj.codigo)
        )
      );
      const fechasMedicionUnicasTs = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 10)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));

      const puntosMedicionUnicosTa = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 20)
            .map((obj) => obj.codigo)
        )
      );
      const fechasMedicionUnicasTa = Array.from(
        new Set(
          mediciones
            .filter((obj) => obj.idMedicion === 10)
            .map((obj) => new Date(obj.fechaMedicion))
        )
      ).map((date) => formatDateToLocalString(date));
      const phData: {
        name: string;
        type: string;
        stack: string;
        areaStyle: {};
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const vwcData: {
        name: string;
        type: string;
        stack: string;
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const conductividadElectricaData: {
        name: string;
        type: string;
        stack: string;
        emphasis: { focus: string };
        data: number[];
      }[] = [];

      const HrData: { name: string; type: string; data: number[] }[] = [];
      const TsData: {
        name: string;
        type: string;
        stack: string;
        label: { show: boolean };
        emphasis: { focus: string };
        data: number[];
      }[] = [];
      const TaData: {
        name: string;
        type: string;
        showSymbol: string;
        data: number[];
      }[] = [];

      mediciones.forEach((item: Mediciones) => {
        const puntoMedicion = item.codigo;
        const idMedicion = item.idMedicion;
        const valorMedicion = item.valor;

        let ArrayArea: {
          name: string;
          type: string;
          stack: string;
          areaStyle: {};
          emphasis: { focus: string };
          data: number[];
        }[];
        let ArrayLineal: {
          name: string;
          type: string;
          stack: string;
          data: number[];
        }[];

        let ArrayLinealHr: { name: string; type: string; data: number[] }[];
        let ArrayLinealTs: {
          name: string;
          type: string;
          stack: string;
          label: { show: boolean };
          emphasis: { focus: string };
          data: number[];
        }[];
        let ArrayLinealTa: {
          name: string;
          type: string;
          showSymbol: string;
          data: number[];
        }[];

        let ArrayBarras: {
          name: string;
          type: string;
          stack: string;
          emphasis: { focus: string };
          data: number[];
        }[];
        let existingItem;

        if (idMedicion === 17) {
          ArrayArea = phData;
          existingItem = ArrayArea.find((obj) => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              stack: "Total",
              areaStyle: {},
              emphasis: { focus: "series" },
              data: [],
            };
            ArrayArea.push(existingItem);
          }
        } else if (idMedicion === 9) {
          ArrayBarras = conductividadElectricaData;
          existingItem = ArrayBarras.find((obj) => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "bar",
              stack: "Search Engine",
              emphasis: {
                focus: "series",
              },
              data: [],
            };
            ArrayBarras.push(existingItem);
          }
        } else if (idMedicion === 18) {
          ArrayLineal = vwcData;
          existingItem = ArrayLineal.find((obj) => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              stack: "Total",
              data: [],
            };
            ArrayLineal.push(existingItem);
          }
        } else if (idMedicion === 20) {
          ArrayLinealTa = TaData;
          existingItem = ArrayLinealTa.find(
            (obj) => obj.name === puntoMedicion
          );
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              showSymbol: "false",
              data: [],
            };
            ArrayLinealTa.push(existingItem);
          }
        } else if (idMedicion === 10) {
          ArrayLinealTs = TsData;
          existingItem = ArrayLinealTs.find(
            (obj) => obj.name === puntoMedicion
          );
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "bar",
              stack: "total",
              label: { show: true },
              emphasis: { focus: "series" },
              data: [],
            };
            ArrayLinealTs.push(existingItem);
          }
        } else if (idMedicion === 21) {
          ArrayLinealHr = HrData;
          existingItem = ArrayLinealHr.find(
            (obj) => obj.name === puntoMedicion
          );
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: "line",
              data: [],
            };
            ArrayLinealHr.push(existingItem);
          }
        } else {
          return;
        }
        existingItem.data.push(valorMedicion);
      });

      setGraficoPH({
        ...graficoPH,
        title: {
          text: "pH",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosph,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoPH.xAxis[0],
            data: fechasMedicionUnicasph,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: phData,
      });

      setGraficoVWC({
        ...graficoVWC,
        title: {
          text: "VWC",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosVWC,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoVWC.xAxis[0],
            data: fechasMedicionUnicasVWC,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: vwcData,
      });

      setGraficoConductividad({
        ...graficoConductividad,
        title: {
          text: "Ce",
          left: "center",
          top: 10,
        },
        legend: {
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoConductividad.xAxis[0],
            data: fechasMedicionUnicasConductividad,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: conductividadElectricaData,
      });

      // Nuevos
      setGraficoTa({
        ...graficoTa,
        title: {
          text: "Ta",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTa,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoTa.xAxis[0],
            data: fechasMedicionUnicasTa,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: TaData,
      });

      setGraficoTs({
        ...graficoTs,
        title: {
          text: "Ts",
          left: "center",
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTs,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoTs.xAxis[0],
            data: fechasMedicionUnicasTs,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: TsData,
      });

      setGraficoHr({
        ...graficoHr,
        title: {
          text: "Hr",
          left: "center",
          top: 10,
        },
        legend: {
          top: 35,
          data: puntosMedicionUnicosHr,
        },
        grid: {
          top: 100,
        },
        xAxis: [
          {
            ...graficoHr.xAxis[0],
            data: fechasMedicionUnicasHr,
            boundaryGap: true,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 25,
          },
          {
            start: 0,
            end: 25,
          },
        ],
        series: HrData,
      });

      setKeyRender((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error al obtener las mediciones de sensores:", error);
    }
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        chartRefs.current.forEach((chartRef) => {
          if (chartRef) {
            chartRef.getEchartsInstance().resize();
          }
        });
      }, 1000); // Retrasar la redimensión para asegurar que los gráficos están completamente montados
    }
  }, [loading, keyRender]);

  const renderComboboxes = () => (
    <div
      className="form-container"
      style={{ alignItems: "center", marginTop: "20px" }}
    >
      <div className="form-row">
        <div className="form-group">
          <FormGroup>
            <Label for="fincas">Finca:</Label>
            <Select
              isMulti
              name="opciones"
              options={fincas.map((p) => ({
                value: String(p.idFinca),
                label: p.nombre,
              }))}
              className="basic-multi-select"
              onChange={onChangeFincasSeleccionados}
              value={selectedFincas}
              classNamePrefix="select"
              placeholder="Seleccione"
            />
          </FormGroup>
        </div>
        <div className="form-group">
          <FormGroup>
            <Label for="parcelas">Parcela:</Label>
            <Select
              isMulti
              name="opciones"
              options={parcelas.map((p) => ({
                label: String(p.nombre),
                value: p.idParcela,
              }))}
              className="basic-multi-select"
              onChange={onChangeParcelasSeleccionados}
              value={selectedParcelas}
              classNamePrefix="select"
              placeholder="Seleccione"
            />
          </FormGroup>
        </div>
        <div className="form-group">
          <FormGroup>
            <Label for="puntosMedicion">Puntos de medición:</Label>
            <Select
              isMulti
              name="opciones"
              options={puntosMedicion.map((p) => ({
                value: String(p.idPuntoMedicion),
                label: p.codigo,
              }))}
              className="basic-multi-select"
              onChange={onChangePuntosMedicionSeleccionados}
              value={selectedPuntosMedicion}
              classNamePrefix="select"
              placeholder="Seleccione"
            />
          </FormGroup>
        </div>
      </div>
      <div className="form-row">
        <FormGroup>
          <Label for="fechaInicio" className="input-label">
            Fecha Inicio
          </Label>
          <Input
            type="date"
            id="fechaInicio"
            style={{ width: "86%" }}
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleInputChange}
            className={
              errors.fechaInicio ? "input-styled input-error" : "input-styled"
            }
            placeholder="Selecciona una fecha"
          />
          <FormFeedback>{errors.fechaInicio}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="fechaFin" className="input-label">
            Fecha Fin
          </Label>
          <Input
            type="date"
            id="fechaFin"
            name="fechaFin"
            style={{ width: "93%" }}
            value={formData.fechaFin}
            onChange={handleInputChange}
            className={
              errors.fechaFin ? "input-styled input-error" : "input-styled"
            }
            placeholder="Selecciona una fecha"
            // min={formData.fechaInicio || getMinDate()}
            // max={getTodayDate()}
          />
          <FormFeedback>{errors.fechaFin}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Button
            style={{
              backgroundColor: "#a5cf60",
              color: "white",
              marginTop: "22px",
              marginLeft: "60px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onClick={handleObtenerMedicionesSensores}
          >
            {loading ? `Cargando${loadingPuntos}` : "Obtener Mediciones"}
          </Button>
        </FormGroup>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "50px",
          marginBottom: "50px",
          width: "100%",
        }}
      >
        <h2>Mapa con Puntos de Medición</h2>
        {/* <MapComponent /> */}
        <MapContainer
          center={[9.936681, -84.103964]}
          zoom={8}
          style={{ height: "600px", width: "100%", position: "relative" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {puntosMedicionMaps.map((position, index) => (
            <Marker
              key={index}
              position={[position.latitud, position.longitud]}
              eventHandlers={{
                click: () => handleMarkerClick(position.idPuntoMedicion),
              }}
            >
              <Popup>Punto de medición: {position.codigo}.</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div
        className="checkbox-container"
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <div style={{ marginRight: "20px" }}>
          <Input
            type="checkbox"
            name="ph"
            checked={visibleCharts.ph}
            onChange={handleCheckboxChange}
          />{" "}
          pH
        </div>
        <div style={{ marginRight: "20px" }}>
          <Input
            type="checkbox"
            name="vwc"
            checked={visibleCharts.vwc}
            onChange={handleCheckboxChange}
          />{" "}
          VWC
        </div>
        <div style={{ marginRight: "20px" }}>
          <Input
            type="checkbox"
            name="conductividad"
            checked={visibleCharts.conductividad}
            onChange={handleCheckboxChange}
          />{" "}
          Conductividad
        </div>
        <div style={{ marginRight: "20px" }}>
          <Input
            type="checkbox"
            name="hr"
            checked={visibleCharts.hr}
            onChange={handleCheckboxChange}
          />{" "}
          Hr
        </div>
        <div style={{ marginRight: "20px" }}>
          <Input
            type="checkbox"
            name="ts"
            checked={visibleCharts.ts}
            onChange={handleCheckboxChange}
          />{" "}
          Ts
        </div>
        <div style={{ marginRight: "20px" }}>
          <Input
            type="checkbox"
            name="ta"
            checked={visibleCharts.ta}
            onChange={handleCheckboxChange}
          />{" "}
          Ta
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          marginTop: "30px",
        }}
      >
        {visibleCharts.ph && (
          <ReactEcharts
            ref={(ref) => (chartRefs.current[0] = ref)}
            option={graficoPH}
            key={keyRender}
            style={{ height: "500px", width: "500px", marginBottom: "20px" }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.vwc && (
          <ReactEcharts
            ref={(ref) => (chartRefs.current[1] = ref)}
            option={graficoVWC}
            key={keyRender + 1}
            style={{ height: "500px", width: "500px", marginBottom: "20px" }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.conductividad && (
          <ReactEcharts
            ref={(ref) => (chartRefs.current[2] = ref)}
            option={graficoConductividad}
            key={keyRender + 2}
            style={{ height: "500px", width: "500px", marginBottom: "20px" }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.ta && (
          <ReactEcharts
            ref={(ref) => (chartRefs.current[3] = ref)}
            option={graficoTa}
            key={keyRender + 3}
            style={{ height: "500px", width: "500px", marginBottom: "20px" }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.hr && (
          <ReactEcharts
            ref={(ref) => (chartRefs.current[4] = ref)}
            option={graficoHr}
            key={keyRender + 4}
            style={{ height: "500px", width: "500px", marginBottom: "20px" }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.ts && (
          <ReactEcharts
            ref={(ref) => (chartRefs.current[5] = ref)}
            option={graficoTs}
            key={keyRender + 5}
            style={{ height: "500px", width: "500px", marginBottom: "20px" }}
            className="react_for_echarts"
          />
        )}
      </div>
    </div>
  );

  let dashboardContent: JSX.Element;

  switch (userState.idRol) {
    case 1:
      dashboardContent = (
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Dashboard Super Usuario" />
            <div className="content">{renderComboboxes()}</div>
          </div>
        </Sidebar>
      );
      break;
    case 2:
      dashboardContent = (
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Dashboard Administrador" />
            <div className="content">{renderComboboxes()}</div>
          </div>
        </Sidebar>
      );
      break;
    case 3:
      dashboardContent = (
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Dashboard" />
            <div className="content">{renderComboboxes()}</div>
          </div>
        </Sidebar>
      );
      break;
    case 4:
      dashboardContent = (
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Comunidad" />
            <div className="content">{renderComboboxes()}</div>
          </div>
        </Sidebar>
      );
      break;
    default:
      dashboardContent = (
        <div>No se encontró un dashboard para este rol de usuario.</div>
      );
      break;
  }
  return <div>{dashboardContent}</div>;
};

export default Dashboard;
