import React, { useEffect, useState } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { GuardarParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente AgregarEmpresa
interface AgregarParcela {
    onAdd: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

// Componente funcional CrearEmpresa
const CrearParcela: React.FC<AgregarParcela> = ({ onAdd }) => {

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombre: '' });

    // Estado para almacenar la selección actual de cada select
    const [selectedFinca, setSelectedFinca] = useState<string>('');


    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idFinca: '', // Inicializa idFinca como una cadena vacía
        nombre: ''    // Inicializa nombre como una cadena vacía
    });


    // Efecto para obtener las fincas, identificaciones y parcelas al cargar el componente
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresa = localStorage.getItem('empresaUsuario');
                if (idEmpresa) {
                const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                setFincas(fincasResponse);
                }
            } catch (error) {
                console.error('Error al obtener las fincas:', error);
            }
        };
        obtenerFincas();
    }, []);

    // Efecto para actualizar el formData cuando cambian las props
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idFinca: selectedFinca,
            nombre: '' // Establece el valor inicial de nombre
        });
    }, [selectedFinca]);

    //obtener el valor de idEmpresa del usuario logueado
    const idEmpresaString = localStorage.getItem('empresaUsuario');
    let idEmpresa: number | null = null;

    if (idEmpresaString !== null) {
        idEmpresa = parseInt(idEmpresaString);
    }

    // Filtrar fincas según la empresa seleccionada
    const filteredFincas = fincas.filter(finca => finca.idEmpresa === idEmpresa);

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: FormData) => ({
            ...prevState,
            [name]: value
        }));
    };

    // Función para manejar el blur de los inputs y eliminar mensajes de error
    const handleInputBlur = (fieldName: string) => {
        // Eliminar el mensaje de error para el campo cuando el usuario comience a escribir en él
        if (errors[fieldName]) {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                [fieldName]: ''
            }));
        }
    };

    // Función para manejar cambios en la selección de finca
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        // Actualizar el formData con el id de la finca seleccionada
        setFormData((prevState: any) => ({
            ...prevState,
            idFinca: parseInt(value)
        }));
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

        // Validar que el nombre no esté vacío si se ha seleccionado una finca
        if (!formData.nombre && selectedFinca) {
            newErrors.nombre = 'El nombre es requerido';
        } else {
            newErrors.nombre = '';
        }

        // Actualizar los errores
        setErrors(newErrors);

        // Si no hay errores, enviar los datos al servidor
        if (Object.values(newErrors).every(error => error === '')) {
            // Llamar a la función handleSubmit para enviar los datos al servidor
            handleSubmit();
        }
    };
    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            nombre: formData.nombre,
            idFinca: formData.idFinca,
        };
        try {
            const resultado = await GuardarParcelas(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'Parcela Agregada! ',
                    text: 'Parcela agregada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar la parcela.',
                    text: resultado.mensaje,
                });
            };
            onAdd()
        } catch (error) {
            console.log(error)
        }

    };

    // Renderizado del componente
    return (
        <div>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '96.5%',justifyContent: 'center', marginLeft: '9px',marginRight: '0', gap: '0' }}>
                <FormGroup  style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%', marginTop:'0.7%'}}>
                    <label htmlFor="fincas">Finca:</label>
                    <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange} style={{height:'44px'}}>
                        <option key="default-finca" value="">Seleccione...</option>
                        {filteredFincas.map((finca) => (
                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                </FormGroup>
                <FormGroup row  style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%'}}>
                    <Label for="nombre" sm={2} className="input-label">Nombre: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Ingrese el nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                            className={errors.nombre ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.nombre}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <div className='botonesN' style={{display:'flex', justifyContent:'center'}}>
                <button onClick={handleSubmitConValidacion} className="btn-styled" style={{width:'50%'}}><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</button>
            </div>            
        </div>
    );
}

export default CrearParcela;
