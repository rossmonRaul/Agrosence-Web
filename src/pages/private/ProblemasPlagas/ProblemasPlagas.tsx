import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import EditarProblemaPlagas from "../../../components/problemasPlagas/EditarProblemaPlagas.tsx";
import { CambiarEstadoRegistroSeguimientoPlagasyEnfermedades, ObtenerRegistroSeguimientoPlagasyEnfermedades } from "../../../servicios/ServicioProblemas.ts";
import CrearProblemaPlagas from "../../../components/problemasPlagas/InsertarProblemasPlagas.tsx";

function ProblemasPlagas() {

    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
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
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [datosProblemasFiltrados, setdatosProblemasFiltrados] = useState<any[]>([]);
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


    const obtenerInfo = async () => {
        try {
            const datosRiegos = await ObtenerRegistroSeguimientoPlagasyEnfermedades();
            // Convertir los datos bit en legibles
            const datosRiegosConSEstado = datosRiegos.map((dato: any) => ({
                ...dato,
                sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo',
            }));

            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosRiegosConSEstado.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });


            setdatosProblemasFiltrados(datosFiltrados);
        } catch (error) {
            console.error('Error al obtener los datos de los riegos:', error);
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

    const toggleStatus = async (riego: any) => {
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
                        idRegistroSeguimientoPlagasYEnfermedades: riego.idRegistroSeguimientoPlagasYEnfermedades
                    };
                    
                    const resultado = await CambiarEstadoRegistroSeguimientoPlagasyEnfermedades(datos);
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

    const handleEditarProblema = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarProblema = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns2 = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'plagaEnfermedad', header: 'Plaga o Enfermedad' },
        { key: 'incidencia', header: 'Incidencia' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Problemas de Plagas o Enfermedades" />
                <div className="content col-md-12">
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Problema</button>
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
                    <TableResponsive columns={columns2} data={datosProblemasFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
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
                        {/* este es el componente para crear la eficiencia del residuo*/}
                        <CrearProblemaPlagas
                            onAdd={handleAgregarProblema}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
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
                            onEdit={handleEditarProblema}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default ProblemasPlagas;
