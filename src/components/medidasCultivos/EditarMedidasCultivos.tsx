import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { ModificarMedidasCultivos } from '../../servicios/ServicioCultivo';
import { AppStore } from '../../redux/Store';
import { useSelector } from 'react-redux';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente EditarEmpresa
interface Props {
    idMedidasCultivo: string;
    medida: string;
    onEdit: () => void;
}

// Componente funcional EditarEmpresa
const EditarMedidasCultivos: React.FC<Props> = ({ idMedidasCultivo, medida, onEdit }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ });
    const userState = useSelector((store: AppStore) => store.user);
    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idMedidasCultivo : '',
        medida: '',
        usuarioCreacionModificacion:''
    });

    // Efecto para actualizar el formData cuando las props cambien
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idMedidasCultivo: idMedidasCultivo,
            medida: medida
        });
    }, [idMedidasCultivo, medida]);


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
        if (!formData.medida.trim()) {
            newErrors.medida = 'La medida del cultivo es requerida';
        } else {
            newErrors.medida = '';
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
            idMedidasCultivo: formData.idMedidasCultivo,
            medida: formData.medida,
            usuarioCreacionModificacion : userState.identificacion
        };
        try {
            const resultado = await ModificarMedidasCultivos(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Medida de Cultivo Actualizada! ',
                    text: 'Medida de Cultivo actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la Medida de Cultivo.',
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
        <div>
            <div className="form-container-fse">
                <FormGroup row>
                    <Label for="nombre" sm={2} className="input-label">Medida de cultivo: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="medida"
                            name="medida"
                            placeholder="Ingrese la medida de cultivo"
                            value={formData.medida}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('medida')} // Manejar blur para quitar el mensaje de error
                            className={errors.medida ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                            style={{marginTop: '3%'}}
                        />
                        <FormFeedback>{errors.medida}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <div className='botonesN'>
                <button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Actualizar</button>
            </div>
        </div>
    );
}

export default EditarMedidasCultivos;