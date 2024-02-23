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
    contrasena: string,
    contrasenaConfirmar: string
}

interface AdministradorSeleccionadoProps {
    identificacion: string;
    empresa: string;
    onEdit: () => void;
}

const EditarCuentaAdministrador: React.FC<AdministradorSeleccionadoProps> = ({ identificacion, empresa, onEdit }) => {

    const [empresas, setEmpresas] = useState<Option[]>([]);

    const [selectedEmpresa, setSelectedEmpresa] = useState<string>(() => empresa);

    const [errors, setErrors] = useState<Record<string, string>>({ identificacion: '', email: '', empresa: '', contrasena: '', nuevaContrasena: '' });

    const [formData, setFormData] = useState<any>({
        identificacion: '',
        contrasena: '',
        empresa: '',
        contrasenaConfirmar: ''
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


    useEffect(() => {

        // Actualizar el formData cuando las props cambien
        setFormData({
            identificacion: identificacion,
            empresa: empresa,
            contrasena: '',
            contrasenaConfirmar: ''
        });
    }, [identificacion, empresa]);





    const handleSubmitConValidacion = () => {
        // Validar campos antes de avanzar al siguiente paso
        const newErrors: Record<string, string> = {};

        // Validar identificacion no vacío
        if (!formData.identificacion.trim()) {
            newErrors.identificacion = 'La identificación es requerida';
        } else {
            newErrors.identificacion = '';
        }


        if (formData.contrasena.trim()) {
            if (formData.contrasena.length < 8) {
                newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
            } else if (!/[A-Z]/.test(formData.contrasena)) {
                newErrors.contrasena = 'La contraseña debe contener al menos una mayúscula';
            } else if (!/[^A-Za-z0-9]/.test(formData.contrasena)) {
                newErrors.contrasena = 'La contraseña debe contener al menos un caracter especial';
            } else if (formData.contrasena !== formData.contrasenaConfirmar) {
                newErrors.contrasenaConfirmar = 'Las contraseñas no coinciden';
            } else if (!formData.contrasenaConfirmar.trim()) {
                newErrors.contrasenaConfirmar = 'La contraseña es requerida';
            } else if (!/\d/.test(formData.contrasena)) {
                newErrors.contrasena = 'La contraseña debe contener al menos un número';
            } else {
                newErrors.contrasenaConfirmar = '';
                newErrors.contrasena = '';
            }
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
            contrasena: formData.contrasena,
            idEmpresa: selectedEmpresa
        };
        try {

            const resultado = await ActualizarUsuarioAdministrador(datos);
            console.log(datos)
            console.log(resultado)

            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Actuzalizado! ',
                    text: 'Usuario actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el usuario.',
                    text: resultado.mensaje,
                });
            };

            if (onEdit) {
                onEdit();
            }
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

    const empresaSeleccionada = empresas.find(empresa => {
        console.log('Empresa ID:', empresa.idEmpresa);
        console.log('Selected Empresa:', selectedEmpresa);
        return Number(empresa.idEmpresa) === Number(selectedEmpresa);
    });

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
                        value={formData.identificacion || identificacion}
                        onChange={handleInputChange}
                        readOnly
                        onBlur={() => handleInputBlur('identificacion')} // Manejar blur para quitar el mensaje de error
                        className={errors.identificacion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error

                    />
                    <FormFeedback>{errors.identificacion}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label for="contrasena" sm={2} className="input-label">Contraseña</Label>
                <Col sm={12}>
                    <Input
                        type="password"
                        id="contrasena"
                        name="contrasena"
                        placeholder="Ingrese su contraseña"
                        value={formData.contrasena}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur('contrasena')} // Manejar blur para quitar el mensaje de error
                        className={errors.contrasena ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                    />
                    <FormFeedback>{errors.contrasena}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label for="contrasenaConfirmar" sm={2} className="input-label">Repetir contraseña</Label>
                <Col sm={12}>
                    <Input
                        type="password"
                        id="contrasenaConfirmar"
                        name="contrasenaConfirmar"
                        placeholder="Repita su contraseña"
                        value={formData.contrasenaConfirmar}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur('contrasenaConfirmar')} // Manejar blur para quitar el mensaje de error
                        className={errors.contrasenaConfirmar ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'input-error' si hay un error
                    />
                    <FormFeedback>{errors.contrasenaConfirmar}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="empresas" className="input-label">Empresa</Label>
                <select className="custom-select" id="empresas" value={empresaSeleccionada?.idEmpresa || ''} onChange={handleEmpresaChange}>
                    <option key="default-empresa" value="">Seleccione...</option>
                    {empresas.map((empresa) => (
                        <option
                            key={`${empresa.idEmpresa}-${empresa.nombre}`}
                            value={empresa.idEmpresa}
                        >
                            {empresa.nombre}
                        </option>
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