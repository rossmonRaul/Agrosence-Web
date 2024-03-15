import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import InsertarCalidadCultivo from "../../../components/calidadcultivo/InsertarCalidadCultivo.tsx";
import ModificarCalidadCultivo from "../../../components/calidadcultivo/ModificarCalidadCultivo.tsx";
import { CambiarEstadoCalidadCultivo, ObtenerCalidadCultivos } from "../../../servicios/ServicioCultivo.ts";

function RegistroCalidadCultivo() {
    const [filtroNombreCultivo, setFiltroNombreCultivo] = useState('');
    const [datosCalidadOriginales, setDatosCalidadOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idManejoCalidadSuelo: '',
        fecha: '',
        cultivo: '',
        hora: '',
        lote: '',
        pesoTotal: '',
        pesoPromedio: '',
        calidad: '',
        observaciones: ''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [datosCalidadFiltrados, setDatosCalidadFiltrados] = useState<any[]>([]);
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
                    const fincasResponse = await ObtenerFincas();
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));

                    setFincas(fincasUsuario);
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
                const parcelasResponse = await ObtenerParcelas();
                let parcelasFinca = parcelasResponse;
                if (selectedFinca !== null) {
                    parcelasFinca = parcelasFinca.filter((parcela: any) => parcela.idFinca === selectedFinca);
                    setParcelas(parcelasFinca);
                }

            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        obtenerParcelasDeFinca();
    }, [selectedFinca]);


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombreCultivo(e.target.value); // Convertir a minúsculas
    };

    
    //este componente refrezca la tabla al momento
    useEffect(() => {
        filtrarCalidad();
    }, [selectedFinca, parcelas, selectedParcela, setFiltroNombreCultivo]);


    const filtrarCalidad = () => {
        const datosFiltrados = filtroNombreCultivo
            ? datosCalidadOriginales.filter((datos: any) =>
                datos.cultivo.toLowerCase().includes(filtroNombreCultivo.toLowerCase())
            )
            : datosCalidadOriginales;
            setDatosCalidadFiltrados(datosFiltrados);
    };

    const obtenerInfo = async () => {
        try {
            const datosCalidad = await ObtenerCalidadCultivos();

            // Convertir el estado de 0 o 1 a palabras "Activo" o "Inactivo"
            const datosCalidadConSEstado = datosCalidad.map((dato: any) => ({
                ...dato,
                sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
            }));

            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosCalidadConSEstado.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });
            // Actualizar el estado con los datos filtrados
            setDatosCalidadOriginales(datosFiltrados);
            setDatosCalidadFiltrados(datosFiltrados);
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
                        idCalidadCultivo: datosTabla.idCalidadCultivo
                    };
                    const resultado = await CambiarEstadoCalidadCultivo(datos);
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

    const handleEditarCalidadCultivo = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };

    const handleAgregarCalidadCultivo = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const columns = [
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'fecha', header: 'Fecha' },
        { key: 'hora', header: 'Hora' },
        { key: 'lote', header: 'Lote' },
        { key: 'pesoTotal', header: 'Peso Total (kg)' },
        { key: 'pesoPromedio', header: 'Peso Promedio (g)' },
        { key: 'calidad', header: 'Calidad' },
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
                            {parcelas.map(parcela => (
                                <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container">
                        <label htmlFor="filtroNombreFertilizante">Filtrar por nombre de fertilizante:</label>
                        <input
                            type="text"
                            id="filtroNombreFertilizante"
                            value={filtroNombreCultivo}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese el nombre del fertilizante"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={datosCalidadFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
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
                        <InsertarCalidadCultivo
                            onAdd={handleAgregarCalidadCultivo}
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
                        <ModificarCalidadCultivo
                            idFinca={parseInt(selectedDatos.idFinca)}
                            idParcela={parseInt(selectedDatos.idParcela)}
                            idManejoCalidadCultivo={parseInt(selectedDatos.idManejoCalidadSuelo)}
                            fecha={selectedDatos.fecha}
                            cultivo={selectedDatos.cultivo}
                            hora={selectedDatos.hora}
                            lote={parseInt(selectedDatos.lote)}
                            pesoTotal={parseInt(selectedDatos.pesoTotal)}
                            pesoPromedio={parseInt(selectedDatos.pesoPromedio)}
                            calidad={parseInt(selectedDatos.calidad)}
                            observaciones={selectedDatos.observaciones}
                            onEdit={handleEditarCalidadCultivo}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default RegistroCalidadCultivo;
