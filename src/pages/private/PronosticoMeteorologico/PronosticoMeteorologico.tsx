import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
//import { ObtenerManejoFertilizantes, CambiarEstadoManejoFertilizantes } from "../../../servicios/ServicioFertilizantes.ts";
import { ObtenerDatosPreparacionTerreno , CambiarEstadoPreparacionTerreno  } from "../../../servicios/ServicioPreparacionTerreno.ts";
//import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import InsertarPreparacionTerreno from "../../../components/preparacionTerreno/InsertarPreparacionTerreno.tsx";
import ModificacionPreparacionTerreno from "../../../components/preparacionTerreno/EditarPreparacionTerreno.tsx";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import WeatherWidget from "../../../components/WeatherWidget/WeatherWidget.tsx";


// interface Option {
//     identificacion: string;
//     idEmpresa: number;
//     nombre: string;
//     idParcela: number;
//     idFinca: number;
// }
function PronosticoMeteorologico() {
    // const [filtroNombreActividad, setFiltroNombreActividad] = useState('');
    // const [datosPreparacionTerrenoOriginales, setDatosPreparacionTerrenoOriginales] = useState<any[]>([]);
    // const [modalEditar, setModalEditar] = useState(false);
    // const [modalInsertar, setModalInsertar] = useState(false);
    // const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    // const [selectedDatos, setSelectedDatos] = useState({
    //     idFinca: '',
    //     idParcela: '',
    //     idPreparacionTerreno : '',
    //     fecha: '',
    //     actividad : '',
    //     maquinaria : '',
    //     observaciones: ''
    // });
    // const [parcelas, setParcelas] = useState<any[]>([]);
    // const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    // const [datosPreparacionTerreno, setDatosPreparacionTerreno] = useState<any[]>([]);
    // const [datosPreparacionTerrenoFiltrados, setdatosPreparacionTerrenoFiltrados] = useState<any[]>([]);
    // const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    // const [fincas, setFincas] = useState<any[]>([]);
    // const userState = useSelector((store: AppStore) => store.user);

    // const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const value = parseInt(e.target.value);
    //     setDatosPreparacionTerreno([])
    //     setSelectedFinca(value);
    //     setSelectedParcela(null);
    // };

    // const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const value = e.target.value;
    //     setSelectedParcela(parseInt(value));
    // };

    // // Obtener las fincas al cargar la página
    // useEffect(() => { 
    //     const obtenerFincas = async () => {
    //         try {
    //             const idEmpresaString = localStorage.getItem('empresaUsuario');
    //             const identificacionString = localStorage.getItem('identificacionUsuario');
    //             if (identificacionString && idEmpresaString) {
    //                 const identificacion = identificacionString;
                    
    //                 const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
    //                 const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
    //                 const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);
                    
    //                 const fincasResponse = await ObtenerFincas();
    //                 const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
    //                 setFincas(fincasUsuario);
    //                 const parcelasResponse = await ObtenerParcelas();
    //                 const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
    //                 setParcelas(parcelasUsuario)
    //             } else {
    //                 console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
    //             }
    //         } catch (error) {
    //             console.error('Error al obtener las fincas del usuario:', error);
    //         }
    //     };
    //     obtenerFincas();
    // }, []);


    // useEffect(() => {
    //     const obtenerParcelasDeFinca = async () => {
    //         try {
                
    //                 const parcelasFinca = parcelas.filter((parcela: any) => parcela.idFinca === selectedFinca);
    //                 setParcelasFiltradas(parcelasFinca);

    //         } catch (error) {
    //             console.error('Error al obtener las parcelas de la finca:', error);
    //         }
    //     };
    //     obtenerParcelasDeFinca();
    // }, [selectedFinca]);

    // let filteredFincas: Option[] = [];

    // filteredFincas = fincas.filter(finca => finca.idEmpresa === userState.idEmpresa);

    // const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setFiltroNombreActividad(e.target.value); // Convertir a minúsculas
    // };

    
    // //este componente refrezca la tabla al momento
    // useEffect(() => {
    //     filtrarActividad();
    // }, [selectedFinca, parcelas, selectedParcela, filtroNombreActividad]);

    // //  useEffect(() => {
    // //     obtenerInfo();
    // // }, []);

   
    // const filtrarActividad = () => {
    //     const PreparacionTerrenofiltrados = filtroNombreActividad
    //         ? datosPreparacionTerreno.filter((preparacionTerreno: any) =>
    //             preparacionTerreno.actividad.toLowerCase().includes(filtroNombreActividad.toLowerCase())
    //         )
    //         : datosPreparacionTerreno;
    //         setdatosPreparacionTerrenoFiltrados(PreparacionTerrenofiltrados);

    // };

    // // hay que hacer el filtro de obtener usuarios asignados por identificacion

    // const obtenerParcelas = async () => {
    //     try {
    //         const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
    //         if (idEmpresaUsuario) {

    //             const fincas = await ObtenerFincas();

    //             const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

    //             const parcelasResponse = await ObtenerParcelas();

    //             const parcelasFincasEmpresaUsuario: any[] = [];

    //             fincasEmpresaUsuario.forEach((finca: any) => {
    //                 const parcelasFinca = parcelasResponse.filter((parcela: any) => parcela.idFinca === finca.idFinca);
    //                 parcelasFincasEmpresaUsuario.push(...parcelasFinca);
    //             });

    //             const parcelasConEstado = parcelasFincasEmpresaUsuario.map((parcela: any) => ({
    //                 ...parcela,
    //                 sEstado: parcela.estado === 1 ? 'Activo' : 'Inactivo'

    //             }));

    //             setParcelas(parcelasConEstado);
    //         }
    //     } catch (error) {
    //         console.error('Error al obtener las parcelas:', error);
    //     }
    // };

    // const obtenerInfo = async () => {
    //     try {
    //         const datosPreparacionTerreno = await ObtenerDatosPreparacionTerreno();

    //         // Convertir el estado de 0 o 1 a palabras "Activo" o "Inactivo"
    //         const datosPreparacionTerrenoConSEstado = datosPreparacionTerreno.map((dato: any) => ({
    //             ...dato,
    //             sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
    //         }));

    //         // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
    //         const datosFiltrados = datosPreparacionTerrenoConSEstado.filter((dato: any) => {
    //             //aca se hace el filtro y hasta que elija la parcela funciona
    //             return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
    //         });
    //         // Actualizar el estado con los datos filtrados
    //         setDatosPreparacionTerreno(datosFiltrados);
    //         setdatosPreparacionTerrenoFiltrados(datosFiltrados);
    //     } catch (error) {
    //         console.error('Error al obtener los datos de las Preparaciones de Terreno:', error);
    //     }
    // };

    // //esto carga la tabla al momento de hacer cambios en el filtro
    // //carga los datos de la tabla al momento de cambiar los datos de selected parcela
    // //cada vez que selected parcela cambie de datos este use effect obtiene datos
    // useEffect(()=> {
    //     obtenerInfo();
    // },[selectedParcela]);

    // const abrirCerrarModalInsertar = () => {
    //     setModalInsertar(!modalInsertar);
    // };

    // const abrirCerrarModalEditar = () => {
    //     setModalEditar(!modalEditar);
    // };

    // const openModal = (datos: any) => {
    //     setSelectedDatos(datos);
    //     abrirCerrarModalEditar();
    // };

    // const toggleStatus = async (parcela: any) => {
    //     Swal.fire({
    //         title: "Cambiar Estado",
    //         text: "¿Estás seguro de que deseas actualizar el estado?",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonText: "Sí",
    //         cancelButtonText: "No"
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             try {
    //                 const datos = {
    //                     idPreparacionTerreno : parcela.idPreparacionTerreno 
    //                 };
    //                 const resultado = await CambiarEstadoPreparacionTerreno (datos);
    //                 if (parseInt(resultado.indicador) === 1) {
    //                     Swal.fire({
    //                         icon: 'success',
    //                         title: '¡Estado Actualizado! ',
    //                         text: 'Actualización exitosa.',
    //                     });
    //                     await obtenerInfo();
    //                 } else {
    //                     Swal.fire({
    //                         icon: 'error',
    //                         title: 'Error al actualizar el estado.',
    //                         text: resultado.mensaje,
    //                     });
    //                 };
    //             } catch (error) {
    //                 Swal.fire("Error al actualizar el estado", "", "error");
    //             }
    //         }
    //     });
    // };

    // const handleEditarPreparacionTerreno = async () => {
    //     await obtenerInfo();
    //     abrirCerrarModalEditar();
    // };

    // const handleAgregarPreparacionTerreno = async () => {
    //     await obtenerInfo();
    //     abrirCerrarModalInsertar();
    // };

    // const columns2 = [
    //     { key: 'fecha', header: 'Fecha' },
    //     { key: 'actividad', header: 'Actividad' },
    //     { key: 'maquinaria', header: 'Maquinaria' },
    //     { key: 'observaciones', header: 'Observaciones' },
    //     { key: 'sEstado', header: 'Estado' },
    //     { key: 'acciones', header: 'Acciones', actions: true }
    // ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Pronóstico Meteorológico" />
                <div className="content, col-md-12" >
                <WeatherWidget />
                {/* <br />
                    <iframe src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=precipitation&lat=9.8201&lon=-83.8718&zoom=10"
                     width="600" height="400" ></iframe> */}
                </div>
            </div>


            
            
        </Sidebar>
    );
}

export default PronosticoMeteorologico;
