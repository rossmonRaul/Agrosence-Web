import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import TableResponsiveDetalles from "../../../components/table/tableDetails.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerUsuariosAsignadosPorIdentificacion, ObtenerUsuariosAsignados } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import '../../../css/OrdenCompra.css'
import CrearEficienciaRiegos from "../../../components/eficienciaRiego/InsertarEficienciaRiego.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import ModificacionEficienciaRiego from "../../../components/eficienciaRiego/EditarEficienciaRiego.tsx";
import { CambiarEstadoEficienciaRiego, ObtenerEficienciaRiego } from "../../../servicios/ServicioRiego.ts";
import { IoAddCircleOutline } from "react-icons/io5";

function AdministrarEficienciaRiegos() {

    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idMonitoreoEficienciaRiego: '',
        volumenAguaUtilizado: '',
        estadoTuberiasYAccesorios: false,
        uniformidadRiego: false,
        //  estadoAspersores: false,
        estadoCanalesRiego: false,
        nivelFreatico: '',
        uniformidadalerta: '',
        uniformidaddetalles: '',
        fugasalerta: '',
        fugasdetalles: '',
        canalesalerta: '',
        canalesdetalles: '',
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [datosRiegosFiltrados, setdatosRiegosFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

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


    // const obtenerInfo = async () => {
    //     try {
    //         const datosRiegos = await ObtenerEficienciaRiego();
    //         // Convertir los datos bit en legibles
    //         const datosRiegosConSEstado = datosRiegos.map((dato: any) => ({
    //             ...dato,
    //             sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo',
    //             sFugas: dato.estadoTuberiasYAccesorios === true ? 'Tiene Fugas' : 'No Tiene Fugas',
    //             sUniformidadRiego: dato.uniformidadRiego === true ? 'Tiene Uniformidad' : 'No Tiene Uniformidad',
    //           //  sEstadoAspersores: dato.estadoAspersores === true ? 'Tiene Obstrucciones' : 'No Tiene Obstrucciones',
    //             sEstadoCanalesRiego: dato.estadoCanalesRiego === true ? 'Tiene Obstrucciones' : 'No Tiene Obstrucciones'
    //         }));

    //         // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
    //         const datosFiltrados = datosRiegosConSEstado.filter((dato: any) => {
    //             //aca se hace el filtro y hasta que elija la parcela funciona
    //             return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
    //         });


    //         setdatosRiegosFiltrados(datosFiltrados);
    //     } catch (error) {
    //         console.error('Error al obtener los datos de los riegos:', error);
    //     }
    // };


    const obtenerInfo = async () => {

        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {

                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

                const datosRiegos = await ObtenerEficienciaRiego();
                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                // devuelve las parcelas del usuario
                // const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

                const datosRiegosConSEstado = datosRiegos.map((dato: any) => ({
                    ...dato,
                    sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo',
                    sFugas: dato.estadoTuberiasYAccesorios === true ? 'Tiene Fugas' : 'No Tiene Fugas',
                    sUniformidadRiego: dato.uniformidadRiego === true ? 'Tiene Uniformidad' : 'No Tiene Uniformidad',
                    //  sEstadoAspersores: dato.estadoAspersores === true ? 'Tiene Obstrucciones' : 'No Tiene Obstrucciones',
                    sEstadoCanalesRiego: dato.estadoCanalesRiego === true ? 'Tiene Obstrucciones' : 'No Tiene Obstrucciones'
                }));




                // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
                const datosFiltrados = datosRiegosConSEstado.filter((dato: any) => {
                    //aca se hace el filtro y hasta que elija la parcela funciona
                    return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
                });



                setdatosRiegosFiltrados(datosFiltrados);
            }
        } catch (error) {
            console.error('Error al obtener los contenidos de Agua:', error);
        }
    };


    //esto carga la tabla al momento de hacer cambios en el filtro
    //carga los datos de la tabla al momento de cambiar los datos de selected parcela
    //cada vez que selected parcela cambie de datos este use effect obtiene datos
    useEffect(() => {
        obtenerInfo();
    }, [selectedParcela]);

    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    const openModal = (datos: any) => {
        setSelectedDatos(datos);
        abrirCerrarModalEditar();
    };

    const toggleStatus = async (eficienciaRiego: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar la Eficiencia de Riego?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idMonitoreoEficienciaRiego: eficienciaRiego.idMonitoreoEficienciaRiego
                    };

                    const resultado = await CambiarEstadoEficienciaRiego(datos);

                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminacion exitosa! ',
                            text: 'Se eliminó el registro de Eficiencia de Riego.',
                        });
                        await obtenerInfo();
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




    const handleEditarRiego = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarRiego = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns2 = [
        { key: 'volumenAguaUtilizado', header: 'Consumo Agua' },
        { key: 'nivelFreatico', header: 'Nivel Freático' },
        { key: 'sFugas', header: 'Fugas' },
        { key: 'sUniformidadRiego', header: 'Uniformidad Riego' },
        //   { key: 'sEstadoAspersores', header: 'Obstrucciones en Aspersores' },
        { key: 'sEstadoCanalesRiego', header: 'Obstrucciones en Canales' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Eficiencia de Riego" />
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
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px',backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear riego</span>
                        </button>
                    </div>
                    <TableResponsive
                        columns={columns2}
                        data={datosRiegosFiltrados}
                        openModal={openModal}
                        btnActionName={"Editar"}
                        toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Eficiencia del riego"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear la eficiencia del residuo*/}
                        <CrearEficienciaRiegos
                            onAdd={handleAgregarRiego}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Eficiencia Riegos"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <ModificacionEficienciaRiego
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idMonitoreoEficienciaRiego={parseInt(selectedDatos.idMonitoreoEficienciaRiego)}
                            volumenAguaUtilizado={selectedDatos.volumenAguaUtilizado}
                            estadoTuberiasYAccesorios={selectedDatos.estadoTuberiasYAccesorios}
                            uniformidadRiego={selectedDatos.uniformidadRiego}
                            //  estadoAspersores={selectedDatos.estadoAspersores}
                            estadoCanalesRiego={selectedDatos.estadoCanalesRiego}
                            nivelFreatico={selectedDatos.nivelFreatico}
                            uniformidadalerta={selectedDatos.uniformidadalerta}
                            uniformidaddetalles={selectedDatos.uniformidaddetalles}
                            fugasalerta={selectedDatos.fugasalerta}
                            fugasdetalles={selectedDatos.fugasdetalles}
                            canalesalerta={selectedDatos.canalesalerta}
                            canalesdetalles={selectedDatos.canalesdetalles}

                            onEdit={handleEditarRiego}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarEficienciaRiegos;
