import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
//import { ObtenerManejoFertilizantes, CambiarEstadoManejoFertilizantes } from "../../../servicios/ServicioFertilizantes.ts";
import { ObtenerRegistroPuntoMedicion , CambiarEstadoRegistroPuntoMedicion  } from "../../../servicios/ServicioPuntoMedicion.ts";
//import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import InsertarPuntoMedicion from "../../../components/puntoMedicion/InsertarPuntoMedicion.tsx";
import ModificacionPuntoMedicion from "../../../components/puntoMedicion/EditarPuntoMedicion.tsx";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";


interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}
function AdministrarPuntoMedicion() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [datosPreparacionTerrenoOriginales, setDatosPreparacionTerrenoOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idPuntoMedicion : '',
        codigo: '',
        altitud : '',
        latitud : '',
        longitud: '',
        nombreParcela:''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [puntoMedicionFiltradas, setPuntoMedicionFiltradas] = useState<any[]>([]);
    const [datosPreparacionTerreno, setDatosPreparacionTerreno] = useState<any[]>([]);
    const [datosPreparacionTerrenoFiltrados, setdatosPreparacionTerrenoFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);
    const [puntoMedicion, setPuntoMedicion] = useState<any[]>([]);
    const userState = useSelector((store: AppStore) => store.user);
    const idEmpresa = localStorage.getItem('empresaUsuario');

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
    };

    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
                if (idEmpresaUsuario) {
                    const fincasResponse = await ObtenerFincas(); // Suponiendo que ObtenerFincas devuelve las fincas de una empresa específica
                    const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));
                    setFincas(fincasFiltradas);
                }
            } catch (error) {
                console.error('Error al obtener las fincas:', error);
            }
        };
        obtenerFincas();
    }, []);

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFiltroNombre(value);
    };


    // Obtener parcelas cuando cambie la finca seleccionada
    useEffect(() => {
        obtenerRegistroPuntoMedicion();
    },[selectedFinca] );

      // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
      useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, puntoMedicion, filtroNombre]);
     // Función para filtrar las parcelas
    const filtrarParcelas = () => {
        let parcelasFiltradasPorFinca = selectedFinca
            ? puntoMedicion.filter(parcela => parcela.idFinca === parseInt(selectedFinca))
            : puntoMedicion

        // Filtrar por nombre si hay un filtro aplicado
        if (filtroNombre.trim() !== '') {
            parcelasFiltradasPorFinca = parcelasFiltradasPorFinca.filter(parcela =>
                parcela.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
            );
        }
        setPuntoMedicionFiltradas(parcelasFiltradasPorFinca);
    };


    // Obtener las parcelas
    const obtenerRegistroPuntoMedicion = async () => {
        try {
            const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
            if (idEmpresaUsuario) {

                const fincas = await ObtenerFincas();
                const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

                const parcelasResponse = await ObtenerRegistroPuntoMedicion({IdEmpresa:idEmpresa});

                /*const parcelasFincasEmpresaUsuario: any[] = [];

                fincasEmpresaUsuario.forEach((finca: any) => {
                    const parcelasFinca = parcelasResponse.filter((parcela: any) => parcela.idFinca === finca.idFinca);
                    parcelasFincasEmpresaUsuario.push(...parcelasFinca);
                });*/

                //ajustar para fertilizantes
                const parcelasConEstado = parcelasResponse.map((parcela: any) => ({
                    ...parcela,
                    sEstado: parcela.estado === 1 ? 'Activo' : 'Inactivo'
                }));
                setPuntoMedicion(parcelasConEstado);
                setPuntoMedicionFiltradas(parcelasConEstado);
            }
        } catch (error) {
            console.error('Error al obtener las parcelas:', error);
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
    const openModal = (parcela: any) => {
        //setSelectedParcela(parcela);
        abrirCerrarModalEditar();
    };
    
    const handleAgregarPuntoMedicion = async () => {
        await obtenerRegistroPuntoMedicion();
        abrirCerrarModalInsertar();
    };
    // Cambiar estado de la parcela
    const toggleStatus = async (puntomedicion: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado del punto de medicion: " + puntomedicion.codigo + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdPuntoMedicion: puntomedicion.idPuntoMedicion,
                    };
                    const resultado = await CambiarEstadoRegistroPuntoMedicion(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerRegistroPuntoMedicion();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado de la parcela", "", "error");
                }
            }
        });
    };


    const columns2 = [
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'codigo', header: 'Sensor' },
        { key: 'altitud', header: 'Altitud' },
        { key: 'latitud', header: 'Latitud' },
        { key: 'longitud', header: 'Longitud' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Punto Medición" />
                <div className="content" col-md-12>
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Ingresar punto de medición</button>
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select">
                            <option value={''}>Todas las fincas</option>
                            {fincas.map(finca => (
                                <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container">
                        <label htmlFor="filtroNombreActividad">Filtrar por nombre de actividad:</label>
                        <input
                            type="text"
                            id="filtroNombreActividad"
                            value={filtroNombre}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese el nombre del Actividad"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns2} data={puntoMedicion} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Preparacion Terreno"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear el manejo fertilizante */}
                         <InsertarPuntoMedicion
                            onAdd={handleAgregarPuntoMedicion}
                        /> 
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Preparacion de Terreno"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* <ModificacionPuntoMedicion
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idPuntoMedicion={parseInt(selectedDatos.idPuntoMedicion)}
                            codigo={selectedDatos.codigo}
                            altitud={selectedDatos.altitud}
                            latitud ={selectedDatos.latitud }
                            longitud={selectedDatos.longitud}
                            onEdit={handleEditarPreparacionTerreno}
                        />  */}
                    </div>
                </div>
            </Modal> 
            
        </Sidebar>
    );
}

export default AdministrarPuntoMedicion;
