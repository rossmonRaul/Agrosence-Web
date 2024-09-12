import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { InsertarRegistroContenidoDeNitrogeno, ObtenerPuntoMedicionFincaParcela } from '../../servicios/ServicioContenidoDeNitrogeno.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { IoSave } from 'react-icons/io5';

interface InsertarContenidoDeNitrogenoProps {
    onAdd: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
    idPuntoMedicion: number;
    codigo: string;
}

const InsertarContenidoDeNitrogeno: React.FC<InsertarContenidoDeNitrogenoProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        idPuntoMedicion: '',
        codigoPuntoMedicion: '',
        fechaMuestreo: '',
        contenidoNitrogenoSuelo: '',
        contenidoNitrogenoPlanta: '',
        metodoAnalisis: '',
        humedadObservable: '',
        condicionSuelo: '',
        observaciones: '',
        usuarioCreacionModificacion: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setPuntosMedicion] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
                    }
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

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
        setSelectedPuntoMedicion('');
        obtenerParcelasDeFinca(value);
    };

    const handleParcelaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        };
        const puntosMedicionResponse = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
        if (Array.isArray(puntosMedicionResponse)) {
            setPuntosMedicion(puntosMedicionResponse);
        } else {
            setPuntosMedicion([]);
        }
    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        if (!selectedFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        }

        if (!selectedParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        }

        if (!selectedPuntoMedicion) {
            newErrors.puntoMedicion = 'Debe seleccionar un punto de medición';
        }

        if (!formData.fechaMuestreo.trim()) {
            newErrors.fechaMuestreo = 'La fecha de muestreo es obligatoria';
        }

        if (!formData.contenidoNitrogenoSuelo) {
            newErrors.contenidoNitrogenoSuelo = 'El contenido de nitrógeno en suelo es requerido';
        }

        if (!formData.contenidoNitrogenoPlanta) {
            newErrors.contenidoNitrogenoPlanta = 'El contenido de nitrógeno en planta es requerido';
        }

        if (!formData.metodoAnalisis.trim()) {
            newErrors.metodoAnalisis = 'El método de análisis es requerido';
        } else if (formData.metodoAnalisis.length > 255) {
            newErrors.metodoAnalisis = 'El método de análisis no puede tener más de 255 caracteres';
        }

        if (!formData.humedadObservable.trim()) {
            newErrors.humedadObservable = 'La humedad observable es requerida';
        } else if (formData.humedadObservable.length > 50) {
            newErrors.humedadObservable = 'La humedad observable no puede tener más de 50 caracteres';
        }

        if (!formData.condicionSuelo.trim()) {
            newErrors.condicionSuelo = 'La condición del suelo es requerida';
        } else if (formData.condicionSuelo.length > 50) {
            newErrors.condicionSuelo = 'La condición del suelo no puede tener más de 50 caracteres';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las observaciones son obligatorias';
        } else if (formData.observaciones.length > 2000) {
            newErrors.observaciones = 'Las observaciones no pueden ser mayor a 2000 caracteres';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;
                formData.idPuntoMedicion = selectedPuntoMedicion;

                // Obtener la hora actual y agregarla a la fecha de muestreo
                const fechaMuestreo = new Date(formData.fechaMuestreo);
                const now = new Date();
                fechaMuestreo.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                // Convertir la fecha de muestreo al formato yyyy-MM-dd
                const year = fechaMuestreo.getFullYear();
                const month = String(fechaMuestreo.getMonth() + 1).padStart(2, '0');
                const day = String(fechaMuestreo.getDate()).padStart(2, '0');
                const fechaMuestreoConHora = fechaMuestreo.toISOString();

                // Asignar la fecha de muestreo solo con yyyy-MM-dd al formData
                formData.fechaMuestreo = `${year}-${month}-${day}`;

                const resultado = await InsertarRegistroContenidoDeNitrogeno({ ...formData, fechaMuestreoConHora });
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro de contenido de nitrógeno insertado!',
                        text: 'Se ha insertado el contenido de nitrógeno con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el contenido de nitrógeno',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el contenido de nitrógeno:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el contenido de nitrógeno',
                    text: 'Ocurrió un error al intentar insertar el contenido de nitrógeno. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
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
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="puntosMedicion">Punto de medición:</label>
                        <select className="custom-select" id="puntosMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange}>
                            <option key="default-puntoMedicion" value="">Seleccione...</option>
                            {puntosMedicion.map((puntoMedicion) => (
                                <option key={`${puntoMedicion.idPuntoMedicion}-${puntoMedicion.codigo || 'undefined'}`} value={puntoMedicion.idPuntoMedicion}>{puntoMedicion.codigo || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.puntoMedicion && <FormFeedback>{errors.puntoMedicion}</FormFeedback>}
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="fechaMuestreo" sm={4} className="input-label">Fecha de Muestreo</Label>
                        <Col sm={8}>
                            <Input
                                type="date"
                                id="fechaMuestreo"
                                name="fechaMuestreo"
                                value={formData.fechaMuestreo}
                                onChange={handleInputChange}
                                className={errors.fechaMuestreo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.fechaMuestreo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', width: '100%' }}>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="contenidoNitrogenoSuelo" sm={4} className="input-label">Contenido de Nitrógeno en Suelo (%)</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="contenidoNitrogenoSuelo"
                                name="contenidoNitrogenoSuelo"
                                value={formData.contenidoNitrogenoSuelo}
                                onChange={handleInputChange}
                                className={errors.contenidoNitrogenoSuelo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.contenidoNitrogenoSuelo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="contenidoNitrogenoPlanta" sm={4} className="input-label">Contenido de Nitrógeno en Planta (%)</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="contenidoNitrogenoPlanta"
                                name="contenidoNitrogenoPlanta"
                                value={formData.contenidoNitrogenoPlanta}
                                onChange={handleInputChange}
                                className={errors.contenidoNitrogenoPlanta ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.contenidoNitrogenoPlanta}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="metodoAnalisis" sm={4} className="input-label">Método de Análisis</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="metodoAnalisis"
                                name="metodoAnalisis"
                                value={formData.metodoAnalisis}
                                onChange={handleInputChange}
                                className={errors.metodoAnalisis ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Método de Análisis"
                                maxLength={255}
                            />
                            <FormFeedback>{errors.metodoAnalisis}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="humedadObservable" sm={4} className="input-label">Humedad Observable</Label>
                        <Col sm={8}>
                            <Input
                                type="select"
                                id="humedadObservable"
                                name="humedadObservable"
                                value={formData.humedadObservable}
                                onChange={handleInputChange}
                                className={errors.humedadObservable ? 'input-styled input-error' : 'input-styled'}
                            >
                                <option value="">Seleccione...</option>
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="baja">Baja</option>
                            </Input>
                            <FormFeedback>{errors.humedadObservable}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="condicionSuelo" sm={4} className="input-label">Condición del Suelo</Label>
                        <Col sm={8}>
                            <Input
                                type="select"
                                id="condicionSuelo"
                                name="condicionSuelo"
                                value={formData.condicionSuelo}
                                onChange={handleInputChange}
                                className={errors.condicionSuelo ? 'input-styled input-error' : 'input-styled'}
                            >
                                <option value="">Seleccione...</option>
                                <option value="compacto">Compacto</option>
                                <option value="suelto">Suelto</option>
                                <option value="erosionado">Erosionado</option>
                            </Input>
                            <FormFeedback>{errors.condicionSuelo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="observaciones" sm={4} className="input-label">Observaciones</Label>
                        <Col sm={8}>
                            <Input
                                type="textarea"
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                className={errors.observaciones ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Observaciones"
                                maxLength={2000}
                            />
                            <FormFeedback>{errors.observaciones}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div className='botonesN'>
                <Button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '1%'}}/>Guardar</Button>
            </div>
        </div>
    );
};

export default InsertarContenidoDeNitrogeno;
