import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import '../../css/CrearCuenta.css';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store.ts';

import { ModificarSensor, ObtenerEstadoSensores } from '../../servicios/ServicioSensor.ts';
import { ObtenerRegistroPuntoMedicion } from '../../servicios/ServicioPuntoMedicion.ts';
// Interfaz para las propiedades del componente
interface Props {
    idSensor: number;
    idPuntoMedicion: number;
    idEstado: number;
    nombre: string;
    modelo: string;
    identificadorSensor: string;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
    idEstado: number;
    estado: string;
    codigo: string;
    idPuntoMedicion: number;
}

const ModificarSensores: React.FC<Props> = ({
    idSensor,
    idPuntoMedicion,
    idEstado,
    nombre,
    modelo,
    identificadorSensor,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);

    const [parcelas, setParcelas] = useState<Option[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

    const [selectedEstadoSensor, setSelectedEstadoSensor] = useState<string>(() => idEstado ? idEstado.toString() : '');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>(() => idPuntoMedicion ? idPuntoMedicion.toString() : '');
    const [estadoSensor, setEstadoSensor] = useState<Option[]>([]);

    const [sensores, setSensores] = useState<Option[]>([]);
    const [formData, setFormData] = useState<any>({
        idSensor: '',
        identificacionUsuario: localStorage.getItem('identificacionUsuario'),
        identificadorSensor: '',
        nombre: '',
        modelo: '',
        idEstado: '',
        idPuntoMedicion: '',
    });

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        identificadorSensor: '',
        nombre: '',
        modelo: '',
        idEstado: '',
        idPuntoMedicion: '',
    });


    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        setFormData({
            idSensor: idSensor,
            identificadorSensor: identificadorSensor,
            nombre: nombre,
            modelo: modelo,
            idEstado: idEstado,
            idPuntoMedicion: idPuntoMedicion,
            identificacionUsuario: localStorage.getItem('identificacionUsuario'),

        });
    }, [idSensor]);



    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const estadosSensores = await ObtenerEstadoSensores();
                    setEstadoSensor(estadosSensores)
                    const puntoMedicion = await ObtenerRegistroPuntoMedicion({ idEmpresa: idEmpresaString });
                    const fincasResponse = await ObtenerFincas();
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);


                    setSensores(puntoMedicion)
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, [setParcelas]);


    const handleEstadoSensorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idEstado = value
        setSelectedEstadoSensor(value);
    };
    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idPuntoMedicion = value
        setSelectedPuntoMedicion(value);
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }


    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de avanzar al siguiente paso
        const newErrors: Record<string, string> = {};


        if (!selectedEstadoSensor) {
            newErrors.idEstado = 'Debe seleccionar un estado de sensor';
        } else {
            newErrors.idEstado = '';
        }

        if (!selectedPuntoMedicion) {
            newErrors.idPuntoMedicion = 'Debe seleccionar un punto de medición';
        } else {
            newErrors.idPuntoMedicion = '';
        }
        // Validar que se ingrese el identificador del sensor
        if (!formData.identificadorSensor) {
            newErrors.identificadorSensor = 'Identificador requerido';
        } else if (formData.identificadorSensor.length > 100) {
            1
            newErrors.identificadorSensor = 'El identificador no puede exceder los 100 caracteres';
        } else if (/^\s/.test(formData.identificadorSensor)) {
            newErrors.identificadorSensor = 'No puede comenzar con espacios';
        } else {
            newErrors.identificadorSensor = '';
        }
        // Validar el nombre
        if (!formData.nombre) {
            newErrors.nombre = 'Nombre requerido';
        } else if (formData.nombre.length > 50) {
            newErrors.nombre = 'El nombre no puede exceder los 50 caracteres';
        } else if (/^\s/.test(formData.nombre)) {
            newErrors.nombre = 'No puede comenzar con espacios';
        } else {
            newErrors.nombre = '';
        }

        // Validar el modelo
        if (!formData.modelo) {
            newErrors.modelo = 'Modelo requerido';
        } else if (formData.modelo.length > 150) {
            newErrors.modelo = 'El modelo no puede exceder los 150 caracteres';
        } else if (/^\s/.test(formData.modelo)) {
            newErrors.modelo = 'No puede comenzar con espacios';
        } else {
            newErrors.modelo = '';
        }


        // Actualizar los errores
        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            idSensor: formData.idSensor,
            identificacionUsuario: formData.identificacionUsuario,
            identificadorSensor: formData.identificadorSensor,
            nombre: formData.nombre,
            modelo: formData.modelo,
            idEstado: formData.idEstado,
            idPuntoMedicion: formData.idPuntoMedicion,
        };

        try {
            const resultado = await ModificarSensor(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro Actualizado! ',
                    text: 'Registro actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el registro.',
                    text: resultado.mensaje,
                });
            };

            // vuelve a cargar la tabla
            if (onEdit) {
                onEdit();
            }

        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <h2>Registro de Datos</h2>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '95%', marginLeft: '0.5rem' }}>

                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="nombre" sm={4} className="input-label">Nombre:</Label>
                            <Col sm={8}>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder='Nombre...'
                                    className={errors.nombre ? 'input-styled input-error' : 'input-styled'}
                                />
                                <FormFeedback>{errors.nombre}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>

                        <FormGroup row>
                            <Label for="modelo" sm={4} className="input-label">Modelo:</Label>
                            <Col sm={8}>
                                <Input
                                    id="modelo"
                                    name="modelo"
                                    value={formData.modelo}
                                    onChange={handleInputChange}
                                    placeholder='Modelo...'
                                    className={errors.modelo ? 'input-styled input-error' : 'input-styled'}
                                />
                                <FormFeedback>{errors.modelo}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="identificadorSensor" sm={4} className="input-label">Identificador sensor (EUI):</Label>
                            <Col sm={8}>
                                <Input
                                    id="identificadorSensor"
                                    name="identificadorSensor"
                                    value={formData.identificadorSensor}
                                    onChange={handleInputChange}
                                    placeholder='Identificador sensor...'
                                    className={errors.identificadorSensor ? 'input-styled input-error' : 'input-styled'}
                                />
                                <FormFeedback>{errors.identificadorSensor}</FormFeedback>
                            </Col>
                        </FormGroup>

                    </div>

                </div>
            </div>

            <div style={{ flex: 1, marginTop: '0.5rem', marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="estados">Estado de sensor:</label>
                        <select className="custom-select" id="estados" value={selectedEstadoSensor} onChange={handleEstadoSensorChange}>
                            <option key="default-sensor" value="">Seleccione...</option>
                            {estadoSensor.map((sensor) => (
                                <option key={`${sensor.idEstado}-${sensor.estado || 'undefined'}`} value={sensor.idEstado}>{sensor.estado || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.idEstado && <FormFeedback>{errors.idEstado}</FormFeedback>}
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="puntoMedicion">Punto medición:</label>
                        <select className="custom-select" id="puntoMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange}>
                            <option key="default-punto-medicion" value="">Seleccione...</option>
                            {sensores.map((sensor) => (
                                <option key={`${sensor.idPuntoMedicion}-${sensor.codigo || 'undefined'}`} value={sensor.idPuntoMedicion}>{sensor.codigo || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.idPuntoMedicion && <FormFeedback>{errors.idPuntoMedicion}</FormFeedback>}
                    </FormGroup>
                </div>
                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={handleSubmitConValidacion} className="btn-styled btn btn-secondary">Guardar</Button>
                    </Col>
                </FormGroup>
            </div>
        </div>
    );

};

export default ModificarSensores;
