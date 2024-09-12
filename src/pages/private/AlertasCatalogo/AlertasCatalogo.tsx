import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Modal from "../../../components/modal/Modal";
import Topbar from "../../../components/topbar/Topbar";
import Swal from "sweetalert2";
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { ObtenerAlertasCatalogo, CambiarEstadoAlertaCatalogo } from "../../../servicios/ServiciosAlertasCatalogo";
import { ObtenerFincas } from "../../../servicios/ServicioFincas";
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas";
import InsertarAlertaCatalogoComponent from "../../../components/alertasCatalogo/InsertarAlertaCatalogo";
import ModificacionAlertaCatalogoComponent from "../../../components/alertasCatalogo/EditarAlertaCatalogo";
import { ObtenerUsuariosAsignadosPorIdentificacion } from "../../../servicios/ServicioUsuario";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store";
import '../../../css/FormSeleccionEmpresa.css';

interface AlertaCatalogoSeleccionado {
    idAlerta: number;
    nombreAlerta: string;
    idFinca: number;
    idParcela: number;
    idMedicionSensor: string;
    condicion: string;
    parametrodeConsulta: number;
    usuariosNotificacion: string;
    rolesUsuario: string;
    usuarioCreacion: string;
}

function AdministrarAlertasCatalogo() {
    const [filtroNombreAlerta, setFiltroNombreAlerta] = useState('');
    const [datosAlertasCatalogoOriginales, setDatosAlertasCatalogoOriginales] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [selectedDatos, setSelectedDatos] = useState<AlertaCatalogoSeleccionado>({
        idAlerta: 0,
        nombreAlerta: '',
        idFinca: 0,
        idParcela: 0,
        idMedicionSensor: '',
        condicion: '',
        parametrodeConsulta: 0,
        usuariosNotificacion: '',
        rolesUsuario: '',
        usuarioCreacion: '',
    });
    const [datosAlertasCatalogo, setDatosAlertasCatalogo] = useState<any[]>([]);
    const [datosAlertasCatalogoFiltrados, setDatosAlertasCatalogoFiltrados] = useState<any[]>([]);
    const [fincas, setFincas] = useState<any[]>([]);
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

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

    useEffect(() => {
        const obtenerParcelasDeFinca = async () => {
            try {
                const parcelasFinca = parcelas.filter((parcela: any) => parcela.idFinca === selectedFinca);
                setParcelasFiltradas(parcelasFinca);
            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        obtenerParcelasDeFinca();
    }, [selectedFinca]);

    const obtenerNombreCondicion = (condicion: string) => {
        switch (condicion) {
            case "=":
                return "Igual";
            case "<":
                return "Menor que";
            case ">":
                return "Mayor que";
            default:
                return condicion;
        }
    };

    const mapDatosConCondiciones = (datos: any[]) => {
        return datos.map(dato => ({
            ...dato,
            nombreCondicion: obtenerNombreCondicion(dato.condicion),
        }));
    };

    const obtenerInfo = async (idFinca?: number | null, idParcela?: number | null) => {
        try {
            const datosAlertasCatalogo = await ObtenerAlertasCatalogo();

            const datosAlertasCatalogoConSEstado = datosAlertasCatalogo
                .filter((dato: any) => dato.estado === 1)
                .map((dato: any) => ({
                    ...dato,
                    sEstado: dato.estado === 1 ? 'Activo' : 'Inactivo'
                }));

            const datosFiltrados = datosAlertasCatalogoConSEstado.filter((dato: any) => {
                return (!idFinca || dato.idFinca === idFinca) && (!idParcela || dato.idParcela === idParcela);
            });

            const datosMapeados = mapDatosConCondiciones(datosFiltrados);

            setDatosAlertasCatalogo(datosMapeados);
            setDatosAlertasCatalogoFiltrados(datosMapeados);
        } catch (error) {
            console.error('Error al obtener los datos del catálogo de alertas:', error);
        }
    };

    useEffect(() => {
        obtenerInfo(selectedFinca, selectedParcela);
    }, [selectedFinca, selectedParcela]);

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setSelectedFinca(value);
        setSelectedParcela(null);
        obtenerInfo(value, null);
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setSelectedParcela(value);
        obtenerInfo(selectedFinca, value);
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombreAlerta(e.target.value);
    };

    useEffect(() => {
        filtrarAlertas();
    }, [filtroNombreAlerta, datosAlertasCatalogo]);

    const filtrarAlertas = () => {
        const alertasFiltradas = filtroNombreAlerta
            ? datosAlertasCatalogo.filter((alerta: any) =>
                alerta.nombreAlerta.toLowerCase().includes(filtroNombreAlerta.toLowerCase())
            )
            : datosAlertasCatalogo;
        setDatosAlertasCatalogoFiltrados(alertasFiltradas);
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

    const openModal = (datos: any) => {
        setSelectedDatos({
            ...datos,
            idFinca: datos.idFinca,
            idParcela: datos.idParcela,
            parametrodeConsulta: datos.parametrodeConsulta,
            usuariosNotificacion: datos.usuariosNotificacion,
            rolesUsuario: datos.rolesUsuario,
            usuarioCreacion: datos.usuarioCreacion,
        });
        abrirCerrarModalEditar();
    };

    const openDetallesModal = (datos: any) => {
        setSelectedDatos({
            ...datos,
            idFinca: datos.idFinca,
            idParcela: datos.idParcela,
            parametrodeConsulta: datos.parametrodeConsulta,
            usuariosNotificacion: datos.usuariosNotificacion,
            rolesUsuario: datos.rolesUsuario,
            usuarioCreacion: datos.usuarioCreacion,
        });
        abrirCerrarModalDetalles();
    };

    const toggleStatus = async (alerta: any) => {
        Swal.fire({
            title: "Eliminar Alerta",
            text: "¿Estás seguro de que deseas eliminar la alerta?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const usuarioModificacion = localStorage.getItem('usuarioActual');
                    
                    const datos = {
                        idAlerta: parseInt(alerta.idAlerta, 10),
                       
                    };

                    console.log(datos);

                    const resultado = await CambiarEstadoAlertaCatalogo(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Alerta eliminada!',
                            text: 'La alerta ha sido eliminada exitosamente.',
                        });
                        await obtenerInfo();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar la alerta.',
                            text: resultado.mensaje,
                        });
                    }
                } catch (error) {
                    Swal.fire("Hubo un problema al intentar eliminar la alerta.", "", "error");
                }
            }
        });
    };

    const handleEditarAlertaCatalogo = async () => {
        await obtenerInfo(selectedFinca, selectedParcela);
        abrirCerrarModalEditar();
    };

    const handleAgregarAlertaCatalogo = async () => {
        await obtenerInfo(selectedFinca, selectedParcela);
        abrirCerrarModalInsertar();
    };

    const columns = [
        { key: 'nombreAlerta', header: 'Nombre de Alerta' },
        { key: 'nombreCondicion', header: 'Condición' },
        { key: 'parametrodeConsulta', header: 'Parámetro de Consulta' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
    <Topbar />
    <BordeSuperior text="Catálogo de Alertas" />
    <div className="content col-md-12">
        
        
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px', marginBottom: '1rem' }}>
            <div className="filtro-container" style={{ flex: 1 }}>
                <div>
                    <label>Finca:</label>
                </div>
                <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select" style={{ width: '240px' }}>
                    <option value="">Seleccione la finca...</option>
                    {fincas.map((finca: any) => (
                        <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="filtro-container" style={{ flex: 1,  }}>
                <div>
                    <label>Parcela:</label>
                </div>
                <select value={selectedParcela ? selectedParcela : ''} onChange={handleParcelaChange} className="custom-select" style={{ width: '240px', left: ''}}>
                    <option value="">Seleccione la parcela...</option>
                    {parcelasFiltradas.map((parcela: any) => (
                        <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="filtro-container" style={{ flex: 2, marginTop: '14px'}}>
                <label htmlFor="filtroNombreAlerta" style={{marginBottom: '10px'}}>Filtrar por nombre de alerta:</label>
                <input
                    type="text"
                    id="filtroNombreAlerta"
                    value={filtroNombreAlerta}
                    onChange={handleChangeFiltro}
                    placeholder="Ingrese el nombre de la alerta"
                    className="form-control"
                    style={{ height: '20px', width: '215px', right: '10px'}}
                />
            </div>
            <div className="filtro-container" style={{ flex: 1, }}>
            <button 
                onClick={() => abrirCerrarModalInsertar()} 
                className="btn-crear" 
                style={{ 
                    width: '230px', 
                    marginTop: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}
            >
                <AiOutlinePlusCircle  style={{ marginRight: '8px' }} />
                Ingresar nueva alerta
            </button>
            </div>
        </div>
        
        <TableResponsive 
            columns={columns} 
            data={datosAlertasCatalogoFiltrados} 
            openModal={openModal} 
            btnActionName={"Editar"} 
            toggleStatus={toggleStatus} 
            openDetallesModal={openDetallesModal} 
        />
    </div>
</div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Ingresar nueva alerta"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container' style={{ width: '600px', height: '400px' }}>
                    <div className='form-group'>
                        <InsertarAlertaCatalogoComponent onAdd={handleAgregarAlertaCatalogo} />
                    </div>
                </div>
            </Modal>
            
            

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar alerta del catálogo"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container' style={{ width: '600px' }}>
                    <div className='form-group'>
                        <ModificacionAlertaCatalogoComponent
                            idAlerta={selectedDatos.idAlerta}
                            nombreAlerta={selectedDatos.nombreAlerta}
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idMedicionSensor={selectedDatos.idMedicionSensor}
                            condicion={selectedDatos.condicion}
                            parametrodeConsulta={selectedDatos.parametrodeConsulta}
                            usuariosNotificacion={selectedDatos.usuariosNotificacion}
                            usuarioCreacion={selectedDatos.usuarioCreacion}
                            onEdit={handleEditarAlertaCatalogo}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles de la alerta del catálogo"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container' style={{ width: '600px' }}>
                    <div className='form-group'>
                        <ModificacionAlertaCatalogoComponent
                            idAlerta={selectedDatos.idAlerta}
                            nombreAlerta={selectedDatos.nombreAlerta}
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idMedicionSensor={selectedDatos.idMedicionSensor}
                            condicion={selectedDatos.condicion}
                            parametrodeConsulta={selectedDatos.parametrodeConsulta}
                            usuariosNotificacion={selectedDatos.usuariosNotificacion}
                            usuarioCreacion={selectedDatos.usuarioCreacion}
                            readOnly
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarAlertasCatalogo;
