/**Pantall para insertar, modificar y cambiar estado de la produccion de los 
 * cultivos
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
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import InsertarProductividadCultivo from "../../../components/productividadcultivo/InsertarProductividadCultivo.tsx";
import ModificarProductividadCultivo from "../../../components/productividadcultivo/ModificarProductividadCultivo.tsx";
import { CambiarEstadoProductividadCultivo, ObtenerProductividadCultivos } from "../../../servicios/ServicioCultivo.ts";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

function RegistroProductividadCultivo() {
    const [filtroNombreCultivo, setFiltroNombreCultivo] = useState('');
    const [datosProduccionOriginales, setDatosProduccionOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idManejoProductividadCultivo: '',
        cultivo: '',
        temporada: '',
        area: '',
        produccion: '',
        productividad: ''
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
                    const identificacion = identificacionString;
                    
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);
                    
                    const fincasResponse = await ObtenerFincas();
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)
                    
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
            try{
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
        setFiltroNombreCultivo(e.target.value); // Convertir a minúsculas
    };


    //Se activa al recibir un cambio en el campo del filtro por nombre de cultivo
    useEffect(() => {
        const datosFiltrados = datosProduccionOriginales.filter((datos: any) => {
            return datos.cultivo.toLowerCase().includes(filtroNombreCultivo.toLowerCase());
        });
        setDatosProduccionFiltrados(datosFiltrados);
    }, [filtroNombreCultivo, datosProduccionOriginales]); // Agregar filtroNombreCultivo y datosProduccionOriginales aquí


    // obtiene la informacion filtrada sobre la produccion de cultivos relacionada con la del usuario que esta logeado
    const obtenerInfo = async () => {
        try {
            const datosProduccion = await ObtenerProductividadCultivos();

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
            // Actualizar el estado con los datos filtrados
            setDatosProduccionOriginales(datosFiltrados);
            setDatosProduccionFiltrados(datosFiltrados);
        } catch (error) {
            console.error('Error al obtener los datos de la produccion de cultivos:', error);
        }
    };

    //esto carga la tabla al momento de hacer cambios en el filtro
    //carga los datos de la tabla al momento de cambiar los datos de selected parcela
    //cada vez que selected parcela cambie de datos este use effect obtiene datos
    useEffect(() => {
        obtenerInfo();
    }, [selectedParcela, filtroNombreCultivo]);

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
                        idManejoProductividadCultivo: datosTabla.idManejoProductividadCultivo
                    };
                    const resultado = await CambiarEstadoProductividadCultivo(datos);
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

    const handleEditarProduccionCultivo = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarProduccionCultivo = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns = [
        { key: 'nombreUsuario', header: 'Usuario' },
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'finca', header: 'Finca' },
        { key: 'parcela', header: 'Parcela' },
        { key: 'temporada', header: 'Temporada' },
        { key: 'area', header: 'Área (ha)' },
        { key: 'produccion', header: 'Producción (ton)' },
        { key: 'productividad', header: 'Productividad' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Producción de Cultivos" />
                <div className="content" col-md-12>
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Ingresar Producción de Cultivo</button>
                    <div className="filtro-container" style={{ width: '265px' }}>
                        <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select">
                            <option value="">Seleccione la finca...</option>
                            {filteredFincas.map(finca => (
                                <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container" style={{ width: '265px' }}>
                        <select value={selectedParcela ? selectedParcela : ''} onChange={handleParcelaChange} className="custom-select">
                            <option value="">Seleccione la parcela...</option>
                            {parcelasFiltradas.map(parcela => (
                                <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container">
                        <label htmlFor="filtroNombreCultivo">Filtrar por nombre de cultivo:</label>
                        <input
                            type="text"
                            id="filtroNombreCultivo"
                            value={filtroNombreCultivo}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese el nombre del Cultivo"
                            className="form-control"
                        />
                    </div>
                   
                        <TableResponsive columns={columns} data={datosProduccionFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                  
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Productividad"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear la produccion de cultivo*/}
                        <InsertarProductividadCultivo
                            onAdd={handleAgregarProduccionCultivo}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Productividad"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <ModificarProductividadCultivo
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idManejoProductividadCultivo={parseInt(selectedDatos.idManejoProductividadCultivo)}
                            cultivo={selectedDatos.cultivo}
                            temporada={selectedDatos.temporada}
                            area={parseFloat(selectedDatos.area)}
                            produccion={parseFloat(selectedDatos.produccion)}
                            productividad={parseFloat(selectedDatos.productividad)}
                            onEdit={handleEditarProduccionCultivo}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default RegistroProductividadCultivo;
