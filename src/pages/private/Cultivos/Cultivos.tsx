import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
// import '../../../css/OrdenCompra.css'
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import CrearCultivo from "../../../components/cultivo/InsertarCultivo.tsx";
import { CambiarEstadoCultivo, ObtenerCultivos } from "../../../servicios/ServicioCultivo.ts";
import EditarCultivo from "../../../components/cultivo/EditarCultivo.tsx";
import { IoAddCircleOutline } from "react-icons/io5";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";


interface Cultivos {
    idCultivo: number;
    Cultivo: string;
}

function Cultivos() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearCultivo, setModalCrearCultivo] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    // Estado para almacenar todos los usuarios asignados
    const [cultivos, setCultivos] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [cultivosFiltrados, setCultivosFiltrados] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario
    const [filtroInput, setfiltroInput] = useState('');

    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);

    // Función para manejar cambios en la selección de finca
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
    };
    //puede que falten cambios a los datos seleccionados
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idParcela: 0,
        idCultivo: 0,
        cultivo: '',
        finca: '',
        parcela: '',
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearCultivo = () => {
        setModalCrearCultivo(!modalCrearCultivo);
    }

    const handleAgregarCultivo = async () => {
        // Lógica para agregar la medicion
        // Después de agregar la medicion se vuelven a cargar los datos
        await obtenerDatosCultivos();
        abrirCerrarModalCrearCultivo();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [selectedFinca, filtroInput, cultivos]);


    // Función para filtrar cada vez que cambie el filtro 
    const filtrarDatos = () => {

        let cultivosFiltradosPorFinca = selectedFinca
            ? cultivos.filter(cultivo => cultivo.idFinca === parseInt(selectedFinca))
            : cultivos

        if (filtroInput.trim() !== '') {
            cultivosFiltradosPorFinca = cultivosFiltradosPorFinca.filter((cultivo: any) =>
                cultivo.nombreParcela.toLowerCase().includes(filtroInput.toLowerCase()) ||
                cultivo.cultivo.toLowerCase().includes(filtroInput.toLowerCase())
            );
        }
        setCultivosFiltrados(cultivosFiltradosPorFinca);
    };


    const abrirCerrarModalEditar = () => {

        setModalEditar(!modalEditar);
    }

    const handleEditarCultivo = async () => {

        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosCultivos();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosCultivos();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosCultivos = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const datosCultivos = await ObtenerCultivos();

            const fincasResponse = await ObtenerFincas();
            if (idEmpresa) {
                const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresa));

                // Extraer los identificadores de finca
                const idsFincasFiltradas = fincasFiltradas.map((finca: any) => finca.idFinca)

                setFincas(fincasFiltradas);

                // Filtrar con las parcelas del usuario actual
                const cultivosConEstado = datosCultivos.filter((cultivo: any) => {
                    return idsFincasFiltradas.includes(cultivo.idFinca);
                }).map((cultivo: any) => ({
                    ...cultivo,
                    sEstado: cultivo.estado === 1 ? 'Activo' : 'Inactivo',
                }));

                setCultivos(cultivosConEstado);
                setCultivosFiltrados(cultivosConEstado);
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };

    const toggleStatus = async (cultivo: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar el cultivo: " + cultivo.cultivo + "  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdCultivo: cultivo.idCultivo,
                    };

                    const resultado = await CambiarEstadoCultivo(datos);


                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosCultivos();
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
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



    // Columnas de la tabla
    const columns = [
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Sección de Cultivos" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>

                            <label htmlFor="filtroFinca">Finca:</label>
                            <select
                                id="filtroFinca"
                                value={selectedFinca || ''}
                                onChange={handleFincaChange}
                                className="custom-select"
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            >
                                <option value={''}>Todas las fincas</option>
                                {fincas.map(finca => (
                                    <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>

                            <label htmlFor="filtroNombre">Cultivo o Parcela:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                value={filtroInput}
                                onChange={handleChangeFiltro}
                                placeholder="Cultivo o parcela"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="form-control"
                            />

                        </div>
                        <button onClick={() => abrirCerrarModalCrearCultivo()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear Registro</span>
                        </button>
                    </div>
                    <TableResponsive columns={columns} data={cultivosFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} useTrashIcon={true} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Cultivo"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarCultivo
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idCultivo={(selectedDatos.idCultivo)}
                            cultivo={selectedDatos.cultivo}
                            onEdit={handleEditarCultivo}
                        />
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={modalCrearCultivo}
                toggle={abrirCerrarModalCrearCultivo}
                title="Crear Cultivo"
                onCancel={abrirCerrarModalCrearCultivo}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearCultivo
                            onAdd={handleAgregarCultivo}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default Cultivos