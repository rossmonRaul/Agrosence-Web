import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import TableResponsiveDetalles from "../../../components/table/tableDetails.tsx";
import '../../../css/OrdenCompra.css'

//import { ObtenerManejoFertilizantes, CambiarEstadoManejoFertilizantes } from "../../../servicios/ServicioFertilizantes.ts";


import { CambiarEstadoCoberturaVegetal, ObtenerRegistroCoberturaVegetal } from "../../../servicios/ServicioCoberturaVegetal.ts";


//import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import InsertarCoberturaVegetal from "../../../components/CoberturaVegetal/insertarCoberturaVegetal.tsx";

/////////////////////////////////
import EditarCoberturaVegetal from "../../../components/CoberturaVegetal/EditarCoberturaVegetal.tsx";

////////////////////////////


import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerUsuariosAsignados, ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario.ts";
import DetallesCoberturaVegetal from "../../../components/CoberturaVegetal/DetallesCoberturaVegetal.tsx";
import { IoAddCircleOutline } from "react-icons/io5";



// interface Option {
//     identificacion: string;
//     idEmpresa: number;
//     nombre: string;
//     idParcela: number;
//     idFinca: number;
// }


function AdministrarCoberturaVegetal() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDetalles, setmodalDetalles] = useState(false);

    const [modalInsertar, setModalInsertar] = useState(false);
    //datos a editar
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idCoberturaVegetal: '',
        idPuntoMedicion: '',
        cultivo: '',
        alturaMaleza: 0,
        densidadMaleza: 0,
        humedadObservable: 0
    });

    const [parcelas, setParcelas] = useState<any[]>([]);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    /////////////////////////////////////////////////////
    const [contenidoCoberturaFiltrados, setcontenidoCoberturaFiltrados] = useState<any[]>([]);

    ///////////////////////////////////////////////

    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    /////////////////////////////////////
    const [CoberturaVegetal, setCoberturaVegetal] = useState<any[]>([]);
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
        obtenerRegistroCoberturaVegetal();
    }, [selectedParcela]);



    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, CoberturaVegetal, filtroNombre]);




    // Función para filtrar las parcelas
    const filtrarParcelas = () => {

        const ContenidoCoberturaFiltrado = filtroNombre




            ? CoberturaVegetal.filter((CoberturaVegetal: any) =>
                CoberturaVegetal.cultivo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                CoberturaVegetal.codigo.toLowerCase().includes(filtroNombre.toLowerCase())
            )
            : CoberturaVegetal;

        setcontenidoCoberturaFiltrados(ContenidoCoberturaFiltrado);
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


    const obtenerRegistroCoberturaVegetal = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idEmpresa) {

                const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

                const coberturaVegetalResponse = await ObtenerRegistroCoberturaVegetal();
                console.log(coberturaVegetalResponse);

                const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

                if (!usuarioActual) {
                    console.error('No se encontró el usuario actual');
                    return;
                }

                // devuelve las parcelas del usuario
                // const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

                const coberturaVegetalConEstado = coberturaVegetalResponse.map((datoCoberturaVegetal: any) => ({
                    ...datoCoberturaVegetal,
                    sEstado: datoCoberturaVegetal.estado === 1 ? 'Activo' : 'Inactivo',
                    nombrePuntoMedicion: datoCoberturaVegetal.idPuntoMedicion.nombre, // Aquí obtienes el nombre del punto de medición
                }));

                // Filtrar por finca y parcela seleccionadas:
                const coberturaVegetalFiltrados = coberturaVegetalConEstado.filter((coberturaVegetal: any) =>
                    coberturaVegetal.idFinca === selectedFinca && coberturaVegetal.idParcela === selectedParcela
                );

                setCoberturaVegetal(coberturaVegetalFiltrados);
                setcontenidoCoberturaFiltrados(coberturaVegetalFiltrados);

                console.log("contenido", contenidoCoberturaFiltrados);
            }
        } catch (error) {
            console.error('Error al obtener la cobertura:', error);
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
    const openModal = (CoberturaVegetal: any) => {
        setSelectedDatos(CoberturaVegetal);
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

    const handleAgregarCoberturaVegetal = async () => {
        await obtenerRegistroCoberturaVegetal();
        abrirCerrarModalInsertar();
    };

    const handleEditarCoberturaVegetal = async () => {
        await obtenerRegistroCoberturaVegetal();
        abrirCerrarModalEditar();
    };


    // Cambiar estado de la parcela
    const toggleStatus = async (CoberturaVegetal: any) => {
        Swal.fire({
            title: "Eliminar Cobertura Vegetal",
            text: "¿Estás seguro de que deseas eliminar la cobertura de: " + CoberturaVegetal.cultivo + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdCoberturaVegetal: CoberturaVegetal.idCoberturaVegetal,
                    };

                    const resultado = await CambiarEstadoCoberturaVegetal(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro eliminado! ',
                            text: 'Eliminación exitosa.',
                        });
                        await obtenerRegistroCoberturaVegetal();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar el registro.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al eliminar la cobertura Vegetal", "", "error");
                }
            }
        });
    };



    const columns2 = [
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'nombreAlturaMaleza', header: 'Altura Maleza' },
        { key: 'nombreDensidadMaleza', header: 'Densidad Maleza' },
        { key: 'nombreHumedadObservable', header: 'Humedad Observable' },
        { key: 'codigo', header: 'Punto de Medición' }, // Cambio aquí para mostrar el nombre
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
                <BordeSuperior text="Cobertura Vegetal" />
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
                            <span style={{ marginLeft: '5px' }}>Ingresar Cobertura Vegetal</span>
                            </button>
                    </div>
                    {/* openModalDetalles */}

                    <TableResponsiveDetalles
                        //mapeo de las columnas para poder mostar texto con formato html de ser necesario
                        columns={columns2.map(col => ({ ...col, header: renderHeader(col.header) }))}
                        data={contenidoCoberturaFiltrados}
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
                title="Insertar Cobertura Vegetal"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <InsertarCoberturaVegetal
                            onAdd={handleAgregarCoberturaVegetal}
                        />
                    </div>
                </div>
            </Modal>

            {<Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Cobertura Vegetal"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarCoberturaVegetal
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idCoberturaVegetal={selectedDatos.idCoberturaVegetal}
                            idPuntoMedicion={selectedDatos.idPuntoMedicion}
                            cultivo={selectedDatos.cultivo}
                            alturaMaleza={selectedDatos.alturaMaleza}
                            densidadMaleza={selectedDatos.densidadMaleza}
                            humedadObservable={selectedDatos.humedadObservable}
                            onEdit={handleEditarCoberturaVegetal}
                        />
                    </div>
                </div>
            </Modal>}
            {<Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles Cobertura Vegetal"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <DetallesCoberturaVegetal
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idCoberturaVegetal={selectedDatos.idCoberturaVegetal}
                            cultivo={selectedDatos.cultivo}
                            alturaMaleza={selectedDatos.alturaMaleza}
                            idPuntoMedicion={selectedDatos.idPuntoMedicion}
                            densidadMaleza={selectedDatos.densidadMaleza}
                            humedadObservable={selectedDatos.humedadObservable}
                        />
                    </div>
                </div>
            </Modal>}
        </Sidebar>
    );
}

export default AdministrarCoberturaVegetal;