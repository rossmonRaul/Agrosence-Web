import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store.ts';
import { InsertarRegistroCondicionesMeteorologicas } from '../../servicios/ServicioClima.ts';
import { convertirHora } from '../../utilities/horaFormat.ts';
interface InsertarManejoFertilizanteProps {
    onAdd: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

interface Temporada {
    nombre: string;
}

const InsertarCondicionesMeteorologicasClimaticas: React.FC<InsertarManejoFertilizanteProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        identificacionUsuario: localStorage.getItem('identificacionUsuario'),
        fecha: '',
        hora: '',
        humedad: '',
        temperatura: '',
        humedadAcumulada: '',
        temperaturaAcumulada: '',
    });

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        fecha: '',
        hora: '',
        humedad: '',
        temperatura: '',
        humedadAcumulada: '',
        temperaturaAcumulada: '',
    });


    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const userState = useSelector((store: AppStore) => store.user);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
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
                    const identificacion = identificacionString;

                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);

                    const fincasResponse = await ObtenerFincas();
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)

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


    //eventos que manejan los cambios de los select de finca, parcela y temporada
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value
        formData.idParcela = ''
        setSelectedFinca(value);
        setSelectedParcela('');
        obtenerParcelasDeFinca(value)
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idParcela = value;
        setSelectedParcela(value);
    };

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        console.log(formData)
        // Validar campos antes de avanzar al siguiente paso
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

        // Validar que se ingrese la fecha
        if (!formData.fecha) {
            newErrors.fecha = 'La fecha es requerida';
        } else {
            newErrors.fecha = '';
        }

        // Validar que se ingrese la hora
        if (!formData.hora) {
            newErrors.hora = 'La hora es requerida';
        } else {
            newErrors.hora = '';
        }

        //Validar la temperatura
        if (!formData.temperatura) {
            newErrors.temperatura = 'La temperatura es requerida';
        } else {
            newErrors.temperatura = '';
        }

        // Validar la humedad
        if (!formData.humedad) {
            newErrors.humedad = 'La humedad es requerida';
        }
        else if (!formData.humedad || !Number.isInteger(Number(formData.humedad))) {
            newErrors.humedad = 'La humedad debe ser un número entero';
        }
        else if (parseInt(formData.humedad) < 0 || parseInt(formData.humedad) > 100) {
            newErrors.humedad = 'La humedad tiene que ser un número entre 0 y 100.';
        }
        else {
            newErrors.humedad = '';
        }

        // Validar que se ingrese la humedad acumulada como número entero
        if (!formData.humedadAcumulada || !Number.isInteger(Number(formData.humedadAcumulada))) {
            newErrors.humedadAcumulada = 'La humedad acumulada debe ser un número entero';
        }
        else if (!formData.humedadAcumulada) {
            newErrors.humedadAcumulada = 'La humedad acumulada es requerida';
        }
        else if (parseInt(formData.humedadAcumulada) < 0) {
            newErrors.humedadAcumulada = 'La humedad acumulada no puede ser un número negativo.';
        }
        else {
            newErrors.humedadAcumulada = '';
        }

        if (!formData.temperaturaAcumulada) {
            newErrors.temperaturaAcumulada = 'La temperatura acumulada es requerida';
        } else {
            newErrors.temperaturaAcumulada = '';
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
            idFinca: formData.idFinca,
            idParcela: formData.idParcela,
            identificacionUsuario: formData.identificacionUsuario,
            fecha: formData.fecha,
            hora: convertirHora(formData.hora),
            humedad: formData.humedad,
            temperatura: formData.temperatura,
            humedadAcumulada: formData.humedadAcumulada,
            temperaturaAcumulada: formData.temperaturaAcumulada,
        };
        try {
            const resultado = await InsertarRegistroCondicionesMeteorologicas(datos);
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
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
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
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="parcelas">Parcela:</label>
                        <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                            <option key="default-parcela" value="">Seleccione...</option>
                            {parcelasFiltradas.map((parcela) => (
                                <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                    </FormGroup>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="fecha" sm={4} className="input-label">Fecha:</Label>
                            <Col sm={8}>
                                <Input
                                    type="date"
                                    id="fecha"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleInputChange}
                                    className={errors.fecha ? 'input-styled input-error' : 'input-styled'}
                                />
                                <FormFeedback>{errors.fecha}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="hora" sm={4} className="input-label">Hora:</Label>
                            <Col sm={8}>
                                <Input
                                    type="time"
                                    id="hora"
                                    name="hora"
                                    value={formData.hora}
                                    onChange={handleInputChange}
                                    className={errors.hora ? 'input-styled input-error' : 'input-styled'}
                                />
                                <FormFeedback>{errors.hora}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="humedad" sm={4} className="input-label">Humedad(%):</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="humedad"
                                    name="humedad"
                                    value={formData.humedad}
                                    onChange={handleInputChange}
                                    className={errors.humedad ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Humedad"
                                />
                                <FormFeedback>{errors.humedad}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="temperatura" sm={4} className="input-label">Temperatura(°C):</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="temperatura"
                                    name="temperatura"
                                    value={formData.temperatura}
                                    onChange={handleInputChange}
                                    className={errors.temperatura ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Temperatura"
                                />
                                <FormFeedback>{errors.temperatura}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="humedadAcumulada" sm={4} className="input-label">Humedad Acumulada(%):</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="humedadAcumulada"
                                    name="humedadAcumulada"
                                    value={formData.humedadAcumulada}
                                    onChange={handleInputChange}
                                    className={errors.humedadAcumulada ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Humedad Acumulada"
                                />
                                <FormFeedback>{errors.humedadAcumulada}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                        <FormGroup row>
                            <Label for="temperaturaAcumulada" sm={4} className="input-label">Temperatura Acumulada(°C):</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="temperaturaAcumulada"
                                    name="temperaturaAcumulada"
                                    value={formData.temperaturaAcumulada}
                                    onChange={handleInputChange}
                                    className={errors.temperaturaAcumulada ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Temperatura Acumulada"
                                />
                                <FormFeedback>{errors.temperaturaAcumulada}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, marginTop: '0.5rem', marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={handleSubmitConValidacion} className="btn-styled btn btn-secondary">Guardar</Button>
                    </Col>
                </FormGroup>
            </div>
        </div>
    );
};

export default InsertarCondicionesMeteorologicasClimaticas;
