
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsiveDetalles from "../../../components/table/tableDetails.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerUsuariosAsignadosPorIdentificacion, ObtenerUsuariosAsignados } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import EditarProblemaPlagas from "../../../components/problemasPlagas/EditarProblemaPlagas.tsx";
import { CambiarEstadoRegistroSeguimientoPlagasyEnfermedades, ObtenerRegistroSeguimientoPlagasyEnfermedades } from "../../../servicios/ServicioProblemas.ts";
import CrearProblemaPlagas from "../../../components/problemasPlagas/InsertarProblemasPlagas.tsx";
import DetallesProblemasPlagas from "../../../components/problemasPlagas/DetallesProblemasPlagas.tsx";
import '../../../css/OrdenCompra.css'
import { IoAddCircleOutline } from "react-icons/io5";

function ProblemasPlagas() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDetalles, setmodalDetalles] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);

    //Datos Por Editar 
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idRegistroSeguimientoPlagasYEnfermedades: '',
        fecha: '',
        cultivo: '',
        plagaEnfermedad: '',
        incidencia: '',
        metodologiaEstimacion: '',
        problema: '',
        accionTomada: '',
        estado: '',
        valor: '',
    });

    const [parcelas, setParcelas] = useState<any[]>([]);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    /////////////////////////////////////////////////////
    const [problemasPlagasFiltrados, setProblemasPlagasFiltrados] = useState<any[]>([]);

    ///////////////////////////////////////////////

    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    /////////////////////////////////////
    const [problemasPlagas, setProblemasplagas] = useState<any[]>([]);
    ////////////////////////////////////////////


    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setSelectedFinca(value);
        setSelectedParcela(null);
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(parseInt(value));
    };

    // Obtener las fincas al cargar la página
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
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    //se filtran las parcelas con los idparcelasusuario
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));

                    setParcelas(parcelasUsuario)
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


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombre(e.target.value);
    };


    // Obtener parcelas cuando cambie la finca seleccionada
    useEffect(() => {
        ObtenerInfo();
    }, [selectedParcela]);



    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, problemasPlagas, filtroNombre]);




    // Función para filtrar las parcelas
    const filtrarParcelas = () => {

        const problemasPlagasFiltrados = filtroNombre




            ? problemasPlagas.filter((problemasPlagas: any) =>
                problemasPlagas.cultivo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                problemasPlagas.codigo.toLowerCase().includes(filtroNombre.toLowerCase())
            )
            : problemasPlagas;

        setProblemasPlagasFiltrados(problemasPlagasFiltrados);
    };





    useEffect(() => {
        const obtenerParcelasDeFinca = async () => {
            try {
                const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === selectedFinca);
                //se asigna las parcelas de la IdFinca que se selecciona y se pone en parcelasfiltradas
                setParcelasFiltradas(parcelasFinca);

            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        obtenerParcelasDeFinca();
    }, [selectedFinca]);


    const ObtenerInfo = async () => {

        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {

                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

                const problemaPlagasResponse = await ObtenerRegistroSeguimientoPlagasyEnfermedades();
                console.log("obj", problemaPlagasResponse)
                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                // devuelve las parcelas del usuario
                // const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

                const problemasPlagasConEstado = problemaPlagasResponse.map((datoproblemasPlagas: any) => ({
                    ...datoproblemasPlagas,
                    sEstado: datoproblemasPlagas.estado === 1 ? 'Activo' : 'Inactivo'
                }));

                const problemasPlagasFiltrados = problemasPlagasConEstado.filter((problemasPlagas: any) => {


                    return problemasPlagas.idFinca === selectedFinca && problemasPlagas.idParcela === selectedParcela;

                });

                setProblemasplagas(problemasPlagasFiltrados);
                setProblemasPlagasFiltrados(problemasPlagasFiltrados);
            }
        } catch (error) {
            console.error('Error al obtener los contenidos de Agua:', error);
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
    const openModal = (problemasPlagas: any) => {
        setSelectedDatos(problemasPlagas);
        abrirCerrarModalEditar();
    };

    const openModalDetalles = (problemasPlagas: any) => {
        setSelectedDatos(problemasPlagas);
        abrirCerrarModalDetalles();
    };


    // Abrir/cerrar modal de edición
    const abrirCerrarModalDetalles = () => {
        setmodalDetalles(!modalDetalles);
    };

    const handleAgregarProblema = async () => {
        await ObtenerInfo();
        abrirCerrarModalInsertar();
    };

    const handleEditarProblema = async () => {
        await ObtenerInfo();
        abrirCerrarModalEditar();
    };


    // // Cambiar estado de la parcela
    // const toggleStatus = async (problemasPlagas: any) => {
    //     Swal.fire({
    //         title: "Eliminar",
    //         text: "¿Estás seguro de que deseas eliminar el Problema de Plagas o Enfermedad  ?",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonText: "Sí",
    //         cancelButtonText: "No"
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             try {
    //                 const datos = {
    //                     idRegistroSeguimientoPlagasYEnfermedades: problemasPlagas.idRegistroSeguimientoPlagasYEnfermedades,
    //                 };

    //                 const resultado = await CambiarEstadoRegistroSeguimientoPlagasyEnfermedades(datos);

    //                 if (parseInt(resultado.indicador) === 1) {

    //                     /*este await recarga la tabla con los nuevos datos actualizados*/
    //                     await ObtenerRegistroSeguimientoPlagasyEnfermedades();
    //                     Swal.fire({
    //                         icon: 'success',
    //                         title: '¡Eliminacion exitosa! ',
    //                         text: 'Se eliminó el Problema.',
    //                     });
    //                 } else {
    //                     Swal.fire({
    //                         icon: 'error',
    //                         title: 'Error al eliminar',
    //                         text: resultado.mensaje,
    //                     });
    //                 };
    //             } catch (error) {
    //                 Swal.fire("Error al actualizar el estado", "", "error");
    //             }
    //         }
    //     });
    // };
    const toggleStatus = async (problemasPlagas: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar el Problema Plagas o Enfermedad?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idRegistroSeguimientoPlagasYEnfermedades: problemasPlagas.idRegistroSeguimientoPlagasYEnfermedades,
                    };

                    const resultado = await CambiarEstadoRegistroSeguimientoPlagasyEnfermedades(datos);

                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminacion exitosa! ',
                            text: 'Se eliminó el registro de problema de plagas o enfermedad.',
                        });
                        await ObtenerInfo();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado", "", "error");
                }
            }
        });
    };




    const columns2 = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'plagaEnfermedad', header: 'Plaga o Enfermedad' },
        { key: 'incidencia', header: 'Valoracion' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];


    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Problemas de Plagas o Enfermedades" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label >Finca:</label>
                            <select
                                value={selectedFinca || ''}
                                onChange={handleFincaChange}
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="custom-select">
                                <option value={0}>Seleccione una finca</option>
                                {fincas.map(finca => (
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

                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear Problema o Enfermedad</span>
                            </button>
                    </div>
                    {/* openModalDetalles */}

                    <TableResponsiveDetalles
                        columns={columns2}
                        data={problemasPlagasFiltrados}
                        openModalDetalles={openModalDetalles}
                        btnActionNameDetails={"Detalles"}
                        openModal={openModal}
                        btnActionName={"Editar"}
                        toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Problemas plagas o enfermedades"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearProblemaPlagas
                            onAdd={handleAgregarProblema}
                        />
                    </div>
                </div>
            </Modal>

            {<Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Problema de plagas o enfermedades"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarProblemaPlagas
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idRegistroSeguimientoPlagasYEnfermedades={selectedDatos.idRegistroSeguimientoPlagasYEnfermedades}
                            fecha={selectedDatos.fecha}
                            cultivo={selectedDatos.cultivo}
                            plagaEnfermedad={selectedDatos.plagaEnfermedad}
                            incidencia={selectedDatos.incidencia}
                            metodologiaEstimacion={selectedDatos.metodologiaEstimacion}
                            problema={selectedDatos.problema}
                            accionTomada={selectedDatos.accionTomada}
                            valor={selectedDatos.valor}
                            onEdit={handleEditarProblema}
                        />
                    </div>
                </div>
            </Modal>}
            {<Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles Problema Plagas o Enfermedades"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <DetallesProblemasPlagas

                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idRegistroSeguimientoPlagasYEnfermedades={selectedDatos.idRegistroSeguimientoPlagasYEnfermedades}
                            fecha={selectedDatos.fecha}
                            cultivo={selectedDatos.cultivo}
                            plagaEnfermedad={selectedDatos.plagaEnfermedad}
                            incidencia={selectedDatos.incidencia}
                            metodologiaEstimacion={selectedDatos.metodologiaEstimacion}
                            problema={selectedDatos.problema}
                            accionTomada={selectedDatos.accionTomada}
                            valor={selectedDatos.valor}
                        />
                    </div>
                </div>
            </Modal>}
        </Sidebar>
    );
}

export default ProblemasPlagas;