import React, { useEffect, useState, useRef } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { useSelector } from "react-redux";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Sidebar from "../../../components/sidebar/Sidebar";
import Topbar from "../../../components/topbar/Topbar";
import '../../../css/AdministacionAdministradores.css';
import '../../../css/Dashboard.css';
import { ObtenerFincas } from '../../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../../servicios/ServicioParcelas';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import { ObtenerPuntoMedicionFincaParcela } from "../../../servicios/ServicioContenidoDeNitrogeno";
import { ObtenerFincasParcelasDeEmpresaPorUsuario, ObtenerMedicionesSensores, ObtenerMedicionesSensoresPorUbicacionPM, ObtenerPuntosMedicionPorIdEmpresa } from "../../../servicios/ServiciosDashboard";
import { AppStore } from "../../../redux/Store";
import ReactEcharts from 'echarts-for-react'; 
import MapComponent from '../../../components/MapComponent/MapComponent';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';

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
  idPuntoMedicion:number;
  codigo: string;
  latitud: number;
  longitud:number;
}
const Dashboard: React.FC = () => {
  const opcionInicial = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: []
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: []
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: []
  };
  const [puntosMedicionMaps, setPuntosMedicionMaps] = useState<PuntoMedicion[]>([]);
  //Graficos
  const [graficoPH, setGraficoPH] = useState<any>(opcionInicial);
  const [graficoVWC, setGraficoVWC] = useState<any>(opcionInicial);
  const [graficoConductividad, setGraficoConductividad] = useState<any>(opcionInicial);
  const [graficoHr, setGraficoHr] = useState<any>(opcionInicial);
  const [graficoTs, setGraficoTs] = useState<any>(opcionInicial);
  const [graficoTa, setGraficoTa] = useState<any>(opcionInicial);

  const [keyRender, setKeyRender] = useState(0);
  const userState = useSelector((store: AppStore) => store.user);
  const [fincas, setFincas] = useState<Option[]>([]);
  const [parcelas, setParcelas] = useState<Option[]>([]);
  const [puntosMedicion, setPuntosMedicion] = useState<Option[]>([]);
  const [selectedFinca, setSelectedFinca] = useState<string>('');
  const [selectedParcela, setSelectedParcela] = useState<string>('');
  const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const chartRefs = useRef<any[]>([]);

  const [visibleCharts, setVisibleCharts] = useState({
    ph: true,
    vwc: true,
    conductividad: true,
    hr: true,
    ts: true,
    ta: true,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setVisibleCharts((prevState) => ({
      ...prevState,
      [name]: checked
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const obtenerFincas = async () => {
      try {
        const idEmpresaString = localStorage.getItem('empresaUsuario');
        const identificacionString = localStorage.getItem('identificacionUsuario');
        if (identificacionString && idEmpresaString) {
          const identificacion = identificacionString;
          const datos = {
            usuario: identificacion
          };
          const datosPuntoMedicion = {
            idEmpresa: idEmpresaString
          };
          console.log(identificacion);
          const usuariosAsignados = await ObtenerFincasParcelasDeEmpresaPorUsuario(datos);
          console.log('Usuarios Asignados:', usuariosAsignados);

          const puntosMedicionEmpresa = await ObtenerPuntosMedicionPorIdEmpresa(datosPuntoMedicion);
          setPuntosMedicionMaps(puntosMedicionEmpresa);
          const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
          const fincasResponse = await ObtenerFincas();
          console.log('Fincas Response:', fincasResponse);

          const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
          setFincas(fincasUsuario);

          // Seleccionar automáticamente la primera finca
          if (fincasUsuario.length > 0) {
            const primeraFinca = fincasUsuario[0];
            setSelectedFinca(primeraFinca.idFinca.toString());

            const parcelasResponse = await ObtenerParcelas();
            console.log('Parcelas Response:', parcelasResponse);

            const parcelasUsuario = parcelasResponse.filter((parcela: any) => parcela.idFinca === primeraFinca.idFinca);
            setParcelas(parcelasUsuario);

            if (parcelasUsuario.length > 0) {
              const primeraParcela = parcelasUsuario[0];
              setSelectedParcela(primeraParcela.idParcela.toString());

              const fincaParcela = {
                idFinca: primeraFinca.idFinca,
                idParcela: primeraParcela.idParcela
              };

              const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
              console.log('Puntos de Medición:', puntosMedicion);
              setPuntosMedicion(puntosMedicion);

              if (puntosMedicion.length > 0) {
                const primerPuntoMedicion = puntosMedicion[0];
                setSelectedPuntoMedicion(primerPuntoMedicion.idPuntoMedicion.toString());
              }
            }
          }
        } else {
          console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
        }
      } catch (error) {
        console.error('Error al obtener las fincas del usuario:', error);
      }
    };
    obtenerFincas();
  }, []);

  useEffect(() => {
    const cargarParcelas = async () => {
      if (selectedFinca) {
        const parcelasResponse = await ObtenerParcelas();
        console.log('Parcelas Response:', parcelasResponse);

        const parcelasUsuario = parcelasResponse.filter((parcela: any) => parcela.idFinca === parseInt(selectedFinca));
        setParcelas(parcelasUsuario);

        if (parcelasUsuario.length > 0) {
          const primeraParcela = parcelasUsuario[0];
          setSelectedParcela(primeraParcela.idParcela.toString());

          const fincaParcela = {
            idFinca: parseInt(selectedFinca),
            idParcela: primeraParcela.idParcela
          };

          const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
          console.log('Puntos de Medición:', puntosMedicion);
          setPuntosMedicion(puntosMedicion);

          if (puntosMedicion.length > 0) {
            const primerPuntoMedicion = puntosMedicion[0];
            setSelectedPuntoMedicion(primerPuntoMedicion.idPuntoMedicion.toString());
          }
        } else {
          setParcelas([]);
          setPuntosMedicion([]);
          setSelectedParcela('');
          setSelectedPuntoMedicion('');
        }
      }
    };
    cargarParcelas();
  }, [selectedFinca]);

  useEffect(() => {
    const cargarPuntoMedicion = async () => {
      if (selectedFinca && selectedParcela) {
        const fincaParcela = {
          idFinca: parseInt(selectedFinca),
          idParcela: parseInt(selectedParcela)
        };
        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
        console.log('Puntos de Medición (Cambio de selección):', puntosMedicion);
        setPuntosMedicion(puntosMedicion);
      }
    };
    cargarPuntoMedicion();
  }, [selectedParcela]);

  const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

  const handleObtenerMedicionesSensores = async () => {
    setGraficoPH(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoVWC(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoConductividad(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoHr(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoTs(JSON.parse(JSON.stringify(opcionInicial)));
    setGraficoTa(JSON.parse(JSON.stringify(opcionInicial)));
    setKeyRender(prevKey => prevKey + 10);
    setLoading(true);
    try {
      const data = {
        Usuario: userState.identificacion,
        FechaInicio: formData.fechaInicio,
        FechaFin: formData.fechaFin,
        IdFinca: selectedFinca ? parseInt(selectedFinca) : null,
        IdParcela: selectedParcela ? parseInt(selectedParcela) : null,
        IdPuntoMedicion: selectedPuntoMedicion ? parseInt(selectedPuntoMedicion) : null
      };
      const mediciones: Mediciones[] = await ObtenerMedicionesSensores(data);

      const puntosMedicionUnicosph = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 17).map(obj => obj.codigo)));
      const fechasMedicionUnicasph = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 17).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));
      const puntosMedicionUnicosVWC = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 18).map(obj => obj.codigo)));
      const fechasMedicionUnicasVWC = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 18).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));
      const puntosMedicionUnicosConductividad = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 9).map(obj => obj.codigo)));
      const fechasMedicionUnicasConductividad = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 9).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));
      const puntosMedicionUnicosHr = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 21).map(obj => obj.codigo)));
      const fechasMedicionUnicasHr = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 21).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));
      const puntosMedicionUnicosTs = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 10).map(obj => obj.codigo)));
      const fechasMedicionUnicasTs = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 10).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));
      const puntosMedicionUnicosTa = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 20).map(obj => obj.codigo)));
      const fechasMedicionUnicasTa = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 10).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const phData: { name: string, type: string, stack: string, areaStyle: {}, emphasis: { focus: string }, data: number[] }[] = [];
      const vwcData: { name: string, type: string, stack: string, emphasis: { focus: string }, data: number[] }[] = [];
      const conductividadElectricaData: { name: string, type: string, stack: string, emphasis: { focus: string }, data: number[] }[] = [];
      const HrData: { name: string, type: string, data: number[] }[] = [];
      const TsData: { name: string, type: string, stack: string, label: { show: boolean }, emphasis: { focus: string }, data: number[] }[] = [];
      const TaData: { name: string, type: string, showSymbol: string, data: number[] }[] = [];

      mediciones.forEach((item: Mediciones) => {
        const puntoMedicion = item.codigo;
        const idMedicion = item.idMedicion;
        const valorMedicion = item.valor;

        let ArrayArea: { name: string, type: string, stack: string, areaStyle: {}, emphasis: { focus: string }, data: number[] }[];
        let ArrayLineal: { name: string, type: string, stack: string, data: number[] }[];
        let ArrayLinealHr: { name: string, type: string, data: number[] }[];
        let ArrayLinealTs: { name: string, type: string, stack: string, label: { show: boolean }, emphasis: { focus: string }, data: number[] }[]
        let ArrayLinealTa: { name: string, type: string, showSymbol: string, data: number[] }[]
        let ArrayBarras: { name: string, type: string, stack: string, emphasis: { focus: string }, data: number[] }[];
        let existingItem;

        if (idMedicion === 17) {
          ArrayArea = phData;
          existingItem = ArrayArea.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: { focus: 'series' },
              data: []
            };
            ArrayArea.push(existingItem);
          }
        } else if (idMedicion === 9) {
          ArrayBarras = conductividadElectricaData;
          existingItem = ArrayBarras.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'bar',
              stack: 'Search Engine',
              emphasis: {
                focus: 'series'
              },
              data: []
            };
            ArrayBarras.push(existingItem);
          }
        } else if (idMedicion === 18) {
          ArrayLineal = vwcData;
          existingItem = ArrayLineal.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              stack: 'Total',
              data: []
            };
            ArrayLineal.push(existingItem);
          }
        } else if (idMedicion === 20) {
          ArrayLinealTa = TaData;
          existingItem = ArrayLinealTa.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              showSymbol: 'false',
              data: []
            };
            ArrayLinealTa.push(existingItem);
          }
        }
        else if (idMedicion === 10) {
          ArrayLinealTs = TsData;
          existingItem = ArrayLinealTs.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'bar',
              stack: 'total',
              label: { show: true },
              emphasis: { focus: 'series' },
              data: []
            };
            ArrayLinealTs.push(existingItem);
          }
        }
        else if (idMedicion === 21) {
          ArrayLinealHr = HrData;
          existingItem = ArrayLinealHr.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              data: []
            };
            ArrayLinealHr.push(existingItem);
          }
        }
        else {
          return;
        }
        existingItem.data.push(valorMedicion);
      });

      setGraficoPH({
        ...graficoPH,
        title: {
          text: 'pH del suelo',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosph,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoPH.xAxis[0],
          data: fechasMedicionUnicasph
        }],
        series: phData
      });

      setGraficoVWC({
        ...graficoVWC,
        title: {
          text: 'VWC',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosVWC,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoVWC.xAxis[0],
          data: fechasMedicionUnicasVWC
        }],
        series: vwcData
      });

      setGraficoConductividad({
        ...graficoConductividad,
        title: {
          text: 'Ce',
          left: 'center',
          top: 10,
        },
        legend: {
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoConductividad.xAxis[0],
          data: fechasMedicionUnicasConductividad
        }],
        series: conductividadElectricaData
      });

      setGraficoTa({
        ...graficoTa,
        title: {
          text: 'Ta',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTa,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoTa.xAxis[0],
          data: fechasMedicionUnicasTa
        }],
        series: TaData
      });

      setGraficoTs({
        ...graficoTs,
        title: {
          text: 'Ts',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTs,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoTs.xAxis[0],
          data: fechasMedicionUnicasTs
        }],
        series: TsData
      });

      setGraficoHr({
        ...graficoHr,
        title: {
          text: 'Hr',
          left: 'center',
          top: 10,
        },
        legend: {
          top: 35,
          data: puntosMedicionUnicosHr,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoHr.xAxis[0],
          data: fechasMedicionUnicasHr
        }],
        series: HrData
      });

      setKeyRender(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error al obtener las mediciones de sensores:', error);
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
    setKeyRender(prevKey => prevKey + 10);
    try {
      const data = {
        FechaInicio: formData.fechaInicio,
        FechaFin: formData.fechaFin,
        IdPuntoMedicion: idPuntoMedicion
      };
      const mediciones: Mediciones[] = await ObtenerMedicionesSensoresPorUbicacionPM(data);

      const puntosMedicionUnicosph = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 17).map(obj => obj.codigo)));
      const fechasMedicionUnicasph = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 17).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const puntosMedicionUnicosVWC = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 18).map(obj => obj.codigo)));
      const fechasMedicionUnicasVWC = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 18).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const puntosMedicionUnicosConductividad = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 9).map(obj => obj.codigo)));
      const fechasMedicionUnicasConductividad = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 9).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      //Nuevas
      const puntosMedicionUnicosHr = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 21).map(obj => obj.codigo)));
      const fechasMedicionUnicasHr = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 21).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const puntosMedicionUnicosTs = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 10).map(obj => obj.codigo)));
      const fechasMedicionUnicasTs = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 10).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const puntosMedicionUnicosTa = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 20).map(obj => obj.codigo)));
      const fechasMedicionUnicasTa = Array.from(new Set(mediciones.filter(obj => obj.idMedicion === 10).map(obj => new Date(obj.fechaMedicion).toLocaleDateString())));

      const phData: { name: string, type: string, stack: string, areaStyle: {}, emphasis: { focus: string }, data: number[] }[] = [];
      const vwcData: { name: string, type: string, stack: string, emphasis: { focus: string }, data: number[] }[] = [];
      const conductividadElectricaData: { name: string, type: string, stack: string, emphasis: { focus: string }, data: number[] }[] = [];

      const HrData: { name: string, type: string, data: number[] }[] = [];
      const TsData: { name: string, type: string, stack: string, label: { show: boolean }, emphasis: { focus: string }, data: number[] }[] = [];
      const TaData: { name: string, type: string, showSymbol: string, data: number[] }[] = [];

      ///console.log('mediciones',)
      console.log(fechasMedicionUnicasConductividad)
      console.log(fechasMedicionUnicasVWC)
      console.log(fechasMedicionUnicasph)

      mediciones.forEach((item: Mediciones) => {
        const puntoMedicion = item.codigo;
        const idMedicion = item.idMedicion;
        const valorMedicion = item.valor;

        let ArrayArea: { name: string, type: string, stack: string, areaStyle: {}, emphasis: { focus: string }, data: number[] }[];
        let ArrayLineal: { name: string, type: string, stack: string, data: number[] }[];

        let ArrayLinealHr: { name: string, type: string, data: number[] }[];
        let ArrayLinealTs: { name: string, type: string, stack: string, label: { show: boolean }, emphasis: { focus: string }, data: number[] }[]
        let ArrayLinealTa: { name: string, type: string, showSymbol: string, data: number[] }[]

        let ArrayBarras: { name: string, type: string, stack: string, emphasis: { focus: string }, data: number[] }[];
        let existingItem;

        if (idMedicion === 17) {
          ArrayArea = phData;
          existingItem = ArrayArea.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: { focus: 'series' },
              data: []
            };
            ArrayArea.push(existingItem);
          }
        } else if (idMedicion === 9) {
          ArrayBarras = conductividadElectricaData;
          existingItem = ArrayBarras.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'bar',
              stack: 'Search Engine',
              emphasis: {
                focus: 'series'
              },
              data: []
            };
            ArrayBarras.push(existingItem);
          }
        } else if (idMedicion === 18) {
          ArrayLineal = vwcData;
          existingItem = ArrayLineal.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              stack: 'Total',
              data: []
            };
            ArrayLineal.push(existingItem);
          } 
        } else if (idMedicion === 20) {
          ArrayLinealTa = TaData;
          existingItem = ArrayLinealTa.find(obj => obj.name === puntoMedicion);
          if (!existingItem) {
            existingItem = {
              name: puntoMedicion,
              type: 'line',
              showSymbol: 'false',
              data: []
            };
            ArrayLinealTa.push(existingItem);
          }
          } 
          else if (idMedicion === 10) {
            ArrayLinealTs = TsData;
            existingItem = ArrayLinealTs.find(obj => obj.name === puntoMedicion);
            if (!existingItem) {
              existingItem = {
                name: puntoMedicion,
                type: 'bar',
                stack: 'total',
                label: {show: true},
                emphasis: { focus: 'series'},
                data: []
              };
              ArrayLinealTs.push(existingItem);
            }
          }
          else if (idMedicion === 21) {
            ArrayLinealHr = HrData;
            existingItem = ArrayLinealHr.find(obj => obj.name === puntoMedicion);
            if (!existingItem) {
              existingItem = {
                name: puntoMedicion,
                type: 'line',
                data: []
              };
              ArrayLinealHr.push(existingItem);
            }
          }
        else {
          return;
        }
        existingItem.data.push(valorMedicion);
      });

     

      setGraficoPH({
        ...graficoPH,
        title: {
          text: 'pH',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosph,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoPH.xAxis[0],
          data: fechasMedicionUnicasph
        }],
        series: phData
      });

      setGraficoVWC({
        ...graficoVWC,
        title: {
          text: 'VWC',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosVWC,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoVWC.xAxis[0],
          data: fechasMedicionUnicasVWC
        }],
        series: vwcData
      });

      setGraficoConductividad({
        ...graficoConductividad,
        title: {
          text: 'Ce',
          left: 'center',
          top: 10,
        },
        legend: {
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoConductividad.xAxis[0],
          data: fechasMedicionUnicasConductividad
        }],
        series: conductividadElectricaData
      });

      // Nuevos 
      setGraficoTa({
        ...graficoTa,
        title: {
          text: 'Ta',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTa,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoTa.xAxis[0],
          data: fechasMedicionUnicasTa
        }],
        series: TaData
      });

      setGraficoTs({
        ...graficoTs,
        title: {
          text: 'Ts',
          left: 'center',
          top: 10,
        },
        legend: {
          data: puntosMedicionUnicosTs,
          top: 35,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoTs.xAxis[0],
          data: fechasMedicionUnicasTs
        }],
        series: TsData
      });

      setGraficoHr({
        ...graficoHr,
        title: {
          text: 'Hr',
          left: 'center',
          top: 10,
        },
        legend: {
          top: 35,
          data: puntosMedicionUnicosHr,
        },
        grid: {
          top: 100,
        },
        xAxis: [{
          ...graficoHr.xAxis[0],
          data: fechasMedicionUnicasHr
        }],
        series: HrData
      });

      setKeyRender(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error al obtener las mediciones de sensores:', error);
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
    <div className="form-container" style={{ alignItems: 'center' }}>
      <div className="form-row">
        <div className="form-group">
          <FormGroup>
            <Label for="fincas">Finca:</Label>
            <select id="fincas" value={selectedFinca} onChange={(e) => setSelectedFinca(e.target.value)} className="custom-select">
              <option value="">Seleccione una finca</option>
              {fincas.map((option) => (
                <option key={option.idFinca} value={option.idFinca}>{option.nombre}</option>
              ))}
            </select>
          </FormGroup>
        </div>
        <div className="form-group">
          <FormGroup>
            <Label for="parcelas">Parcela:</Label>
            <select id="parcelas" value={selectedParcela} onChange={(e) => setSelectedParcela(e.target.value)} className="custom-select">
              <option value="">Seleccione una parcela</option>
              {filteredParcelas.map((option) => (
                <option key={option.idParcela} value={option.idParcela}>{option.nombre}</option>
              ))}
            </select>
          </FormGroup>
        </div>
        <div className="form-group">
          <FormGroup>
            <Label for="puntosMedicion">Punto de medición:</Label>
            <select id="puntosMedicion" value={selectedPuntoMedicion} onChange={(e) => setSelectedPuntoMedicion(e.target.value)} className="custom-select">
              <option value="">Seleccione un punto de medición</option>
              {puntosMedicion.map((option) => (
                <option key={option.idPuntoMedicion} value={option.idPuntoMedicion}>{option.codigo}</option>
              ))}
            </select>
          </FormGroup>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <FormGroup row>
            <Label for="fechaInicio" sm={4} className="input-label">Fecha Inicio</Label>
            <Col sm={8}>
              <Input
                style={{ width: '150px' }}
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
                className={errors.fechaInicio ? 'input-styled input-error' : 'input-styled'}
                placeholder="Selecciona una fecha"
              />
              <FormFeedback>{errors.fechaInicio}</FormFeedback>
            </Col>
          </FormGroup>
        </div>
        <div className="form-group">
          <FormGroup row>
            <Label for="fechaFin" sm={4} className="input-label">Fecha Fin</Label>
            <Col sm={8}>
              <Input
                style={{ width: '150px' }}
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleInputChange}
                className={errors.fechaFin ? 'input-styled input-error' : 'input-styled'}
                placeholder="Selecciona una fecha"
                // min={formData.fechaInicio || getMinDate()}
                // max={getTodayDate()}
              />
              <FormFeedback>{errors.fechaFin}</FormFeedback>
            </Col>
          </FormGroup>
        </div>
      </div>
      <Button style={{
        backgroundColor: '#a5cf60',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }} onClick={handleObtenerMedicionesSensores}>Obtener Mediciones</Button>
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',marginTop:'50px', marginBottom:'50px', width: '100%'}}>
                <h2>Mapa con Puntos de Medición</h2>
                {/* <MapComponent /> */}
                <MapContainer center={[9.936681, -84.103964]} zoom={8} style={{ height: '600px', width: '100%', position: 'relative' }}>
                  <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {puntosMedicionMaps.map((position, index) => (
                      <Marker key={index} position={[position.latitud,position.longitud]} eventHandlers={{ click: () => handleMarkerClick(position.idPuntoMedicion) }}>
                        <Popup>
                          Punto de medición: {position.codigo}.
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                 </div>
      <div className="checkbox-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ marginRight: '20px' }}>
          <Input type="checkbox" name="ph" checked={visibleCharts.ph} onChange={handleCheckboxChange} /> pH
        </div>
        <div style={{ marginRight: '20px' }}>
          <Input type="checkbox" name="vwc" checked={visibleCharts.vwc} onChange={handleCheckboxChange} /> VWC
        </div>
        <div style={{ marginRight: '20px' }}>
          <Input type="checkbox" name="conductividad" checked={visibleCharts.conductividad} onChange={handleCheckboxChange} /> Conductividad
        </div>
        <div style={{ marginRight: '20px' }}>
          <Input type="checkbox" name="hr" checked={visibleCharts.hr} onChange={handleCheckboxChange} /> Hr
        </div>
        <div style={{ marginRight: '20px' }}>
          <Input type="checkbox" name="ts" checked={visibleCharts.ts} onChange={handleCheckboxChange} /> Ts
        </div>
        <div style={{ marginRight: '20px' }}>
          <Input type="checkbox" name="ta" checked={visibleCharts.ta} onChange={handleCheckboxChange} /> Ta
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: '30px' }}>
        {visibleCharts.ph && (
          <ReactEcharts
            ref={ref => chartRefs.current[0] = ref}
            option={graficoPH} key={keyRender}
            style={{ height: '500px', width: '500px', marginBottom: '20px' }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.vwc && (
          <ReactEcharts
            ref={ref => chartRefs.current[1] = ref}
            option={graficoVWC} key={keyRender + 1}
            style={{ height: '500px', width: '500px', marginBottom: '20px' }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.conductividad && (
          <ReactEcharts
            ref={ref => chartRefs.current[2] = ref}
            option={graficoConductividad} key={keyRender + 2}
            style={{ height: '500px', width: '500px', marginBottom: '20px' }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.ta && (
          <ReactEcharts
            ref={ref => chartRefs.current[3] = ref}
            option={graficoTa} key={keyRender + 3}
            style={{ height: '500px', width: '500px', marginBottom: '20px' }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.hr && (
          <ReactEcharts
            ref={ref => chartRefs.current[4] = ref}
            option={graficoHr} key={keyRender + 4}
            style={{ height: '500px', width: '500px', marginBottom: '20px' }}
            className="react_for_echarts"
          />
        )}
        {visibleCharts.ts && (
          <ReactEcharts
            ref={ref => chartRefs.current[5] = ref}
            option={graficoTs} key={keyRender + 5}
            style={{ height: '500px', width: '500px', marginBottom: '20px' }}
            className="react_for_echarts"
          />
        )}
      </div>
    </div>
  );

  let dashboardContent: JSX.Element;

  switch (userState.idRol) {
    case 1:
      dashboardContent =
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Dashboard Super Usuario" />
            <div className="content">
              {renderComboboxes()}
            </div>
          </div>
        </Sidebar>;
      break;
    case 2:
      dashboardContent =
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Dashboard Administrador" />
            <div className="content">
              {renderComboboxes()}
            </div>
          </div>
        </Sidebar>;
      break;
    case 3:
      dashboardContent =
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Comunidad" />
            <div className="content">
              {renderComboboxes()}
            </div>
          </div>
        </Sidebar>;
      break;
    case 4:
      dashboardContent =
        <Sidebar>
          <div className="main-container">
            <Topbar />
            <BordeSuperior text="Comunidad" />
            <div className="content">
              {renderComboboxes()}
            </div>
          </div>
        </Sidebar>;
      break;
    default:
      dashboardContent = <div>No se encontró un dashboard para este rol de usuario.</div>;
      break;
  }
  return (
    <div>
      {dashboardContent}
    </div>
  );
};

export default Dashboard;
