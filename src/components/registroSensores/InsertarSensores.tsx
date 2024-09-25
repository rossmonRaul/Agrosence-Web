import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store.ts';
import { InsertarSensores, InsertarMedicionAutorizadaSensor, ObtenerEstadoSensores } from '../../servicios/ServicioSensor.ts';
import { ObtenerRegistroPuntoMedicion } from '../../servicios/ServicioPuntoMedicion.ts';
import { ObtenerMedicionesSensor } from '../../servicios/ServicioMedicionesSensor.ts';
import { IoSave, IoArrowForward, IoArrowBack } from 'react-icons/io5';

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
    idMedicion: number;
    nomenclatura: string;
}


const InsertarRegistroSensores: React.FC<InsertarManejoFertilizanteProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState<any>({
        identificacionUsuario: localStorage.getItem('identificacionUsuario'),
        identificadorSensor: '',
        nombre: '',
        modelo: '',
        idEstado: '',
        idPuntoMedicion: '',
        medicionAutorizadaSensor: ''
    });



    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        identificadorSensor: '',
        nombre: '',
        modelo: '',
        idEstado: '',
        idPuntoMedicion: '',
        medicionAutorizadaSensor: ''
    });


    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [inputs, setInputs] = useState(['']);
    const [selectedEstadoSensor, setSelectedEstadoSensor] = useState<string>('');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');

    const userState = useSelector((store: AppStore) => store.user);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [estadoSensor, setEstadoSensor] = useState<Option[]>([]);
    const [medicionesSensor, setMedicionesSensor] = useState<Option[]>([]);

    const [sensores, setSensores] = useState<Option[]>([]);
    const [step, setStep] = useState(1);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleInputsChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newInputs = [...inputs];
        const newValue = event.target.value;
        const newErrors: Record<string, string> = {};

        // Verificar si el valor ya existe en los inputs anteriores
        const isDuplicate = newInputs.slice(0, index).some((input) => input === newValue);

        if (!isDuplicate) {
            newInputs[index] = newValue;
            setInputs(newInputs);
            newErrors.medicionAutorizadaSensor = ''
        } else {
            newErrors.medicionAutorizadaSensor = 'Este valor ya ha sido seleccionado anteriormente.';
        }
        setErrors(newErrors);
    };
    const handleAddInput = () => {
        if (inputs[inputs.length - 1].trim() !== '') {
            setInputs([...inputs, '']);
        }
    };

    const handleRemoveInput = (index: number) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };
    const handleNextStep = () => {
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
            setStep(prevStep => prevStep + 1);
        }
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
                    }
                    const medicionesSensor = await ObtenerMedicionesSensor()
                    setMedicionesSensor(medicionesSensor);
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
        const values = [...inputs];
        // Validar el nombre
        if (!values) {
            newErrors.medicionAutorizadaSensor = 'Medicion autorizada del sensor requerida';
        } else if (/^\s*$/.test(values[0])) {
            newErrors.medicionAutorizadaSensor = 'No puede estar vacío o contener solo espacios';
        } else if (inputs.length > 1) {
            for (let i = 1; i < inputs.length; i++) {
                if (inputs[i].trim() === '') {
                    newErrors.medicionAutorizadaSensor = 'Este campo no puede estar vacío';
                }
            }
        } else {
            newErrors.medicionAutorizadaSensor = '';
        }
        // Validar que todos los inputs tengan contenido si hay más de uno







        // Actualizar los errores
        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };


    // Función para manejar el envío del formulario
    const handleSubmit = async () => {

        const inputsData = inputs.join(';');
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
                const medicionAutorizada = {
                    idSensor: parseInt(resultado.mensaje),
                    medicionAutorizadaSensor: inputsData
                }
                const resultadoMediciones = await InsertarMedicionAutorizadaSensor(medicionAutorizada);
                if (resultadoMediciones.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro Agregado! ',
                        text: 'Registro agregado con éxito.',
                    });
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al agregar los registros de mediciones autorizadas.',
                        text: resultado.mensaje,
                    });
                };

            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar el registro.',
                    text: "Error al ingresar los datos",
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
            {step === 1 && (
                <div>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '0.5rem' }}>

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
                            <FormGroup>
                                <label htmlFor="estados">Estado de sensor:</label>
                                <select className="custom-select" id="estados" value={selectedEstadoSensor} onChange={handleEstadoSensorChange} style={{height:'44px'}}>
                                    <option key="default-sensor" value="">Seleccione...</option>
                                    {estadoSensor.map((sensor) => (
                                        <option key={`${sensor.idEstado}-${sensor.estado || 'undefined'}`} value={sensor.idEstado}>{sensor.estado || 'Undefined'}</option>
                                    ))}
                                </select>
                                {errors.idEstado && <FormFeedback>{errors.idEstado}</FormFeedback>}
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem'}}>
                            <FormGroup>
                                <label htmlFor="puntoMedicion">Punto medición:</label>
                                <select className="custom-select" id="puntoMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange}style={{height:'44px'}}>
                                    <option key="default-punto-medicion" value="">Seleccione...</option>
                                    {sensores.map((sensor: any) => (
                                        <option key={`${sensor.idPuntoMedicion}-${sensor.codigo || 'undefined'}`} value={sensor.idPuntoMedicion}>{sensor.codigo || 'Undefined'}</option>
                                    ))}
                                </select>
                                {errors.idPuntoMedicion && <FormFeedback>{errors.idPuntoMedicion}</FormFeedback>}
                            </FormGroup>
                        </div>

                        </div>
                    </div>

                    <div style={{ flex: 1, marginTop: '0.5rem', marginRight: '0.5rem', marginLeft: '0.5rem' }}>



                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem', width:'100%'  }}>
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
                                            style={{ width:'100%'}}
                                        />
                                        <FormFeedback>{errors.identificadorSensor}</FormFeedback>
                                    </Col>
                                </FormGroup>

                            </div>
                        <div className='botonesN' style={{display:'flex', justifyContent:'end', marginLeft:'30px'}}>
                            <button onClick={handleNextStep} className="btn-styled" style={{width:'47.5%'}}>Siguiente<IoArrowForward size={20} style={{marginLeft: '1%'}}/></button>
                        </div>                        
                    </div>
                </div>
            )}
            {step === 2 && (
                <div>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '0.5rem' }}>
                        <label htmlFor="" style={{fontSize: '18px', padding: '10px'}}>Mediciones autorizadas del sensor</label>
                        <div style={{ overflow: 'auto', maxHeight: '200px', padding: '10px', marginBottom: '20px' }}>
                            {inputs.map((input, index) => (
                                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '20px', gap: '0.5rem' }} key={index}>
                                    <select
                                        value={input}
                                        onChange={(e) => handleInputsChange(index, e)}
                                        style={{ width: '100%', padding: '5px', borderRadius: '5px', height: '40px', border: '1px solid #ccc', fontSize: '16px' }}
                                    >
                                        <option value="">Seleccione...</option>
                                        {medicionesSensor.map((medicion) => (
                                            <option key={medicion.idMedicion} value={medicion.idMedicion}>{medicion.nombre + ' (' + medicion.nomenclatura + ')'}</option>
                                        ))}
                                    </select>
                                    {index !== 0 && (
                                        <Button className="btn btn-danger" onClick={() => handleRemoveInput(index)}> X </Button>
                                    )}
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button className='btn-styled-light' onClick={handleAddInput}> + </Button>
                            </div>
                        </div>
                        {errors.medicionAutorizadaSensor && <FormFeedback>{errors.medicionAutorizadaSensor}</FormFeedback>}
                        <div className='botones'>
                            <button onClick={handlePreviousStep} className='btn-styled-danger'><IoArrowBack size={20} style={{marginRight: '5%'}}/>Anterior</button>
                            <Button onClick={handleSubmitConValidacion} className="btn-styled btn btn-secondary"><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</Button>                                
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default InsertarRegistroSensores;
