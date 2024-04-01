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
import CrearEficienciaRiegos from "../../../components/eficienciaRiego/InsertarEficienciaRiego.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import ModificacionEficienciaRiego from "../../../components/eficienciaRiego/EditarEficienciaRiego.tsx";
import { CambiarEstadoEficienciaRiego, ObtenerEficienciaRiego } from "../../../servicios/ServicioRiego.ts";

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
        estadoAspersores: false,
        estadoCanalesRiego: false,
        nivelFreatico: '',
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
            const datosRiegos = await ObtenerEficienciaRiego();
            // Convertir los datos bit en legibles
            const datosRiegosConSEstado = datosRiegos.map((dato: any) => ({
                ...dato,
                sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo',
                sFugas: dato.estadoTuberiasYAccesorios === true ? 'Tiene Fugas' : 'No Tiene Fugas',
                sUniformidadRiego: dato.uniformidadRiego === true ? 'Tiene Uniformidad' : 'No Tiene Uniformidad',
                sEstadoAspersores: dato.estadoAspersores === true ? 'Tiene Obstrucciones' : 'No Tiene Obstrucciones',
                sEstadoCanalesRiego: dato.estadoCanalesRiego === true ? 'Tiene Obstrucciones' : 'No Tiene Obstrucciones'
            }));
            
            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosRiegosConSEstado.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });
           

            setdatosRiegosFiltrados(datosFiltrados);
        } catch (error) {
            console.error('Error al obtener los datos de los riegos:', error);
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
                        idMonitoreoEficienciaRiego: riego.idMonitoreoEficienciaRiego
                    };
                    console.log(datos)
                    const resultado = await CambiarEstadoEficienciaRiego(datos);
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
        { key: 'sEstadoAspersores', header: 'Obstrucciones en Aspersores' },
        { key: 'sEstadoCanalesRiego', header: 'Obstrucciones en Canales' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Eficiencia de Riego" />
                <div className="content col-md-12">
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Riego</button>
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
                    <TableResponsive columns={columns2} data={datosRiegosFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Eficiencia del Riego"
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
                            estadoAspersores={selectedDatos.estadoAspersores}
                            estadoCanalesRiego={selectedDatos.estadoCanalesRiego}
                            nivelFreatico={selectedDatos.nivelFreatico}
                            onEdit={handleEditarRiego}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarEficienciaRiegos;
