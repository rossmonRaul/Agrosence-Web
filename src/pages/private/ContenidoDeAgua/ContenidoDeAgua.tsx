
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import TableResponsiveDetalles from "../../../components/table/tableDetails.tsx";
import { ObtenerRegistroContenidoDeAgua, CambiarEstadoRegistroContenidoDeAgua } from "../../../servicios/ServicioContenidoDeAgua.ts";
import InsertarContenidoDeAgua from "../../../components/contenidoDeAgua/InsertarContenidoDeAgua.tsx";
import EditarContenidoDeAgua from "../../../components/contenidoDeAgua/EditarContenidoDeAgua.tsx";
import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerUsuariosAsignados, ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario.ts";
import DetallesContenidoDeAgua from "../../../components/contenidoDeAgua/DetallesContenidoDeAgua.tsx";
import '../../../css/OrdenCompra.css'
import { IoAddCircleOutline } from "react-icons/io5";


function AdministrarContenidoDeAgua() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDetalles, setmodalDetalles] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);

    //Datos Por Editar 
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idContenidoDeAgua: '',
        idPuntoMedicion: '',
        fechaMuestreo: '',
        contenidoDeAguaEnSuelo: '',
        contenidoDeAguaEnPlanta: '',
        metodoDeMedicion: '',
        condicionSuelo: '',
    });

    const [parcelas, setParcelas] = useState<any[]>([]);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    /////////////////////////////////////////////////////
    const [contenidoDeAguaFiltrados, setContenidoDeAguaFiltrados] = useState<any[]>([]);

    ///////////////////////////////////////////////

    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    /////////////////////////////////////
    const [contenidoDeAgua, setContenidoDeAgua] = useState<any[]>([]);
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
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresaString));
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresaString));
                    //se filtran las parcelas con los idparcelasusuario
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));

                    setParcelas(parcelasUsuario)
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
        obtenerRegistroContenidoDeAgua();
    }, [selectedParcela]);



    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, contenidoDeAgua, filtroNombre]);




    // Función para filtrar las parcelas
    const filtrarParcelas = () => {

        const ContenidoDeAguaFiltrado = filtroNombre




            ? contenidoDeAgua.filter((contenidoDeAgua: any) =>
                contenidoDeAgua.cultivo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                contenidoDeAgua.codigo.toLowerCase().includes(filtroNombre.toLowerCase())
            )
            : contenidoDeAgua;

        setContenidoDeAguaFiltrados(ContenidoDeAguaFiltrado);
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


    const obtenerRegistroContenidoDeAgua = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {

                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

                const contenidoDeAguaResponse = await ObtenerRegistroContenidoDeAgua();
                console.log("obj", contenidoDeAguaResponse)
                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                // devuelve las parcelas del usuario
                // const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

                const contenidoDeAguaConEstado = contenidoDeAguaResponse.map((datoContenidoDeAgua: any) => ({
                    ...datoContenidoDeAgua,
                    sEstado: datoContenidoDeAgua.estado === 1 ? 'Activo' : 'Inactivo'
                }));

                const contenidoDeAguaFiltrados = contenidoDeAguaConEstado.filter((contenidoDeAgua: any) => {


                    return contenidoDeAgua.idFinca === selectedFinca && contenidoDeAgua.idParcela === selectedParcela;

                });

                setContenidoDeAgua(contenidoDeAguaFiltrados);
                setContenidoDeAguaFiltrados(contenidoDeAguaFiltrados);
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
    const openModal = (contenidoDeAgua: any) => {
        setSelectedDatos(contenidoDeAgua);
        abrirCerrarModalEditar();
    };

    const openModalDetalles = (contenidoDeAgua: any) => {
        setSelectedDatos(contenidoDeAgua);
        abrirCerrarModalDetalles();
    };


    // Abrir/cerrar modal de edición
    const abrirCerrarModalDetalles = () => {
        setmodalDetalles(!modalDetalles);
    };

    const handleAgregarContenidoDeAgua = async () => {
        await obtenerRegistroContenidoDeAgua();
        abrirCerrarModalInsertar();
    };

    const handleEditarContenidoDeAgua = async () => {
        await obtenerRegistroContenidoDeAgua();
        abrirCerrarModalEditar();
    };


    // Cambiar estado de la parcela
    const toggleStatus = async (contenidoDeAgua: any) => {
        Swal.fire({
            title: "Eliminar Contenido de Agua",
            text: "¿Estás seguro de que deseas eliminar el Contenido de Agua? ",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdContenidoDeAgua: contenidoDeAgua.idContenidoDeAgua,
                    };

                    const resultado = await CambiarEstadoRegistroContenidoDeAgua(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro eliminado! ',
                            text: 'Eliminación exitosa.',
                        });
                        await obtenerRegistroContenidoDeAgua();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al elimnar el registro.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al eliminar el contenido de Agua", "", "error");
                }
            }
        });
    };


    const columns2 = [

        { key: 'codigo', header: 'Punto De Medición' },
        { key: 'fechaMuestreo', header: 'Fecha Muestreo' },
        { key: 'metodoDeMedicion', header: 'Metodo Medicion' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];


    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Contenido de Agua" />
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
                            <span style={{ marginLeft: '5px' }}>Ingresar contenido de Agua</span>
                            </button>
                    </div>
                    {/* openModalDetalles */}

                    <TableResponsiveDetalles
                        columns={columns2}
                        data={contenidoDeAguaFiltrados}
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
                title="Insertar Contenido de Agua"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <InsertarContenidoDeAgua
                            onAdd={handleAgregarContenidoDeAgua}
                        />
                    </div>
                </div>
            </Modal>

            {<Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Contenido de Agua"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarContenidoDeAgua
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idContenidoDeAgua={selectedDatos.idContenidoDeAgua}
                            idPuntoMedicion={selectedDatos.idPuntoMedicion}
                            fechaMuestreo={selectedDatos.fechaMuestreo}
                            contenidoDeAguaEnSuelo={selectedDatos.contenidoDeAguaEnSuelo}
                            contenidoDeAguaEnPlanta={selectedDatos.contenidoDeAguaEnPlanta}
                            metodoDeMedicion={selectedDatos.metodoDeMedicion}
                            condicionSuelo={selectedDatos.condicionSuelo}
                            onEdit={handleEditarContenidoDeAgua}
                        />
                    </div>
                </div>
            </Modal>}
            {<Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles Contenido de Agua"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <DetallesContenidoDeAgua

                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idContenidoDeAgua={selectedDatos.idContenidoDeAgua}
                            idPuntoMedicion={selectedDatos.idPuntoMedicion}
                            fechaMuestreo={selectedDatos.fechaMuestreo}
                            contenidoDeAguaEnSuelo={selectedDatos.contenidoDeAguaEnSuelo}
                            contenidoDeAguaEnPlanta={selectedDatos.contenidoDeAguaEnPlanta}
                            metodoDeMedicion={selectedDatos.metodoDeMedicion}
                            condicionSuelo={selectedDatos.condicionSuelo}
                        />
                    </div>
                </div>
            </Modal>}
        </Sidebar>
    );
}

export default AdministrarContenidoDeAgua;