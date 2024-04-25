import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store.ts';
import { InsertarSensores, ObtenerEstadoSensores } from '../../servicios/ServicioSensor.ts';
import { ObtenerRegistroPuntoMedicion } from '../../servicios/ServicioPuntoMedicion.ts';
interface InsertarManejoFertilizanteProps {
    onAdd: () => void;
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


const InsertarRegistroSensores: React.FC<InsertarManejoFertilizanteProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState<any>({
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


    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    const [selectedEstadoSensor, setSelectedEstadoSensor] = useState<string>('');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');

    const userState = useSelector((store: AppStore) => store.user);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [estadoSensor, setEstadoSensor] = useState<Option[]>([]);

    const [sensores, setSensores] = useState<Option[]>([]);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    //Se obtienen las fincas y parcelas del usuario al cargar el componente
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

                    const sensoresFiltrados = sensores.filter((sensor: any) => {
                        // Verificar si el idFinca e idParcela del sensor coinciden con alguna parcela filtrada
                        return parcelasFiltradas.some((parcela: any) => sensor.idFinca === parcela.idFinca && sensor.idParcela === parcela.idParcela);
                    });
                    setSensores(puntoMedicion)
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, []);

    const obtenerParcelasDeFinca = async (idFinca: string) => {
        try {

            const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === parseInt(idFinca));

            setParcelasFiltradas(parcelasFinca);
        } catch (error) {
            console.error('Error al obtener las parcelas de la finca:', error);
        }
    };

    let filteredFincas: Option[] = [];

    filteredFincas = fincas.filter(finca => finca.idEmpresa === userState.idEmpresa);



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
            newErrors.identificadorSensor = 'El identificador es requerido';
        } else if (/^\s/.test(formData.identificadorSensor)) {
            newErrors.identificadorSensor = 'El identificador no puede comenzar con espacios en blanco';
        } else {
            newErrors.identificadorSensor = '';
        }

        // Validar el nombre
        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (/^\s/.test(formData.nombre)) {
            newErrors.nombre = 'El nombre no puede comenzar con espacios en blanco';
        } else {
            newErrors.nombre = '';
        }

        // Validar el modelo
        if (!formData.modelo) {
            newErrors.modelo = 'El modelo es requerido';
        } else if (/^\s/.test(formData.modelo)) {
            newErrors.modelo = 'El modelo no puede comenzar con espacios en blanco';
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
            identificacionUsuario: formData.identificacionUsuario,
            identificadorSensor: formData.identificadorSensor,
            nombre: formData.nombre,
            modelo: formData.modelo,
            idEstado: formData.idEstado,
            idPuntoMedicion: formData.idPuntoMedicion,
        };
        try {
            const resultado = await InsertarSensores(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro Agregado! ',
                    text: 'Registro agregado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar el registro.',
                    text: resultado.mensaje,
                });
            };

            // vuelve a cargar la tabla
            if (onAdd) {
                onAdd();
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

export default InsertarRegistroSensores;
