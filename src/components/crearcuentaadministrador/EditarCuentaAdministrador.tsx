import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { ActualizarUsuarioAdministrador } from '../../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { ObtenerEmpresas } from '../../servicios/ServicioEmpresas.ts';
import '../../css/FormSeleccionEmpresa.css'

interface Option {
    idEmpresa: number;
    nombre: string;
}

interface AdministradorSeleccionadoProps {
    identificacion: string;
    correo: string;
    empresa: string;
}

const EditarCuentaAdministrador: React.FC<AdministradorSeleccionadoProps> = ({ identificacion, correo, empresa })  => {

    const [empresas, setEmpresas] = useState<Option[]>([]);

    const [selectedEmpresa, setSelectedEmpresa] = useState<string>(() => empresa || '');

    const [errors, setErrors] = useState<Record<string, string>>({ identificacion: '', email: '', empresa: '' });

    const [formData, setFormData] = useState<any>({
        identificacion: '',
        email: '',
        empresa: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: FormData) => ({
            ...prevState,
            [name]: value
        }));
    };


    useEffect(() => {
        const obtenerEmpresas = async () => {
            try {

                const empresasResponse = await ObtenerEmpresas();
                // Obtener todas las fincas y parcelas de una vez
                
                setEmpresas(empresasResponse);
                
            } catch (error) {
                console.error('Error al obtener las empresas:', error);
            }
        };
  
        obtenerEmpresas();
    }, []);


    const handleSubmitConValidacion = () => {
        // Validar campos antes de avanzar al siguiente paso
        const newErrors: Record<string, string> = {};

        // Validar identificacion no vacío
        if (!formData.identificacion.trim()) {
            newErrors.identificacion = 'La identificación es requerida';
        } else {
            newErrors.identificacion = '';
        }

        
        // Validar correo no vacío y con formato válido
        const correoPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'El correo es requerido';
        } else if (!correoPattern.test(formData.email)) {
            newErrors.email = 'El correo no es válido';
        } else {
            newErrors.email = '';
        }

        if (!selectedEmpresa) {
            newErrors.empresa = 'Debe seleccionar una empresa';
          } else {
            newErrors.empresa = '';
          }

        // Actualizar los errores
        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }


    };


    const handleSubmit = async () => {
        const datos = {
            identificacion: formData.identificacion,
            correo: formData.email,
            empresa: selectedEmpresa
        };
        try {
            const resultado = await ActualizarUsuarioAdministrador(datos);


            if (parseInt(resultado.indicador) === 0) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Gracias por su registro! ',
                    text: 'Cuenta creada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear la cuenta.',
                    text: resultado.mensaje,
                });
            };
        } catch (error) {

        }


    };

    const handleInputBlur = (fieldName: string) => {
        // Eliminar el mensaje de error para el campo cuando el identificacion comienza a escribir en él
        if (errors[fieldName]) {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                [fieldName]: ''
            }));
        }
    };

    const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedEmpresa(value);
      };

    return (
        <div>
            <FormGroup row>
                <Label for="identificacion" sm={2} className="input-label">Identificación</Label>
                <Col sm={12}>
                    <Input
                        type="text"
                        id="identificacion"
                        name="identificacion"
                        placeholder="Identificación"
                        defaultValue={identificacion}
                        value={formData.Identificación}
                        onChange={handleInputChange}
                        readOnly
                        onBlur={() => handleInputBlur('identificacion')} // Manejar blur para quitar el mensaje de error
                        className={errors.identificacion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error

                    />
                    <FormFeedback>{errors.identificacion}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label for="email" sm={2} className="input-label">Correo electrónico</Label>
                <Col sm={12}>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="alguien@ejemplo.com"
                        defaultValue={correo}
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur('email')} // Manejar blur para quitar el mensaje de error
                        className={errors.email ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                    />
                    <FormFeedback>{errors.email}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="empresas" className="input-label">Empresa</Label>
                <select className="custom-select" id="empresas" value={selectedEmpresa} onChange={handleEmpresaChange}>
                    <option key="default-empresa" value="">Seleccione...</option>
                    {empresas.map((empresa) => (
                        <option key={`${empresa.idEmpresa}-${empresa.nombre}`} value={empresa.idEmpresa}>{empresa.nombre}</option>
                    ))}
                </select>
                {errors.empresa && <FormFeedback>{errors.empresa}</FormFeedback>}
            </FormGroup>
            <FormGroup row>
                <Col sm={{ size: 9, offset: 2 }}>
                    <Button onClick={handleSubmitConValidacion} className="btn-styled" >Editar Datos</Button>
                </Col>
            </FormGroup>
        </div>
    );
}

export default EditarCuentaAdministrador;