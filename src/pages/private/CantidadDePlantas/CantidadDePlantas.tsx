import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
// import TableResponsiveDetalles from "../../../components/table/tableDetails.tsx";
import TableResponsive from "../../../components/table/tableDelete.tsx";
//import { ObtenerManejoFertilizantes, CambiarEstadoManejoFertilizantes } from "../../../servicios/ServicioFertilizantes.ts";
import '../../../css/OrdenCompra.css'

//import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import InsertarCantidadDePlantas from "../../../components/cantidadDePlantas/InsertarCantidadDePlantas.tsx";

/////////////////////////////////
import EditarCantidadDePlantas from "../../../components/cantidadDePlantas/EditarCantidadDePlantas.tsx";

////////////////////////////


import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerUsuariosAsignados, ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario.ts";
// import DetallesCantidadDePlantas from "../../../components/cantidadDePlantas/DetallesCantidadDePlantas.tsx";
import { CambiarEstadoRegistroCantidadDePlantas, ObtenerRegistroCantidadDePlantas } from "../../../servicios/ServicioCantidadDePlantas.ts";
import { IoAddCircleOutline } from "react-icons/io5";


function CantidadDePlantas() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    // const [modalDetalles, setmodalDetalles] = useState(false);

    const [modalInsertar, setModalInsertar] = useState(false);
    //datos a editar
    const [selectedDatos, setSelectedDatos] = useState({
        idCantidadDePlantas: '',
        idFinca: '',
        idParcela: '',
        idPuntoMedicion: '',
        PuntoMedicion: '',
        cultivo: '',
        cantidadPromedioMetroCuadrado: ''
    });

    const [parcelas, setParcelas] = useState<any[]>([]);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    /////////////////////////////////////////////////////
    const [cantidadDePlantasFiltrados, setCantidadDePlantasFiltrados] = useState<any[]>([]);

    ///////////////////////////////////////////////

    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    /////////////////////////////////////
    const [cantidadDePlantas, setCantidadDePlantas] = useState<any[]>([]);
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
        obtenerRegistroCantidadDePlantas();
    }, [selectedParcela]);



    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, cantidadDePlantas, filtroNombre]);




    // Función para filtrar las parcelas
    const filtrarParcelas = () => {

        const CantidadDePlantasFiltrado = filtroNombre

            ? cantidadDePlantas.filter((cantidadDePlantas: any) =>
                cantidadDePlantas.cultivo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                cantidadDePlantas.puntoMedicion.toLowerCase().includes(filtroNombre.toLowerCase())
            )
            : cantidadDePlantas;

        setCantidadDePlantasFiltrados(CantidadDePlantasFiltrado);
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


    const obtenerRegistroCantidadDePlantas = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {

                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

                const cantidadDePlantasResponse = await ObtenerRegistroCantidadDePlantas();

                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                // devuelve las parcelas del usuario
                // const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

                const cantidadDePlantasConEstado = cantidadDePlantasResponse.map((datoCantidadDePlantas: any) => ({
                    ...datoCantidadDePlantas,
                    sEstado: datoCantidadDePlantas.estado === 1 ? 'Activo' : 'Inactivo'
                }));

                const cantidadDePlantasFiltrados = cantidadDePlantasConEstado.filter((cantidadDePlantas: any) => {


                    return cantidadDePlantas.idFinca === selectedFinca && cantidadDePlantas.idParcela === selectedParcela;

                });

                setCantidadDePlantas(cantidadDePlantasFiltrados);
                setCantidadDePlantasFiltrados(cantidadDePlantasFiltrados);


            }
        } catch (error) {
            console.error('Error al obtener los contenidos de clorofila:', error);
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
    const openModal = (cantidadDePlantas: any) => {
        setSelectedDatos(cantidadDePlantas);
        abrirCerrarModalEditar();
    };

    // const openModalDetalles = (cantidadDePlantas: any) => {
    //     setSelectedDatos(cantidadDePlantas);
    //     abrirCerrarModalDetalles();
    // };


    // // Abrir/cerrar modal de edición
    // const abrirCerrarModalDetalles = () => {
    //     setmodalDetalles(!modalDetalles);
    // };

    const handleAgregarCantidadDePlantas = async () => {
        await obtenerRegistroCantidadDePlantas();
        abrirCerrarModalInsertar();
    };

    const handleEditarCantidadDePlantas = async () => {
        await obtenerRegistroCantidadDePlantas();
        abrirCerrarModalEditar();
    };


    // Cambiar estado de la parcela
    const toggleStatus = async (cantidadDePlantas: any) => {
        Swal.fire({
            title: "Eliminar Cantidad de Plantas",
            text: "¿Estás seguro de que deseas eliminar el contenido de cantidad de plantas: " + cantidadDePlantas.cultivo + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdCantidadDePlantas: cantidadDePlantas.idCantidadDePlantas,
                    };

                    const resultado = await CambiarEstadoRegistroCantidadDePlantas(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro eliminado! ',
                            text: 'Eliminación exitosa.',
                        });
                        await obtenerRegistroCantidadDePlantas();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al elimnar el registro.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al eliminar el contenido de cantidad de plantas", "", "error");
                }
            }
        });
    };


    const columns2 = [
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'puntoMedicion', header: 'Punto de Medicion' },
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'cantidadPromedioMetroCuadrado', header: 'CantidadPromedioMetroCuadrado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    //apartado para insertar codigo html en el header
    const renderHeader = (header: any) => {
        if (header === 'CantidadPromedioMetroCuadrado') {
            return <span>Cantidad Promedio (m<sup>2</sup>)</span>;
        }
        return header;
    };

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Cantidad de Plantas" />
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
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>
                            <label htmlFor="filtroNombre">Cultivo o punto de medición:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                value={filtroNombre}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese un cultivo o punto de medición"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '280px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Ingresar cantidad de plantas</span>
                            </button>
                    </div>
                    <TableResponsive
                        //mapeo de las columnas para poder mostar texto con formato html de ser necesario
                        columns={columns2.map(col => ({ ...col, header: renderHeader(col.header) }))}
                        data={cantidadDePlantasFiltrados}
                        openModal={openModal}
                        btnActionName={"Editar"}
                        toggleStatus={toggleStatus}
                        useTrashIcon={true} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar cantidad de plantas"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <InsertarCantidadDePlantas
                            onAdd={handleAgregarCantidadDePlantas}
                        />
                    </div>
                </div>
            </Modal>

            {<Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Cantidad De Plantas"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarCantidadDePlantas
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idCantidadDePlantas={selectedDatos.idCantidadDePlantas}
                            idPuntoMedicion={selectedDatos.idPuntoMedicion}
                            cultivo={selectedDatos.cultivo}
                            cantidadPromedioMetroCuadrado={selectedDatos.cantidadPromedioMetroCuadrado}
                            onEdit={handleEditarCantidadDePlantas}
                        />
                    </div>
                </div>
            </Modal>}
        </Sidebar>
    );
}

export default CantidadDePlantas;
