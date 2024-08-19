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
import { ObtenerRegistroPuntoMedicion, CambiarEstadoRegistroPuntoMedicion } from "../../../servicios/ServicioPuntoMedicion.ts";
//import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import InsertarPuntoMedicion from "../../../components/puntoMedicion/InsertarPuntoMedicion.tsx";
import ModificacionPuntoMedicion from "../../../components/puntoMedicion/EditarPuntoMedicion.tsx";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import { IoAddCircleOutline } from "react-icons/io5";


interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}
function AdministrarPuntoMedicion() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idPuntoMedicion: '',
        codigo: '',
        altitud: '',
        latitud: '',
        longitud: '',
        nombreParcela: ''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [puntoMedicionFiltrados, setPuntoMedicionFiltrados] = useState<any[]>([]);
    const [datosPreparacionTerreno, setDatosPreparacionTerreno] = useState<any[]>([]);
    const [datosPreparacionTerrenoFiltrados, setdatosPreparacionTerrenoFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);
    const [puntoMedicion, setPuntoMedicion] = useState<any[]>([]);
    const userState = useSelector((store: AppStore) => store.user);
    const idEmpresa = localStorage.getItem('empresaUsuario');

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
    };

    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
                if (idEmpresaUsuario) {
                    const fincasResponse = await ObtenerFincas();
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaUsuario));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
                }
            } catch (error) {
                console.error('Error al obtener las fincas:', error);
            }
        };
        obtenerFincas();
    }, []);

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFiltroNombre(value);
    };


    // Obtener parcelas cuando cambie la finca seleccionada
    useEffect(() => {
        obtenerRegistroPuntoMedicion();
    }, [selectedFinca]);

    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, puntoMedicion, filtroNombre]);
    // Función para filtrar las parcelas
    const filtrarParcelas = () => {
        let puntosMedicionFiltradosPorFinca = selectedFinca
            ? puntoMedicion.filter(puntoMedicion => puntoMedicion.idFinca === parseInt(selectedFinca))
            : puntoMedicion

        // Filtrar por nombre si hay un filtro aplicado
        if (filtroNombre.trim() !== '') {
            puntosMedicionFiltradosPorFinca = puntosMedicionFiltradosPorFinca.filter(puntoMedicion =>
                puntoMedicion.codigo.toLowerCase().includes(filtroNombre.toLowerCase())
            );
        }
        setPuntoMedicionFiltrados(puntosMedicionFiltradosPorFinca);
    };


    // Obtener las parcelas
    const obtenerRegistroPuntoMedicion = async () => {
        try {
            const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
            if (idEmpresaUsuario) {

                //const fincas = await ObtenerFincas();
                //const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

                const puntosMedicionResponse = await ObtenerRegistroPuntoMedicion({ IdEmpresa: idEmpresa });
                const puntosMedicionConEstado = puntosMedicionResponse.map((puntoMedicion: any) => ({
                    ...puntoMedicion,
                    sEstado: puntoMedicion.estado === 1 ? 'Activo' : 'Inactivo'
                }));
                setPuntoMedicion(puntosMedicionConEstado);
                setPuntoMedicionFiltrados(puntosMedicionConEstado);
            }
        } catch (error) {
            console.error('Error al obtener los puntos de medición:', error);
        }
    };

    // Abrir/cerrar modal de inserción
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    // Abrir/cerrar modal de edición
    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    // Abrir modal de edición
    const openModal = (puntomedicion: any) => {
        setSelectedDatos(puntomedicion);
        abrirCerrarModalEditar();
    };

    const handleAgregarPuntoMedicion = async () => {
        await obtenerRegistroPuntoMedicion();
        abrirCerrarModalInsertar();
    };

    const handleEditarPuntoMedicion = async () => {
        await obtenerRegistroPuntoMedicion();
        abrirCerrarModalEditar();
    };
    // Cambiar estado de la parcela
    const toggleStatus = async (puntomedicion: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado del punto de medición: " + puntomedicion.codigo + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdPuntoMedicion: puntomedicion.idPuntoMedicion,
                    };
                    const resultado = await CambiarEstadoRegistroPuntoMedicion(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerRegistroPuntoMedicion();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado del punto de medición", "", "error");
                }
            }
        });
    };


    const columns2 = [
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'codigo', header: 'Código' },
        { key: 'altitud', header: 'Elevación(m s. n. m.)' },
        { key: 'latitud', header: 'Latitud' },
        { key: 'longitud', header: 'Longitud' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Punto Medición" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label htmlFor="filtroNombre">Finca:</label>
                            <select
                                value={selectedFinca || ''}
                                onChange={handleFincaChange}
                                className="custom-select"
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            >
                                <option value={''}>Todas las fincas</option>
                                {fincas.map(finca => (
                                    <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>
                            <label htmlFor="filtroNombre">Código:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                value={filtroNombre}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese algún código"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Ingresar punto de medición</span>
                        </button>
                    </div>
                    <TableResponsive columns={columns2} data={puntoMedicionFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar punto de medición"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear el manejo fertilizante */}
                        <InsertarPuntoMedicion
                            onAdd={handleAgregarPuntoMedicion}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Punto de medición"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <ModificacionPuntoMedicion
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idPuntoMedicion={parseInt(selectedDatos.idPuntoMedicion)}
                            codigo={selectedDatos.codigo}
                            altitud={selectedDatos.altitud}
                            latitud={selectedDatos.latitud}
                            longitud={selectedDatos.longitud}
                            onEdit={handleEditarPuntoMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    );
}

export default AdministrarPuntoMedicion;
