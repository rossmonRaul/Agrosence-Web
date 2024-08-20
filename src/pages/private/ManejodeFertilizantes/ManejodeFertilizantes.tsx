import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
//import TableResponsive from "../../../components/table/table.tsx";
import TableResponsiveDetalles from "../../../components/table/tableDetails.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoParcelas, ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerManejoFertilizantes, CambiarEstadoManejoFertilizantes } from "../../../servicios/ServicioFertilizantes.ts";
import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import ModificacionManejoFertilizante from "../../../components/manejoFertilizante/EditarManejoFertilizante.tsx";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import '../../../css/ordenCompra.css'
import DetallesManejoFertilizantes from "../../../components/manejoFertilizante/DetallesManejoFertilizante.tsx";
import { IoAddCircleOutline } from "react-icons/io5";

function AdministrarManejoFertilizantes() {
    const [filtroNombreFertilizante, setFiltroNombreFertilizante] = useState('');
    const [datosFertilizantesOriginales, setDatosFertilizantesOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [modalDetalles, setmodalDetalles] = useState(false);

    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idManejoFertilizantes: '',
        fecha: '',
        fertilizante: '',
        aplicacion: '',
        dosis: '',
        dosisUnidad: '',
        cultivoTratado: '',
        condicionesAmbientales: '',
        accionesAdicionales: '',
        observaciones: ''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [datosFertilizantes, setDatosFertilizantes] = useState<any[]>([]);
    const [datosFertilizantesFiltrados, setdatosFertilizantesFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setDatosFertilizantes([])
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


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombreFertilizante(e.target.value); // Convertir a minúsculas
    };


    //este componente refrezca la tabla al momento
    useEffect(() => {
        filtrarFertilizantes();
    }, [selectedFinca, parcelas, selectedParcela, filtroNombreFertilizante]);

    //  useEffect(() => {
    //     obtenerInfo();
    // }, []);


    const filtrarFertilizantes = () => {
        const fertilizantesFiltrados = filtroNombreFertilizante
            ? datosFertilizantes.filter((fertilizante: any) =>
                fertilizante.fertilizante.toLowerCase().includes(filtroNombreFertilizante.toLowerCase())
            )
            : datosFertilizantes;
        setdatosFertilizantesFiltrados(fertilizantesFiltrados);

    };

    // hay que hacer el filtro de obtener usuarios asignados por identificacion

    const obtenerParcelas = async () => {
        try {
            const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
            if (idEmpresaUsuario) {
                const idEmpresa = localStorage.getItem('empresaUsuario');
                if (idEmpresa) {
                const fincas = await ObtenerFincas(parseInt(idEmpresa));

                const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

                const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));

                const parcelasFincasEmpresaUsuario: any[] = [];

                fincasEmpresaUsuario.forEach((finca: any) => {
                    const parcelasFinca = parcelasResponse.filter((parcela: any) => parcela.idFinca === finca.idFinca);
                    parcelasFincasEmpresaUsuario.push(...parcelasFinca);
                });

                const parcelasConEstado = parcelasFincasEmpresaUsuario.map((parcela: any) => ({
                    ...parcela,
                    sEstado: parcela.estado === 1 ? 'Activo' : 'Inactivo'

                }));

                setParcelas(parcelasConEstado);
            }
            }
        } catch (error) {
            console.error('Error al obtener las parcelas:', error);
        }
    };

    const obtenerInfo = async () => {
        try {
            const datosFertilizante = await ObtenerManejoFertilizantes();

            // Convertir el estado de 0 o 1 a palabras "Activo" o "Inactivo"
            const datosFertilizanteConSEstado = datosFertilizante.map((dato: any) => ({
                ...dato,
                sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
            }));

            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosFertilizanteConSEstado.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });
            // Actualizar el estado con los datos filtrados
            setDatosFertilizantes(datosFiltrados);
            setdatosFertilizantesFiltrados(datosFiltrados);
        } catch (error) {
            console.error('Error al obtener los datos de los fertilizantes:', error);
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




    const openModalDetalles = (CoberturaVegetal: any) => {
        setSelectedDatos(CoberturaVegetal);
        abrirCerrarModalDetalles();
    };

    // Abrir/cerrar modal de edición
    const abrirCerrarModalDetalles = () => {
        setmodalDetalles(!modalDetalles);
    };

    const toggleStatus = async (parcela: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idManejoFertilizantes: parcela.idManejoFertilizantes
                    };
                    const resultado = await CambiarEstadoManejoFertilizantes(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro eliminado! ',
                            text: 'Eliminación exitosa.',
                        });
                        await obtenerInfo();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar el registro.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al eliminar el registro", "", "error");
                }
            }
        });
    };

    const handleEditarManejoFertilizante = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarManejoFertilizante = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };


    const columns2 = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'fertilizante', header: 'Fertilizante' },
        { key: 'aplicacion', header: 'Aplicación' },
        { key: 'cultivoTratado', header: 'Cultivo Tratado' },

        { key: 'acciones', header: 'Acciones', actions: true }
    ];
    // Dentro de renderHeader, si necesitas algún formato especial, puedes ajustarlo según tus necesidades
    const renderHeader = (header: any) => {
        if (header === 'Densidad Maleza') {
            return <span>Densidad Maleza</span>;
        }
        return header;
    };

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Manejo de Fertilizantes" />
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
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>
                            <label htmlFor="filtroNombreFertilizante">Fertilizante:</label>
                            <input
                                type="text"
                                id="filtroNombreFertilizante"
                                value={filtroNombreFertilizante}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese el nombre del fertilizante"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '250px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Ingresar registro de fertilizante</span>
                        </button>
                    </div>
                    {/* openModalDetalles */}

                    <TableResponsiveDetalles
                        columns={columns2.map(col => ({ ...col, header: renderHeader(col.header) }))}
                        data={datosFertilizantesFiltrados}
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
                title="Manejo Fertilizantes"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear el manejo fertilizante */}
                        <InsertarManejoFertilizante
                            onAdd={handleAgregarManejoFertilizante}
                        />
                    </div>
                </div>
            </Modal>

            {<Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles Manejo de Fertilizantes"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <DetallesManejoFertilizantes
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idManejoFertilizantes={selectedDatos.idManejoFertilizantes}
                            fechaCreacion={selectedDatos.fecha.toString()}
                            fertilizante={selectedDatos.fertilizante}
                            aplicacion={selectedDatos.aplicacion}
                            dosis={parseInt(selectedDatos.dosis)}
                            dosisUnidad={selectedDatos.dosisUnidad}
                            cultivoTratado={selectedDatos.cultivoTratado}
                            condicionesAmbientales={selectedDatos.condicionesAmbientales}
                            accionesAdicionales={selectedDatos.accionesAdicionales}
                            observaciones={selectedDatos.observaciones}
                        />
                    </div>
                </div>
            </Modal>}

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Manejo de Fertilizantes"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <ModificacionManejoFertilizante
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idManejoFertilizantes={parseInt(selectedDatos.idManejoFertilizantes)}
                            fechaCreacion={selectedDatos.fecha.toString()}
                            fertilizante={selectedDatos.fertilizante}
                            aplicacion={selectedDatos.aplicacion}
                            dosis={parseInt(selectedDatos.dosis)}
                            dosisUnidad={selectedDatos.dosisUnidad}
                            cultivoTratado={selectedDatos.cultivoTratado}
                            condicionesAmbientales={selectedDatos.condicionesAmbientales}
                            accionesAdicionales={selectedDatos.accionesAdicionales}
                            observaciones={selectedDatos.observaciones}
                            onEdit={handleEditarManejoFertilizante}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarManejoFertilizantes;
