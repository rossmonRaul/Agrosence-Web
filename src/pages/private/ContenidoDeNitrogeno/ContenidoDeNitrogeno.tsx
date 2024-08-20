import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import '../../../css/OrdenCompra.css'
import { ObtenerRegistroContenidoDeNitrogeno, CambiarEstadoRegistroContenidoDeNitrogeno } from "../../../servicios/ServicioContenidoDeNitrogeno.ts";
import InsertarContenidoDeNitrogeno from "../../../components/contenidoDeNitrogeno/insertartContenidoDeNitrogeno.tsx";
import EditarContenidoDeNitrogeno from "../../../components/contenidoDeNitrogeno/EditarContenidoDeNitrogeno.tsx";
import DetallesContenidoDeNitrogeno from "../../../components/contenidoDeNitrogeno/detallesContenidoDeNitrogeno.tsx";

import '../../../css/FormSeleccionEmpresa.css';
import { ObtenerUsuariosAsignados, ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario.ts";
import { IoAddCircleOutline } from "react-icons/io5";

function AdministrarContenidoDeNitrogeno() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idContenidoDeNitrogeno: '',
        codigoPuntoMedicion: '',
        fechaMuestreo: '',
        contenidoNitrogenoSuelo: '',
        contenidoNitrogenoPlanta: '',
        metodoAnalisis: '',
        humedadObservable: '',
        condicionSuelo: '',
        observaciones: ''
    });

    const [parcelas, setParcelas] = useState<any[]>([]);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [contenidoDeNitrogenoFiltrados, setContenidoDeNitrogenoFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);
    const [contenidoDeNitrogeno, setContenidoDeNitrogeno] = useState<any[]>([]);

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
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);

                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);
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

    useEffect(() => {
        obtenerRegistroContenidoDeNitrogeno();
    }, [selectedParcela]);

    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, contenidoDeNitrogeno, filtroNombre]);

    const filtrarParcelas = () => {
        const ContenidoNitrogenoFiltrado = filtroNombre
            ? contenidoDeNitrogeno.filter((contenidoDeNitrogeno: any) =>
                contenidoDeNitrogeno.codigoPuntoMedicion.toLowerCase().includes(filtroNombre.toLowerCase())
            )
            : contenidoDeNitrogeno;

        setContenidoDeNitrogenoFiltrados(ContenidoNitrogenoFiltrado);
    };

    useEffect(() => {
        const obtenerParcelasDeFinca = async () => {
            try {
                const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === selectedFinca);
                setParcelasFiltradas(parcelasFinca);
            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        obtenerParcelasDeFinca();
    }, [selectedFinca]);

    const obtenerRegistroContenidoDeNitrogeno = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {
                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });
                const contenidoDeNitrogenoResponse = await ObtenerRegistroContenidoDeNitrogeno();
                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                const contenidoDeNitrogenoConEstado = contenidoDeNitrogenoResponse
                    .filter((datoContenidoDeNitrogeno: any) => datoContenidoDeNitrogeno.estado === 1) // Filtrar registros con estado igual a 1
                    .map((datoContenidoDeNitrogeno: any) => ({
                        ...datoContenidoDeNitrogeno,
                        sEstado: datoContenidoDeNitrogeno.estado === 1 ? 'Activo' : 'Inactivo'
                    }));

                const contenidoDeNitrogenoFiltrados = contenidoDeNitrogenoConEstado.filter((contenidoDeNitrogeno: any) => {
                    return contenidoDeNitrogeno.idFinca === selectedFinca && contenidoDeNitrogeno.idParcela === selectedParcela;
                });

                contenidoDeNitrogenoFiltrados.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                setContenidoDeNitrogeno(contenidoDeNitrogenoFiltrados);
                setContenidoDeNitrogenoFiltrados(contenidoDeNitrogenoFiltrados);
            }
        } catch (error) {
            console.error('Error al obtener los contenidos de nitrógeno:', error);
        }
    };

    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    const abrirCerrarModalDetalles = () => {
        setModalDetalles(!modalDetalles);
    };

    const openModal = (contenidoDeNitrogeno: any) => {
        setSelectedDatos(contenidoDeNitrogeno);
        abrirCerrarModalEditar();
    };

    const openDetallesModal = (contenidoDeNitrogeno: any) => {
        setSelectedDatos(contenidoDeNitrogeno);
        abrirCerrarModalDetalles();
    };

    const handleAgregarContenidoDeNitrogeno = async () => {
        await obtenerRegistroContenidoDeNitrogeno();
        abrirCerrarModalInsertar();
    };

    const handleEditarContenidoDeNitrogeno = async () => {
        await obtenerRegistroContenidoDeNitrogeno();
        abrirCerrarModalEditar();
    };

    const toggleStatus = async (contenidoDeNitrogeno: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado del contenido de nitrógeno?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdContenidoDeNitrogeno: contenidoDeNitrogeno.idContenidoDeNitrogeno,
                    };

                    const resultado = await CambiarEstadoRegistroContenidoDeNitrogeno(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado!',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerRegistroContenidoDeNitrogeno();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado del contenido de nitrógeno", "", "error");
                }
            }
        });
    };

    const columns2 = [
        { key: 'codigoPuntoMedicion', header: 'Código Punto de Medición' },
        { key: 'fecha', header: 'Fecha de Muestreo' },
        { key: 'contenidoNitrogenoSuelo', header: 'Contenido de Nitrógeno en Suelo (%)' },
        { key: 'contenidoNitrogenoPlanta', header: 'Contenido de Nitrógeno en Planta (%)' },
        { key: 'metodoAnalisis', header: 'Método de Análisis' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Contenido de Nitrógeno" />
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
                            <label htmlFor="filtroNombre">Código de punto de medición:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                value={filtroNombre}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese un código de punto de medición"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '300px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Ingresar contenido de nitrógeno</span>
                            </button>
                    </div>
                    <TableResponsive columns={columns2} data={contenidoDeNitrogenoFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} openDetallesModal={openDetallesModal} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar contenido de nitrógeno"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <InsertarContenidoDeNitrogeno
                            onAdd={handleAgregarContenidoDeNitrogeno}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Contenido de Nitrógeno"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarContenidoDeNitrogeno
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idContenidoDeNitrogeno={selectedDatos.idContenidoDeNitrogeno}
                            idPuntoMedicion={selectedDatos.codigoPuntoMedicion}
                            fechaMuestreo={selectedDatos.fechaMuestreo}
                            contenidoNitrogenoSuelo={selectedDatos.contenidoNitrogenoSuelo}
                            contenidoNitrogenoPlanta={selectedDatos.contenidoNitrogenoPlanta}
                            metodoAnalisis={selectedDatos.metodoAnalisis}
                            humedadObservable={selectedDatos.humedadObservable}
                            condicionSuelo={selectedDatos.condicionSuelo}
                            observaciones={selectedDatos.observaciones}
                            onEdit={handleEditarContenidoDeNitrogeno}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles del Contenido de Nitrógeno"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <DetallesContenidoDeNitrogeno
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idContenidoDeNitrogeno={selectedDatos.idContenidoDeNitrogeno}
                            idPuntoMedicion={selectedDatos.codigoPuntoMedicion}
                            fechaMuestreo={selectedDatos.fechaMuestreo}
                            contenidoNitrogenoSuelo={selectedDatos.contenidoNitrogenoSuelo}
                            contenidoNitrogenoPlanta={selectedDatos.contenidoNitrogenoPlanta}
                            metodoAnalisis={selectedDatos.metodoAnalisis}
                            humedadObservable={selectedDatos.humedadObservable}
                            condicionSuelo={selectedDatos.condicionSuelo}
                            observaciones={selectedDatos.observaciones}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarContenidoDeNitrogeno;
