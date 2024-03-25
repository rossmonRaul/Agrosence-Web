import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { CambiarEstadoRegistroSeguimientoUsoAgua, ObtenerUsoAgua } from "../../../servicios/ServicioUsoAgua.ts";

import InsertarUsoAgua from "../../../components/usoAgua/InsertarUsoAgua.tsx";
import ModificacionUsoAgua from "../../../components/usoAgua/EditarUsoAgua.tsx";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'

function AdministrarRegistroSeguimientoUsoAgua() {
    const [filtroActividad, setFiltroActividad] = useState('');
    const [datosFertilizantesOriginales, setDatosFertilizantesOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idRegistroSeguimientoUsoAgua: '',
        fecha: '',
        actividad: '', 
        caudal: '',
        consumoAgua: '',
        observaciones: '',
        estado:''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [datosUsoAgua, setDatosUsoAgua] = useState<any[]>([]);
    const [datosUsoAguaFiltrados, setDatosUsoAguaFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setDatosUsoAgua([])
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
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas();
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
        setFiltroActividad(e.target.value); // Convertir a minúsculas

    };

    
    //este componente refrezca la tabla al momento
    useEffect(() => {
        filtrarUsoAgua();
    }, [selectedFinca, parcelas, selectedParcela, filtroActividad]);

    //  useEffect(() => {
    //     obtenerInfo();
    // }, []);

   
    const filtrarUsoAgua = () => {
        const UsoAguaFiltrados = filtroActividad
            ? datosUsoAgua.filter((usoAgua: any) =>
            usoAgua.actividad.toLowerCase().includes(filtroActividad.toLowerCase())
            )
            : datosUsoAgua;
            setDatosUsoAguaFiltrados(UsoAguaFiltrados);

    };

    const obtenerInfo = async () => {
        try {
            const datosUsoAgua = await ObtenerUsoAgua();

            // Convertir el estado de 0 o 1 a palabras "Activo" o "Inactivo"
            const datosUsoAguaConSEstado = datosUsoAgua.map((dato: any) => ({
                ...dato,
                sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
            }));
   
            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosUsoAguaConSEstado.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });
            // Actualizar el estado con los datos filtrados
            setDatosUsoAgua(datosFiltrados);
            setDatosUsoAguaFiltrados(datosFiltrados);

        } catch (error) {
            console.error('Error al obtener los datos de registro y seguimiento del agua:', error);
        }
    };

    //esto carga la tabla al momento de hacer cambios en el filtro
    //carga los datos de la tabla al momento de cambiar los datos de selected parcela
    //cada vez que selected parcela cambie de datos este use effect obtiene datos
    useEffect(()=> {
        obtenerInfo();
    },[selectedParcela]);

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

    const toggleStatus = async (usoAgua: any) => {
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
                        idRegistroSeguimientoUsoAgua: usoAgua.idRegistroSeguimientoUsoAgua
                    };
                    const resultado = await CambiarEstadoRegistroSeguimientoUsoAgua(datos);
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

    const handleEditarUsoAgua = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarUsoAgua = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'actividad', header: 'Actividad' },
        { key: 'caudal', header: 'Caudal(L/s)' },
        { key: 'consumoAgua', header: 'Consumo de agua(m3)' },
        { key: 'observaciones', header: 'Observaciones' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Registros y seguimientos del uso del agua" />
                <div className="content" col-md-12>
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Ingresar registro de seguimiento del uso del agua</button>
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select">
                            <option value="">Seleccione la finca...</option>
                            {fincas.map(finca => (
                                <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedParcela ? selectedParcela : ''} onChange={handleParcelaChange} className="custom-select">
                            <option value="">Seleccione la parcela...</option>
                            {parcelasFiltradas.map(parcela => (
                                <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container">
                        <label htmlFor="filtroActividad">Filtrar por actividad:</label>
                        <input
                            type="text"
                            id="filtroActividad"
                            value={filtroActividad}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese la actividad"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={datosUsoAguaFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar registro de seguimiento del uso del agua"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear el manejo fertilizante */}
                        <InsertarUsoAgua
                            onAdd={handleAgregarUsoAgua}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar registro de seguimiento del uso del agua"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <ModificacionUsoAgua
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idRegistroSeguimientoUsoAgua={parseInt(selectedDatos.idRegistroSeguimientoUsoAgua)}
                            fecha={selectedDatos.fecha.toString()}
                            actividad={selectedDatos.actividad}
                            caudal={selectedDatos.caudal}
                            consumoAgua={parseInt(selectedDatos.consumoAgua)}
                            observaciones={selectedDatos.observaciones}
                            onEdit={handleEditarUsoAgua}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarRegistroSeguimientoUsoAgua;
