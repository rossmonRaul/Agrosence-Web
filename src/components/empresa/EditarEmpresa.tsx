import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { EditarEmpresas } from '../../servicios/ServicioEmpresas';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente EditarEmpresa
interface Props {
    idEmpresa: string;
    nombrebase: string;
    onEdit: () => void;
}

// Componente funcional EditarEmpresa
const EditarEmpresa: React.FC<Props> = ({ idEmpresa, nombrebase, onEdit }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombrebase });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idEmpresa: 0,
        nombre: ''
    });

    // Efecto para actualizar el formData cuando las props cambien
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idEmpresa: idEmpresa,
            nombre: nombrebase
        });
    }, [idEmpresa, nombrebase]);


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
        // Eliminar el mensaje de error para el campo cuando el identificacion comienza a escribir en él
        if (errors[fieldName]) {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                [fieldName]: ''
            }));
        }
    };

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de enviar los datos al servidor
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) {
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
            idEmpresa: idEmpresa,
            nombre: formData.nombre
        };
        try {
            const resultado = await EditarEmpresas(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Empresa Actualizada! ',
                    text: 'Empresa actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la empresa.',
                    text: resultado.mensaje,
                });
            };

            if (onEdit) {
                onEdit();
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'row', width: '96.5%',justifyContent: 'center', marginLeft: '9px',marginRight: '0', gap: '0'  }}>
            <div style={{ flex: 1 }}>
                <FormGroup row style={{display:'flex', alignItems:'center',justifyContent:'space-between'}}>
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
                            style={{marginTop: '3%',width:'170%'}}
                        />
                        <FormFeedback>{errors.nombre}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <div className='botonesN' style={{marginLeft:'25%', width:'25%', marginTop:'1%'}}>
                <button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '3%'}}/>Actualizar</button>
            </div>
            </div>
        </div>
    );
}

export default EditarEmpresa;