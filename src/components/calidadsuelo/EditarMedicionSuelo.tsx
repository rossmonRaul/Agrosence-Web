import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ModificarMedicionesSuelo } from "../../servicios/ServicioSuelos.ts";
import '../../css/CrearCuenta.css';

// Interfaz para las propiedades del componente
interface FertilizanteSeleccionado {
    idFinca: number;
    idParcela: number;
    idMedicionesSuelo: number;
    calidadAgua: number;
    conductividadElectrica: number;
    densidadAparente: number;
    desleimiento: number;
    estabilidadAgregados: number;
    infiltracion: number;
    lombrices: number;
    medicionesCalidadSuelo: string;
    nitratosSuelo: number;
    pH: number;
    respiracionSuelo: number;
    observaciones: string;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const EditarMedicionSuelo: React.FC<FertilizanteSeleccionado> = ({
    idFinca,
    idParcela,
    idMedicionesSuelo,
    calidadAgua,
    conductividadElectrica,
    densidadAparente,
    desleimiento,
    estabilidadAgregados,
    infiltracion,
    lombrices,
    medicionesCalidadSuelo,
    nitratosSuelo,
    pH,
    respiracionSuelo,
    observaciones,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');


    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        calidadAgua: '',
        conductividadElectrica: '',
        densidadAparente: '',
        desleimiento: '',
        estabilidadAgregados: '',
        fechaCreacion: '',
        idMedicionesSuelo: '',
        identificacionUsuario: '',
        infiltracion: '',
        lombrices: '',
        medicionesCalidadSuelo: '',
        nitratosSuelo: '',
        observaciones: '',
        pH: '',
        respiracionSuelo: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        idParcela: 0,
        calidadAgua: 0,
        conductividadElectrica: 0,
        densidadAparente: 0,
        desleimiento: 0,
        estabilidadAgregados: 0,
        infiltracion: 0,
        lombrices: 0,
        medicionesCalidadSuelo: '',
        nitratosSuelo: 0,
        observaciones: '',
        pH: 0,
        respiracionSuelo: 0
    });

    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            calidadAgua: calidadAgua,
            conductividadElectrica: conductividadElectrica,
            densidadAparente: densidadAparente,
            desleimiento: desleimiento,
            estabilidadAgregados: estabilidadAgregados,
            idMedicionesSuelo: idMedicionesSuelo,
            infiltracion: infiltracion,
            lombrices: lombrices,
            medicionesCalidadSuelo: medicionesCalidadSuelo,
            nitratosSuelo: nitratosSuelo,
            pH: pH,
            respiracionSuelo: respiracionSuelo,
            observaciones: observaciones
        });
    }, [idMedicionesSuelo]);


    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {

                    const identificacion = identificacionString;
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const fincasResponse = await ObtenerFincas();
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, []);


    useEffect(() => {
        const obtenerParcelasDeFinca = async () => {
            try {
                const parcelasResponse = await ObtenerParcelas();
                const parcelasFinca = parcelasResponse.filter((parcela: any) => parcela.idFinca === parseInt(selectedFinca));
                setParcelas(parcelasFinca);
            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        if (selectedFinca !== '') {
            obtenerParcelasDeFinca();
        }
    }, [selectedFinca]);

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }


    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
    };

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
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

        // if (!formData.fertilizante.trim()) {
        //     newErrors.fertilizante = 'El tipo de fertilizante es requerido';
        // } else if (formData.fertilizante.length > 50) {
        //     newErrors.fertilizante = 'El tipo de fertilizante no puede tener más de 50 caracteres';
        // } else {
        //     newErrors.fertilizante = '';
        // }

        // if (!formData.aplicacion.trim()) {
        //     newErrors.aplicacion = 'El método de aplicación es requerido';
        // } else if (formData.aplicacion.length > 50) {
        //     newErrors.aplicacion = 'El método de aplicación no puede tener más de 50 caracteres';
        // } else {
        //     newErrors.aplicacion = '';
        // }

        // if (!formData.cultivoTratado.trim()) {
        //     newErrors.cultivoTratado = 'El nombre del cultivo es requerido';
        // } else if (formData.cultivoTratado.length > 50) {
        //     newErrors.cultivoTratado = 'El nombre del cultivo no puede tener más de 50 caracteres';
        // } else {
        //     newErrors.cultivoTratado = '';
        // }

        // if (formData.accionesAdicionales.length > 200) {
        //     newErrors.accionesAdicionales = 'Las acciones adicionales no pueden tener más de 200 caracteres';
        // } else {
        //     newErrors.accionesAdicionales = '';
        // }

        // if (formData.condicionesAmbientales.length > 200) {
        //     newErrors.condicionesAmbientales = 'Las condiciones ambientales no pueden tener más de 200 caracteres';
        // } else {
        //     newErrors.condicionesAmbientales = '';
        // }

        // if (formData.observaciones.length > 200) {
        //     newErrors.observaciones = 'Las observaciones no pueden tener más de 200 caracteres';
        // } else {
        //     newErrors.observaciones = '';
        // }

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
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            calidadAgua: formData.calidadAgua,
            conductividadElectrica: formData.conductividadElectrica,
            densidadAparente: formData.densidadAparente,
            desleimiento: formData.desleimiento,
            estabilidadAgregados: formData.estabilidadAgregados,
            idMedicionesSuelo: formData.idMedicionesSuelo,
            infiltracion: formData.infiltracion,
            lombrices: formData.lombrices,
            medicionesCalidadSuelo: formData.medicionesCalidadSuelo,
            nitratosSuelo: formData.nitratosSuelo,
            pH: formData.pH,
            respiracionSuelo: formData.respiracionSuelo,
            observaciones: formData.observaciones
        };

        try {
            const resultado = await ModificarMedicionesSuelo(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Manejo de suelo Actualizado! ',
                    text: 'Manejo de suelo actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el manejo de suelo.',
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
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            {step === 1 && (
                <div>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
                        <h2>Manejo de fertilizantes</h2>
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

                        <FormGroup>
                            <label htmlFor="parcelas">Parcela:</label>
                            <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                                <option key="default-parcela" value="">Seleccione...</option>
                                {filteredParcelas.map((parcela) => (
                                    <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                            <FormGroup row>
                                <Label for="medicionesCalidadSuelo" sm={4} className="input-label">Mediciones de Calidad de suelo</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="medicionesCalidadSuelo"
                                        name="medicionesCalidadSuelo"
                                        value={formData.medicionesCalidadSuelo}
                                        onChange={handleInputChange}
                                        className={errors.fertilizante ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Mediciones de Calidad de suelo"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.fertilizante}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                            <FormGroup row>
                                <Label for="respiracionSuelo" sm={4} className="input-label">Ensayo de respiracion de suelo(mg CO2-C/g)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="respiracionSuelo"
                                        name="respiracionSuelo"
                                        value={formData.respiracionSuelo}
                                        onChange={handleInputChange}
                                        className="input-styled"
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                            <FormGroup row>
                                <Label for="infiltracion" sm={4} className="input-label">Ensayo de infiltración(mm/hora)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="infiltracion"
                                        name="infiltracion"
                                        value={formData.infiltracion}
                                        onChange={handleInputChange}
                                        className={errors.infiltracion ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                    />
                                    <FormFeedback>{errors.infiltracion}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                            <FormGroup row>
                                <Label for="densidadAparente" sm={4} className="input-label">Ensayo de densisdad aparente(g/cm<sup>3</sup>)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="densidadAparente"
                                        name="densidadAparente"
                                        value={formData.densidadAparente}
                                        onChange={handleInputChange}
                                        className={errors.densidadAparente ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.densidadAparente}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                            <FormGroup row>
                                <Label for="conductividadElectrica" sm={4} className="input-label">Ensayo de conductividad electrica(dS/m)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="conductividadElectrica"
                                        name="conductividadElectrica"
                                        value={formData.conductividadElectrica}
                                        onChange={handleInputChange}
                                        className="input-styled"
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                            <FormGroup row>
                                <Label for="pH" sm={4} className="input-label">Ensayo de pH(unidad de pH)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="pH"
                                        name="pH"
                                        value={formData.pH}
                                        onChange={handleInputChange}
                                        className={errors.pH ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                    />
                                    <FormFeedback>{errors.pH}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                    </div>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <h2>Manejo de fertilizantes</h2>

                        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                                <FormGroup row>
                                    <Label for="nitratosSuelo" sm={4} className="input-label">Ensayo de nitratos del suelo(mg/kg)</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="nitratosSuelo"
                                            name="nitratosSuelo"
                                            value={formData.nitratosSuelo}
                                            onChange={handleInputChange}
                                            className={errors.nitratosSuelo ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="0.0"
                                            maxLength={50}
                                        />
                                        <FormFeedback>{errors.nitratosSuelo}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>
                            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                                <FormGroup row>
                                    <Label for="estabilidadAgregados" sm={4} className="input-label">Ensayo de estabilidad de Agregados(%)</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="estabilidadAgregados"
                                            name="estabilidadAgregados"
                                            value={formData.estabilidadAgregados}
                                            onChange={handleInputChange}
                                            className="input-styled"
                                            placeholder="0.0"
                                            maxLength={50}
                                        />
                                    </Col>
                                </FormGroup>
                            </div>
                            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                                <FormGroup row>
                                    <Label for="desleimiento" sm={4} className="input-label">Ensayo de desleimiento(%)</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="desleimiento"
                                            name="desleimiento"
                                            value={formData.desleimiento}
                                            onChange={handleInputChange}
                                            className={errors.desleimiento ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="0.0"
                                        />
                                        <FormFeedback>{errors.desleimiento}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                                <FormGroup row>
                                    <Label for="lombrices" sm={4} className="input-label">Ensayo de lombrices(número de lombrices/m<sup>2</sup>)</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="lombrices"
                                            name="lombrices"
                                            value={formData.lombrices}
                                            onChange={handleInputChange}
                                            className={errors.lombrices ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="0"
                                            maxLength={50}
                                        />
                                        <FormFeedback>{errors.lombrices}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>
                            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                                <FormGroup row>
                                    <Label for="calidadAgua" sm={4} className="input-label">Ensayo de la calidad del agua(mg/L)</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="calidadAgua"
                                            name="calidadAgua"
                                            value={formData.calidadAgua}
                                            onChange={handleInputChange}
                                            className="input-styled"
                                            placeholder="0.0"
                                            maxLength={200}
                                        />
                                        <FormFeedback>{errors.calidadAgua}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>
                        </div>
                        <FormGroup row>
                            <Label for="observaciones" sm={4} className="input-label">Estimaciones y observaciones de fisica del suelo</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="observaciones"
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    className="input-styled"
                                    placeholder="Estimaciones y observaciones de fisica del suelo"
                                    maxLength={200}
                                />
                                <FormFeedback>{errors.observaciones}</FormFeedback>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Col sm={{ size: 10, offset: 2 }}>
                                {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                                <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                                <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                            </Col>
                        </FormGroup>
                    </div>
                </div>
            )}
        </div>
    );

};

export default EditarMedicionSuelo;
