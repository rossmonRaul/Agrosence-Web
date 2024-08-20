import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ModificarRegistroContenidoDeNitrogeno, ObtenerPuntoMedicionFincaParcela } from "../../servicios/ServicioContenidoDeNitrogeno.ts";
import '../../css/CrearCuenta.css';

interface ContenidoDeNitrogenoSeleccionado {
    idFinca: string;
    idParcela: string;
    idContenidoDeNitrogeno: string;
    fechaMuestreo: string,
    contenidoNitrogenoSuelo: string;
    contenidoNitrogenoPlanta: string;
    metodoAnalisis: string;
    humedadObservable: string;
    condicionSuelo: string;
    observaciones: string;
    idPuntoMedicion: string;
    onEdit?: () => void;
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

const ModificacionContenidoDeNitrogeno: React.FC<ContenidoDeNitrogenoSeleccionado> = ({
    idFinca,
    idParcela,
    idContenidoDeNitrogeno,
    fechaMuestreo,
    contenidoNitrogenoSuelo,
    contenidoNitrogenoPlanta,
    metodoAnalisis,
    humedadObservable,
    condicionSuelo,
    observaciones,
    idPuntoMedicion,
    onEdit
}) => {
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setPuntosMedicion] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>(() => idPuntoMedicion ? idPuntoMedicion.toString() : '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idContenidoDeNitrogeno: '',
        fechaMuestreo: '',
        contenidoNitrogenoSuelo: '',
        contenidoNitrogenoPlanta: '',
        metodoAnalisis: '',
        humedadObservable: '',
        condicionSuelo: '',
        observaciones: '',
        idPuntoMedicion: '',
        usuarioCreacionModificacion: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const getCurrentDate = () => {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const dateToUse = fechaMuestreo || getCurrentDate();

        const parts = dateToUse.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const Fecha = `${year}-${month}-${day}`;

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idContenidoDeNitrogeno: idContenidoDeNitrogeno,
            fechaMuestreo: Fecha,
            contenidoNitrogenoSuelo: contenidoNitrogenoSuelo,
            contenidoNitrogenoPlanta: contenidoNitrogenoPlanta,
            metodoAnalisis: metodoAnalisis,
            humedadObservable: humedadObservable,
            condicionSuelo: condicionSuelo,
            observaciones: observaciones,
            idPuntoMedicion: idPuntoMedicion,
        });

        setSelectedPuntoMedicion(idPuntoMedicion);
    }, [idContenidoDeNitrogeno, fechaMuestreo, idFinca, idParcela, idPuntoMedicion, contenidoNitrogenoSuelo, contenidoNitrogenoPlanta, metodoAnalisis, humedadObservable, condicionSuelo, observaciones]);

    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);
                    }
                    const fincaParcelaCargar = {
                        idFinca: idFinca,
                        idParcela: idParcela
                    };

                    const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcelaCargar);
                    setPuntosMedicion(puntosMedicion);
                    
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, [idFinca, idParcela]);

    useEffect(() => {
        const cargarPuntoMedicion = async () => {
            if (idFinca && idParcela) {
                const fincaParcela = {
                    idFinca: idFinca,
                    idParcela: idParcela
                };
                const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
                setPuntosMedicion(puntosMedicion);
                setSelectedPuntoMedicion(idPuntoMedicion);
            }
        };

        cargarPuntoMedicion();
    }, [idFinca, idParcela, idPuntoMedicion]);

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value;
        formData.idParcela = '';
        setSelectedFinca(value);
        setSelectedParcela('');
        setPuntosMedicion([]);
        setSelectedPuntoMedicion('');
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    const handleParcelaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idParcela = value;
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        };
        
        setPuntosMedicion([]);
        setSelectedPuntoMedicion('');
        if (value.length > 0) {
            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
            setPuntosMedicion(puntosMedicion);
        }
    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
    };

    const handleSubmitConValidacion = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!selectedParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }

        if (!selectedPuntoMedicion || selectedPuntoMedicion === "Seleccione...") {
            newErrors.puntoMedicion = 'Debe seleccionar un punto de medición';
        } else {
            newErrors.puntoMedicion = '';
        }

        if (!formData.fechaMuestreo.trim()) {
            newErrors.fechaMuestreo = 'La fecha de muestreo es obligatoria';
        } else {
            const fechaParts = formData.fechaMuestreo.split("-");
            const fechaFormatted = `${fechaParts[0]}-${fechaParts[1]}-${fechaParts[2]}`;
            const fechaDate = new Date(fechaFormatted);
            const today = new Date();
            if (fechaDate > today) {
                newErrors.fechaMuestreo = 'La fecha de muestreo no puede ser mayor a la fecha actual';
            } else {
                newErrors.fechaMuestreo = '';
            }
        }

        if (!formData.contenidoNitrogenoSuelo) {
            newErrors.contenidoNitrogenoSuelo = 'El contenido de nitrógeno en suelo es requerido';
        } else if (isNaN(Number(formData.contenidoNitrogenoSuelo))) {
            newErrors.contenidoNitrogenoSuelo = 'El contenido de nitrógeno en suelo debe ser un número';
        } else {
            newErrors.contenidoNitrogenoSuelo = '';
        }

        if (!formData.contenidoNitrogenoPlanta) {
            newErrors.contenidoNitrogenoPlanta = 'El contenido de nitrógeno en planta es requerido';
        } else if (isNaN(Number(formData.contenidoNitrogenoPlanta))) {
            newErrors.contenidoNitrogenoPlanta = 'El contenido de nitrógeno en planta debe ser un número';
        } else {
            newErrors.contenidoNitrogenoPlanta = '';
        }

        if (!formData.metodoAnalisis.trim()) {
            newErrors.metodoAnalisis = 'El método de análisis es requerido';
        } else if (formData.metodoAnalisis.length > 255) {
            newErrors.metodoAnalisis = 'El método de análisis no puede tener más de 255 caracteres';
        } else {
            newErrors.metodoAnalisis = '';
        }

        if (!formData.humedadObservable.trim()) {
            newErrors.humedadObservable = 'La humedad observable es requerida';
        } else if (formData.humedadObservable.length > 50) {
            newErrors.humedadObservable = 'La humedad observable no puede tener más de 50 caracteres';
        } else {
            newErrors.humedadObservable = '';
        }

        if (!formData.condicionSuelo.trim()) {
            newErrors.condicionSuelo = 'La condición del suelo es requerida';
        } else if (formData.condicionSuelo.length > 50) {
            newErrors.condicionSuelo = 'La condición del suelo no puede tener más de 50 caracteres';
        } else {
            newErrors.condicionSuelo = '';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las observaciones son obligatorias';
        } else if (formData.observaciones.length > 2000) {
            newErrors.observaciones = 'Las observaciones no pueden ser mayor a 2000 caracteres';
        } else {
            newErrors.observaciones = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: 'Por favor complete todos los campos requeridos correctamente.'
            });
        }
    };

    const handleSubmit = async () => {
        const idUsuario = localStorage.getItem('identificacionUsuario');
        let idPuntoMedicionToSend = selectedPuntoMedicion ? parseInt(selectedPuntoMedicion) : formData.idPuntoMedicion;
        let codigoPuntoMedicionToSend = '';

        if (!idPuntoMedicionToSend || isNaN(idPuntoMedicionToSend)) {
            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela({ idFinca: selectedFinca, idParcela: selectedParcela });
            if (puntosMedicion.length > 0) {
                idPuntoMedicionToSend = puntosMedicion[0].idPuntoMedicion;
                codigoPuntoMedicionToSend = puntosMedicion[0].codigo;
            }
        } else {
            const selectedPuntoMedicionOption = puntosMedicion.find(p => p.idPuntoMedicion === idPuntoMedicionToSend);
            if (selectedPuntoMedicionOption) {
                codigoPuntoMedicionToSend = selectedPuntoMedicionOption.codigo;
            }
        }

        const datos = {
            idContenidoDeNitrogeno: parseInt(formData.idContenidoDeNitrogeno),
            idFinca: parseInt(selectedFinca),
            idParcela: parseInt(selectedParcela),
            idPuntoMedicion: idPuntoMedicionToSend,
            codigoPuntoMedicion: codigoPuntoMedicionToSend,
            fechaMuestreo: formData.fechaMuestreo,
            contenidoNitrogenoSuelo: parseFloat(formData.contenidoNitrogenoSuelo),
            contenidoNitrogenoPlanta: parseFloat(formData.contenidoNitrogenoPlanta),
            metodoAnalisis: formData.metodoAnalisis,
            humedadObservable: formData.humedadObservable,
            condicionSuelo: formData.condicionSuelo,
            observaciones: formData.observaciones,
            usuarioCreacionModificacion: idUsuario
        };
        
        try {
            const resultado = await ModificarRegistroContenidoDeNitrogeno(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Contenido de nitrógeno actualizado!',
                    text: 'Contenido de nitrógeno actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el contenido de nitrógeno.',
                    text: resultado.mensaje,
                });
            }

            if (onEdit) {
                onEdit();
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <h2>Contenido de Nitrógeno</h2>
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
                            {filteredParcelas.map((parcela) => (
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
                            {puntosMedicion.length === 0 ? (
                                <option key="default-puntoMedicion" value="">Seleccione...</option>
                            ) : (
                                puntosMedicion.map((puntoMedicion) => (
                                    <option key={`${puntoMedicion.idPuntoMedicion}-${puntoMedicion.codigo || 'undefined'}`} value={puntoMedicion.idPuntoMedicion}>{puntoMedicion.codigo || 'Undefined'}</option>
                                ))
                            )}
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
            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                </Col>
            </FormGroup>
        </div>
    );
};

export default ModificacionContenidoDeNitrogeno;
