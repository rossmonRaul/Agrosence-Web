/**Pantall para insertar, modificar y cambiar estado de las condiciones meteorológicas y climáticas
 */
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar.tsx";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import '../../../css/FormSeleccionEmpresa.css'
import InsertarRegistroSensores from "../../../components/registroSensores/InsertarSensores.tsx";
import ModificarSensores from "../../../components/registroSensores/ModificarSensores.tsx";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import { ObtenerSensores, CambiarEstadoSensor, ObtenerMedicionesAutorizadasSensor } from "../../../servicios/ServicioSensor.ts";
import { IoAddCircleOutline } from "react-icons/io5";
interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

function RegistroSensores() {
    const [filtroSensor, setFiltroSensor] = useState('');
    const [datosProduccionOriginales, setDatosProduccionOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idSensor: '',
        idFinca: '',
        idParcela: '',
        identificacionUsuario: '',
        identificadorSensor: '',
        nombre: '',
        modelo: '',
        idEstado: '',
        idPuntoMedicion: '',
        idMediciones: [],
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [datosProduccionFiltrados, setDatosProduccionFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);
    const userState = useSelector((store: AppStore) => store.user);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    //Eventos que se activan al percibir cambios en la finca y parcela seleccionadas
    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setSelectedFinca(value);
        setSelectedParcela(null);
    };


    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(parseInt(value));
    };

    useEffect(() => {
        if (!selectedFinca || !selectedParcela) {
            setDatosProduccionFiltrados([]);
        }
    }, [selectedFinca, selectedParcela]);

    // Obtener las fincas al cargar la página
    //Se obtienen las fincas y parcelas del usuario al cargar el componente
    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const fincasResponse = await ObtenerFincas();
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);

                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
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
        setFiltroSensor(e.target.value); // Convertir a minúsculas
    };


    //Se activa al recibir un cambio en el campo del filtro por nombre o modelo
    useEffect(() => {
        const datosFiltrados = datosProduccionOriginales.filter((datos: any) => {
            return datos.nombre.toLowerCase().includes(filtroSensor.toLowerCase()) ||
                datos.modelo.toLowerCase().includes(filtroSensor.toLowerCase())
        });
        setDatosProduccionFiltrados(datosFiltrados);
    }, [filtroSensor, datosProduccionOriginales]); // Agregar filtroSensor y datosProduccionOriginales aquí


    // obtiene la informacion filtrada sobre los sensores relacionada con la del usuario que esta logeado
    const obtenerInfo = async () => {
        try {
            const datosProduccion = await ObtenerSensores();
            const datosSensoresAutorizados = await ObtenerMedicionesAutorizadasSensor();
            // Convertir el estado de 0 o 1 a palabras "Activo" o "Inactivo"
            const datosProduccionConSEstado = datosProduccion.map((dato: any) => ({
                ...dato,
                sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
            }));

            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosProduccionConSEstado.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });
            const datosConAutorizacion = datosFiltrados.map((dato: any) => {
                const sensoresAutorizados = datosSensoresAutorizados.filter((sensor: any) => sensor.idSensor === dato.idSensor);
                const medicionesAutorizadas = sensoresAutorizados.map((sensor: any) => sensor.medicionAutorizadaSensor).join(', ');
                const idMediciones = sensoresAutorizados.map((sensor: any) => [sensor.idMedicionAutorizadaSensor, sensor.idMedicion]); // Nuevo array de IdMedicion
                return {
                    ...dato,
                    medicionesAutorizadaSensor: medicionesAutorizadas,
                    idMediciones: idMediciones // Nueva propiedad con array de IdMedicion
                };
            });
            // Actualizar el estado con los datos filtrados
            setDatosProduccionOriginales(datosConAutorizacion);
            setDatosProduccionFiltrados(datosConAutorizacion);
        } catch (error) {
            console.error('Error al obtener los datos de los sensores:', error);
        }
    };

    //esto carga la tabla al momento de hacer cambios en el filtro
    //carga los datos de la tabla al momento de cambiar los datos de selected parcela
    //cada vez que selected parcela cambie de datos este use effect obtiene datos
    useEffect(() => {
        obtenerInfo();
    }, [selectedParcela, filtroSensor]);

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

    // metodo para cambiar el estado del registro seleccionado
    const toggleStatus = async (datosTabla: any) => {
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
                        idSensor: datosTabla.idSensor
                    };
                    const resultado = await CambiarEstadoSensor(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerInfo();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado", "", "error");
                }
            }
        });
    };

    const handleEditarCondicionesMetereologicas = async (option?: number) => {
        await obtenerInfo();
        if (option === 0) {
            setSelectedFinca(null);
            setSelectedParcela(null);
            abrirCerrarModalEditar();

        } if (option === 1) {

            setSelectedFinca(null);
            setSelectedParcela(null);
            return
        }
    };

    const handleAgregarCondicionesMetereologicas = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns = [
        { key: 'identificadorSensor', header: 'Identificador (EUI)' },
        { key: 'nombre', header: 'Nombre' },
        { key: 'modelo', header: 'Modelo' },
        { key: 'estadoSensor', header: 'Estado sensor' },
        { key: 'codigoPuntoMedicion', header: 'Punto medición' },
        { key: 'medicionesAutorizadaSensor', header: 'Mediciones' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Registro sensores" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>

                            <label >Finca:</label>
                            <select
                                value={selectedFinca || ''}
                                onChange={handleFincaChange}
                                className="custom-select"
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            >
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
                                className="custom-select"
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            >
                                <option value="">Seleccione la parcela...</option>
                                {parcelasFiltradas.map(parcela => (
                                    <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                                ))}
                            </select>

                        </div>
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>

                            <label htmlFor="filtroNombreSensor" >Nombre o modelo:</label>
                            <input

                                type="text"
                                id="filtroNombreSensor"
                                value={filtroSensor}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese el nombre o modelo"
                                className="form-control"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Ingresar registro sensores</span>
                        </button>
                    </div>
                    <TableResponsive columns={columns} data={datosProduccionFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />

                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar registro sensores"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear los sensores*/}
                        <InsertarRegistroSensores
                            onAdd={handleAgregarCondicionesMetereologicas}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar registro sensores"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>

                        <ModificarSensores
                            idSensor={parseInt(selectedDatos.idSensor)}
                            identificadorSensor={selectedDatos.identificadorSensor}
                            nombre={selectedDatos.nombre}
                            modelo={selectedDatos.modelo}
                            idEstado={parseInt(selectedDatos.idEstado)}
                            idPuntoMedicion={parseFloat(selectedDatos.idPuntoMedicion)}
                            idMediciones={selectedDatos.idMediciones}
                            onEdit={() => handleEditarCondicionesMetereologicas()}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default RegistroSensores;
