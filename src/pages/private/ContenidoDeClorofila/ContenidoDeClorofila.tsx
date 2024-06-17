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


import { ObtenerRegistroContenidoDeClorofila, CambiarEstadoRegistroContenidoDeClorofila } from "../../../servicios/ServicioContenidoDeClorofila.ts";


//import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import InsertarContenidoDeClorofila from "../../../components/contenidoDeClorofila/insertarContenidoDeClorofila.tsx";

/////////////////////////////////
import EditarContenidoDeClorofila from "../../../components/contenidoDeClorofila/EditarContenidoDeClorofila.tsx";

////////////////////////////


import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerUsuariosAsignados, ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario.ts";



// interface Option {
//     identificacion: string;
//     idEmpresa: number;
//     nombre: string;
//     idParcela: number;
//     idFinca: number;
// }


function AdministrarPuntoMedicion() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    //datos a editar
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idContenidoDeClorofila: '',
        cultivo: '',
        fecha: '',
        valorDeClorofila: '',
        idPuntoMedicion: '',
        temperatura: '',
        humedad: '',
        observaciones: ''
    });

    const [parcelas, setParcelas] = useState<any[]>([]);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    /////////////////////////////////////////////////////
    const [contenidoDeClorofilaFiltrados, setContenidoDeClorofilaFiltrados] = useState<any[]>([]);

    ///////////////////////////////////////////////

    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);

    /////////////////////////////////////
    const [contenidoDeClorofila, setContenidoDeClorofila] = useState<any[]>([]);
    ////////////////////////////////////////////


    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
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

                    console.log('parcelasUsuario')
                    console.log(parcelasUsuario)
                    console.log('parcelasUsuario')
                    
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

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFiltroNombre(value);
    };


    // Obtener parcelas cuando cambie la finca seleccionada
    useEffect(() => {
        obtenerRegistroContenidoDeClorofila();
    }, [selectedFinca]);

    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, contenidoDeClorofila, filtroNombre]);

    // Función para filtrar las parcelas
    const filtrarParcelas = () => {
        let contenidoDeClorofilaFiltradosPorFinca = selectedFinca
            ? contenidoDeClorofila.filter(contenidoDeClorofila => contenidoDeClorofila.idFinca === parseInt(selectedFinca))
            : contenidoDeClorofila

        // Filtrar por nombre si hay un filtro aplicado
        if (filtroNombre.trim() !== '') {
            contenidoDeClorofilaFiltradosPorFinca = contenidoDeClorofilaFiltradosPorFinca.filter(contenidoDeClorofila =>
                contenidoDeClorofila.cultivo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                contenidoDeClorofila.codigo.toLowerCase().includes(filtroNombre.toLowerCase())
            );
        }
        setContenidoDeClorofilaFiltrados(contenidoDeClorofilaFiltradosPorFinca);
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


    const obtenerRegistroContenidoDeClorofila = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {

                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

                const contenidoDeClorofilaResponse = await ObtenerRegistroContenidoDeClorofila();

                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                // devuelve las parcelas del usuario
                // const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

                // Filtrar las manejo de riesgo de  de las parcelas del usuario actual
                console.log('contenidoDeClorofilaResponse, antes del filtro')
                console.log(contenidoDeClorofilaResponse)
                console.log('contenidoDeClorofilaResponse')

                const contenidoDeClorofilaConEstado = contenidoDeClorofilaResponse.map((datoContenidoDeClorofila: any) => ({
                    ...datoContenidoDeClorofila,
                    sEstado: datoContenidoDeClorofila.estado === 1 ? 'Activo' : 'Inactivo'
                }));

                const contenidoDeClorofilaFiltrados = contenidoDeClorofilaConEstado.filter((contenidoDeClorofila: any) => {

                    console.log('contenidoDeClorofila despues del filtro')
                    console.log(contenidoDeClorofila)
                    console.log('contenidoDeClorofila')

                    return contenidoDeClorofila.idFinca === selectedFinca && contenidoDeClorofila.idParcela === selectedParcela;

                });

                // setContenidoDeClorofila(contenidoDeClorofilaFiltradas);
                setContenidoDeClorofilaFiltrados(contenidoDeClorofilaFiltrados);
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
    const openModal = (puntomedicion: any) => {
        setSelectedDatos(puntomedicion);
        abrirCerrarModalEditar();
    };

    const handleAgregarContenidoDeClorofila = async () => {
        await obtenerRegistroContenidoDeClorofila();
        abrirCerrarModalInsertar();
    };

    const handleEditarContenidoDeClorofila = async () => {
        await obtenerRegistroContenidoDeClorofila();
        abrirCerrarModalEditar();
    };


    // Cambiar estado de la parcela
    const toggleStatus = async (contenidoDeClorofila: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado del contenido de clorofila: " + contenidoDeClorofila.cultivo + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdContenidoDeClorofila: contenidoDeClorofila.idContenidoDeClorofila,
                    };
                    console.log('datos')
                    console.log(datos)
                    console.log('datos')
                    const resultado = await CambiarEstadoRegistroContenidoDeClorofila(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerRegistroContenidoDeClorofila();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado del contenido de clorofila", "", "error");
                }
            }
        });
    };


    const columns2 = [
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'fecha', header: 'Fecha' },
        { key: 'valorDeClorofila', header: 'Valor de Clorofila' },
        { key: 'codigo', header: 'Punto de medición' },
        { key: 'temperatura', header: 'Temperatura' },
        { key: 'humedad', header: 'Humedad' },
        { key: 'observaciones', header: 'Observaciones' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Contenido de Clorofila" />
                <div className="content" col-md-12>
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Ingresar contenido de clorofila</button>
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select">
                            <option value={0}>Seleccione una finca</option>
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
                        <label htmlFor="filtroNombre">Filtrar:</label>
                        <input
                            type="text"
                            id="filtroNombre"
                            value={filtroNombre}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese un cultivo o punto de medición"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns2} data={contenidoDeClorofilaFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar contenido de clorofila"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <InsertarContenidoDeClorofila
                            onAdd={handleAgregarContenidoDeClorofila}
                        />
                    </div>
                </div>
            </Modal>

            {<Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Contenido de Clorofila"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='    -group'>
                        <EditarContenidoDeClorofila
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idContenidoDeClorofila={selectedDatos.idContenidoDeClorofila}
                            cultivo={selectedDatos.cultivo}
                            fecha={selectedDatos.fecha}
                            valorDeClorofila={selectedDatos.valorDeClorofila}
                            idPuntoMedicion={selectedDatos.idPuntoMedicion}
                            observaciones={selectedDatos.observaciones}
                            onEdit={handleEditarContenidoDeClorofila}
                        />
                    </div>
                </div>
            </Modal>}
        </Sidebar>
    );
}

export default AdministrarPuntoMedicion;
