import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Modal from "../../../components/modal/Modal";
import Topbar from "../../../components/topbar/Topbar";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas";
import { ObtenerDatosPreparacionTerreno, CambiarEstadoPreparacionTerreno, ObtenerDatosPreparacionTerrenoActividad, ObtenerDatosPreparacionTerrenoMaquinaria } from "../../../servicios/ServicioPreparacionTerreno";
import InsertarPreparacionTerreno from "../../../components/preparacionTerreno/InsertarPreparacionTerreno";
import ModificacionPreparacionTerreno from "../../../components/preparacionTerreno/EditarPreparacionTerreno";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import '../../../css/FormSeleccionEmpresa.css';
import '../../../css/OrdenCompra.css'
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store";
import { IoAddCircleOutline } from "react-icons/io5";

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

function AdministrarPreparacionTerreno() {
    const [filtroNombreActividad, setFiltroNombreActividad] = useState('');
    const [datosPreparacionTerrenoOriginales, setDatosPreparacionTerrenoOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idPreparacionTerreno: '',
        fecha: '',
        idActividad: '',
        idMaquinaria: '',
        observaciones: '',
        identificacion: '',
        horasTrabajadas: '',
        pagoPorHora: '',
        totalPago: ''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [datosPreparacionTerreno, setDatosPreparacionTerreno] = useState<any[]>([]);
    const [datosPreparacionTerrenoFiltrados, setdatosPreparacionTerrenoFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);
    const [actividades, setActividades] = useState<any[]>([]);
    const [maquinarias, setMaquinarias] = useState<any[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

    useEffect(() => {
        const obtenerActividadesYMaquinarias = async () => {
            try {
                const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
                const maquinariasResponse = await ObtenerDatosPreparacionTerrenoMaquinaria();
                setActividades(actividadesResponse);
                setMaquinarias(maquinariasResponse);
            } catch (error) {
                console.error('Error al obtener actividades y maquinarias:', error);
            }
        };

        obtenerActividadesYMaquinarias();
    }, []);

    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setDatosPreparacionTerreno([]);
        setSelectedFinca(value);
        setSelectedParcela(null);
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(parseInt(value));
    };

    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {

                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);
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
        const obtenerParcelasDeFinca = async () => {
            try {
                const parcelasFinca = parcelas.filter((parcela: any) => parcela.idFinca === selectedFinca);
                setParcelasFiltradas(parcelasFinca);
            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        obtenerParcelasDeFinca();
    }, [selectedFinca]);

    let filteredFincas: Option[] = [];

    filteredFincas = fincas.filter(finca => finca.idEmpresa === userState.idEmpresa);

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombreActividad(e.target.value);
    };

    useEffect(() => {
        filtrarActividad();
    }, [selectedFinca, parcelas, selectedParcela, filtroNombreActividad]);

    const filtrarActividad = () => {
        const PreparacionTerrenofiltrados = filtroNombreActividad
            ? datosPreparacionTerreno.filter((preparacionTerreno: any) =>
                preparacionTerreno.actividad.toLowerCase().includes(filtroNombreActividad.toLowerCase())
            )
            : datosPreparacionTerreno;
        setdatosPreparacionTerrenoFiltrados(PreparacionTerrenofiltrados);
    };

    const obtenerInfo = async () => {
        try {
            const datosPreparacionTerreno = await ObtenerDatosPreparacionTerreno();

            const datosPreparacionTerrenoConSEstado = datosPreparacionTerreno
                .filter((dato: any) => dato.estado === 1) // Filtrar registros con estado igual a 1
                .map((dato: any) => ({
                    ...dato,
                    sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
                }));

            const datosFiltrados = datosPreparacionTerrenoConSEstado.filter((dato: any) => {
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            }).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Ordenar por fecha

            setDatosPreparacionTerreno(datosFiltrados);
            setdatosPreparacionTerrenoFiltrados(datosFiltrados);
        } catch (error) {
            console.error('Error al obtener los datos de las Preparaciones de Terreno:', error);
        }
    };

    useEffect(() => {
        obtenerInfo();
    }, [selectedParcela]);

    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    const abrirCerrarModalDetalles = () => {
        setModalDetalles(!modalDetalles);
    };

    const openModal = (datos: any) => {
        const actividad = actividades.find((act: any) => act.nombre === datos.actividad);
        const maquinaria = maquinarias.find((maq: any) => maq.nombre === datos.maquinaria);

        setSelectedDatos({
            ...datos,
            idActividad: actividad ? actividad.idActividad : '',
            idMaquinaria: maquinaria ? maquinaria.idMaquinaria : ''
        });
        abrirCerrarModalEditar();
    };

    const openDetallesModal = (datos: any) => {
        const actividad = actividades.find((act: any) => act.nombre === datos.actividad);
        const maquinaria = maquinarias.find((maq: any) => maq.nombre === datos.maquinaria);

        setSelectedDatos({
            ...datos,
            idActividad: actividad ? actividad.idActividad : '',
            idMaquinaria: maquinaria ? maquinaria.idMaquinaria : ''
        });
        abrirCerrarModalDetalles();
    };

    const toggleStatus = async (parcela: any) => {
        Swal.fire({
            title: "Eliminar Registro",
            text: "¿Estás seguro de que deseas eliminar el registro?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idPreparacionTerreno: parcela.idPreparacionTerreno
                    };
                    const resultado = await CambiarEstadoPreparacionTerreno(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro Eliminado! ',
                            text: 'El registro ha sido eliminado exitosamente.',
                        });
                        await obtenerInfo();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar el registro.',
                            text: resultado.mensaje,
                        });
                    }
                } catch (error) {
                    Swal.fire("Hubo un problema al intentar eliminar el registro.", "", "error");
                }
            }
        });
    };

    const handleEditarPreparacionTerreno = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarPreparacionTerreno = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns2 = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'actividad', header: 'Actividad' },
        { key: 'maquinaria', header: 'Maquinaria' },
        { key: 'horasTrabajadas', header: 'Horas Trabajadas' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Preparación de Terreno" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label >Finca:</label>
                            <select
                                value={selectedFinca || ''}
                                onChange={handleFincaChange}
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="custom-select">
                                <option value="">Seleccione la finca...</option>
                                {filteredFincas.map(finca => (
                                    <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label >Parcela:</label>
                            <select
                                value={selectedParcela ? selectedParcela : ''}
                                onChange={handleParcelaChange}
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="custom-select">
                                <option value="">Seleccione la parcela...</option>
                                {parcelasFiltradas.map(parcela => (
                                    <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>
                            <label htmlFor="filtroNombreActividad">Actividad:</label>
                            <input
                                type="text"
                                id="filtroNombreActividad"
                                value={filtroNombreActividad}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese el nombre del Actividad"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '250px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px',backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear preparación de terreno</span>
                            </button>
                    </div>
                    <TableResponsive columns={columns2} data={datosPreparacionTerrenoFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} openDetallesModal={openDetallesModal} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Crear preparación de terreno "
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container' style={{ width: '90%' }}>
                    <div className='form-group'>
                        <InsertarPreparacionTerreno onAdd={handleAgregarPreparacionTerreno} />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar preparación de terreno"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container' style={{ width: '85%' }}>
                    <div className='form-group'>
                        <ModificacionPreparacionTerreno
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idPreparacionTerreno={parseInt(selectedDatos.idPreparacionTerreno)}
                            fecha={selectedDatos.fecha.toString()}
                            idActividad={parseInt(selectedDatos.idActividad)}
                            idMaquinaria={parseInt(selectedDatos.idMaquinaria)}
                            observaciones={selectedDatos.observaciones}
                            identificacion={selectedDatos.identificacion}
                            horasTrabajadas={selectedDatos.horasTrabajadas}
                            pagoPorHora={selectedDatos.pagoPorHora}
                            totalPago={parseFloat(selectedDatos.totalPago)}
                            onEdit={handleEditarPreparacionTerreno}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles de la preparación de terreno"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container' style={{  width: '85%' }}>
                    <div className='form-group'>
                        <ModificacionPreparacionTerreno
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idPreparacionTerreno={parseInt(selectedDatos.idPreparacionTerreno)}
                            fecha={selectedDatos.fecha.toString()}
                            idActividad={parseInt(selectedDatos.idActividad)}
                            idMaquinaria={parseInt(selectedDatos.idMaquinaria)}
                            observaciones={selectedDatos.observaciones}
                            identificacion={selectedDatos.identificacion}
                            horasTrabajadas={selectedDatos.horasTrabajadas}
                            pagoPorHora={selectedDatos.pagoPorHora}
                            totalPago={parseFloat(selectedDatos.totalPago)}
                            readOnly
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarPreparacionTerreno;
