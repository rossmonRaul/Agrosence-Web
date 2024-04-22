import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoParcelas, ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import EditarParcela from "../../../components/parcela/EditarParcela.tsx";
import CrearParcela from "../../../components/parcela/CrearParcela.tsx";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerManejoFertilizantes, CambiarEstadoManejoFertilizantes } from "../../../servicios/ServicioFertilizantes.ts";
import InsertarManejoFertilizante from "../../../components/manejoFertilizante/InsertarManejoFertilizante.tsx";
import ModificacionManejoFertilizante from "../../../components/manejoFertilizante/EditarManejoFertilizante.tsx";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'

function AdministrarManejoFertilizantes() {
    const [filtroNombreFertilizante, setFiltroNombreFertilizante] = useState('');
    const [datosFertilizantesOriginales, setDatosFertilizantesOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idManejoFertilizantes: '',
        fecha: '',
        fertilizante: '',
        aplicacion: '',
        dosis: '',
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

                const fincas = await ObtenerFincas();

                const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

                const parcelasResponse = await ObtenerParcelas();

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
        { key: 'dosis', header: 'Dosis' },
        { key: 'cultivoTratado', header: 'Cultivo Tratado' },
        { key: 'condicionesAmbientales', header: 'Condiciones Ambientales' },
        { key: 'accionesAdicionales', header: 'Acciones Adicionales' },
        { key: 'observaciones', header: 'Observaciones' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Manejo de Fertilizantes" />
                <div className="content" col-md-12>
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Ingresar registro de fertilizante</button>
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
                        <label htmlFor="filtroNombreFertilizante">Filtrar por nombre de fertilizante:</label>
                        <input
                            type="text"
                            id="filtroNombreFertilizante"
                            value={filtroNombreFertilizante}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese el nombre del fertilizante"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns2} data={datosFertilizantesFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
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
