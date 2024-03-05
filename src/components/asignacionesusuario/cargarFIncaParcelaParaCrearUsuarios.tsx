/*  esta pantalla se esta usando para la creacion de usuarios por parte del administrador*/
import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import Swal from 'sweetalert2';
import { AsignarNuevaFincaParsela, CambiarEstadoUsuarioFincaParcela } from '../../servicios/ServicioUsuario';
import '../../css/CrearCuenta.css'
import TableResponsive from '../table/table';
import Modal from '../modal/Modal';
import AsignarFincaParcela from '../asignarfincaparcela/AsignarFincaParcela';
    
// Definición de las propiedades que espera recibir el componente
interface Props {
    idEmpresa: number;
};

// Interfaz para el formato de los datos recibidos de la API
interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

// Componente funcional principal
const CargarFincasParcelasUsuarios: React.FC<Props> = ({idEmpresa }) => {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para almacenar todas las asignaciones de fincas y parcelas
    const [usuariosAsignados, setUsuariosAsignados] = useState<any[]>([]);
    // Estado para almacenar la información del usuario seleccionado para editar
    const [selectedUsuario, setSelectedUsuario] = useState({
        identificacion: '',
        correo: '',
        idEmpresa: '',
        idParcela: '',
        idFinca: '',
        idUsuarioFincaParcela: ''
    });
    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ finca: '', parcela: '' });
    // Estado para almacenar la selección actual de cada select
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        idParcela: 0,
        idEmpresa: 0,
        identificacion: ''
    });

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }

    const openModal = (usuario: any) => {
        setSelectedUsuario(usuario);
        abrirCerrarModalEditar();
    };

    // Efecto para obtener las fincas, identificaciones y parcelas al cargar el componente
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const fincasResponse = await ObtenerFincas();
                setFincas(fincasResponse);
            } catch (error) {
                console.error('Error al obtener las fincas:', error);
            }
        };
        obtenerFincas();
    }, []);

    useEffect(() => {
        const obtenerParcelas = async () => {
            try {
                const parcelasResponse = await ObtenerParcelas();
                setParcelas(parcelasResponse);
            } catch (error) {
                console.error('Error al obtener las parcelas:', error);
            }
        };
        obtenerParcelas();
    }, []);

    // Efecto para actualizar el formData cuando cambian las props
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            isEmpresa: idEmpresa
        });
    }, [idEmpresa]);

    // Filtrar fincas según la empresa seleccionada
    const filteredFincas = fincas.filter(finca => finca.idEmpresa === idEmpresa);

    // Filtrar parcelas según la finca seleccionada
    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    // Funciónes para manejar el cambio de la selección de identificacion, finca y parcela  
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
    };

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de enviar los datos al servidor
        const newErrors: Record<string, string> = {};

        // Validar selección de finca
        if (!selectedFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        // Validar selección de parcela
        if (!selectedParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }

        // Actualizar los errores
        setErrors(newErrors);

        // Si no hay errores, enviar los datos al servidor
        if (Object.values(newErrors).every(error => error === '')) {
            // Actualizar el estado formData con las selecciones
            formData.finca = selectedFinca,
                formData.parcela = selectedParcela,
                // aun no
                // formData.identificacion = identificacion,
                // Llamar a la función handleSubmit para enviar los datos al servidor
                handleSubmit();
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            identificacion: formData.identificacion,
            idFinca: parseInt(formData.finca),
            idParcela: parseInt(formData.parcela),
        };

        try {
            const resultado = await AsignarNuevaFincaParsela(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Asignado! ',
                    text: 'Usuario asignado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al asignar el usuario.',
                    text: resultado.mensaje,
                });
            };

        } catch (error) {
            console.log(error);
        }
    };

    // Función para cambiar el estado de una asignación de finca y parcela
    const toggleStatus = (user: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la asignacion del usuario: " + user.identificacion + "?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        identificacion: user.identificacion,
                        idUsuario: user.idUsuarioFincaParcela,
                        idFinca: user.idFinca,
                        idParcela: user.idParcela
                    };
                    const resultado = await CambiarEstadoUsuarioFincaParcela(datos);
                    if (parseInt(resultado.indicador) === 1) {

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
                    Swal.fire("Error al asignar al usuario", "", "error");
                }
            }
        });
    };

    // Columnas de la tabla
    const columns = [
        { key: 'sEstado', header: 'Estado' },
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    const handleEditarUsuario = async () => {
        // Después de editar exitosamente, actualiza la lista de usuarios administradores
        abrirCerrarModalEditar();
    };

    // Renderizado del componente
    return (
        <div>
            <div className="form-container-fse">
                <h2>Asignar nueva finca y parcela</h2>
                <FormGroup>
                    <label htmlFor="fincas">Finca:</label>
                    <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                        <option key="default-finca" value="">Seleccione...</option>
                        {filteredFincas.map((finca) => (
                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="parcelas">Parcela:</label>
                    <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                        <option key="default-parcela" value="">Seleccione...</option>
                        {filteredParcelas.map((parcela) => (
                            <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                </FormGroup>
            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Asignar Datos</button>

            <h2>Fincas y Parcelas Asignadas</h2>

            <TableResponsive columns={columns} data={usuariosAsignados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} />
   

        </div>
    );
}

export default CargarFincasParcelasUsuarios;