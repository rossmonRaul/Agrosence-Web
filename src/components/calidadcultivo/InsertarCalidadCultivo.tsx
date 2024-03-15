import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store.ts';
import { AgregarCalidadCultivo } from '../../servicios/ServicioCultivo.ts';

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

const InsertarCalidadCultivo: React.FC<InsertarManejoFertilizanteProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idManejoCalidadCultivo: '',
        fechaCreacion: '',
        cultivo: '',
        hora: '',
        lote: '',
        pesoTotal: '',
        pesoPromedio: '',
        calidad: '',
        observaciones: ''
    });

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idManejoCalidadCultivo: '',
        fechaCreacion: '',
        cultivo: '',
        hora: '',
        lote: '',
        pesoTotal: '',
        pesoPromedio: '',
        calidad: '',
        observaciones: ''
    });


    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const userState = useSelector((store: AppStore) => store.user);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = userState.idEmpresa.toString();
                const identificacionString = userState.identificacion;
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
        obtenerDatosUsuario();
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

    let filteredFincas: Option[] = [];

    filteredFincas = fincas.filter(finca => finca.idEmpresa === userState.idEmpresa);


    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
    };

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

        if (!formData.fechaCreacion.trim()) {
            newErrors.fechaCreacion = 'La fecha es requerida';
        } else {
            // Validar que la fecha esté en el rango desde el 2015 hasta la fecha actual
            const minDate = new Date('2015-01-01');
            const selectedDate = new Date(formData.fechaCreacion);
            if (selectedDate < minDate || selectedDate > new Date()) {
                newErrors.fechaCreacion = 'La fecha debe estar entre 2015 y la fecha actual';
            } else {
                newErrors.fechaCreacion = '';
            }
        }

        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El cultivo es requerido';
        } else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El nombre del cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivo = '';
        }

        if (!formData.hora.trim()) {
            newErrors.hora = 'La hora es requerida';
        } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.hora.trim())) {
            newErrors.hora = 'El formato de la hora debe ser ##:##';
        } else {
            newErrors.hora = '';
        }

        if (!formData.lote) {
            newErrors.lote = 'El número de lote es requerido';
        } else if (!/^\d+$/.test(formData.dosis)) {
            newErrors.lote = 'El número de lote debe de ser un número';
        } else {
            newErrors.lote = '';
        }

        if (!formData.pesoTotal) {
            newErrors.pesoTotal = 'El  peso es requerido';
        } else if (!/^\d+$/.test(formData.dosis)) {
            newErrors.pesoTotal = 'El peso debe de ser un número';
        } else {
            newErrors.pesoTotal = '';
        }

        if (!formData.pesoPromedio) {
            newErrors.pesoPromedio = 'El  peso promedio es requerido';
        } else if (!/^\d+$/.test(formData.dosis)) {
            newErrors.pesoPromedio = 'El peso promedio debe de ser un número';
        } else {
            newErrors.pesoPromedio = '';
        }

        if (!formData.calidad) {
            newErrors.calidad = 'La calidad es requerida';
        } else if (!/^\d+$/.test(formData.calidad)) {
            newErrors.calidad = 'La calidad debe ser un número';
        } else {
            const calidadNumber = parseInt(formData.calidad);
            if (calidadNumber < 0 || calidadNumber > 5) {
                newErrors.calidad = 'La calidad debe ser un número entre 0 y 5';
            } else {
                newErrors.calidad = '';
            }
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las observaciones son requeridas';
        } else if (formData.observaciones.length > 200) {
            newErrors.observaciones = 'Las observaciones no pueden tener más de 200 caracteres';
        } else {
            newErrors.observaciones = '';
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
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idManejoCalidadCultivo: formData.idManejoCalidadCultivo,
            fechaCreacion: formData.fechaCreacion,
            cultivo: formData.cultivo,
            hora: formData.hora,
            lote: formData.lote,
            pesoTotal: formData.pesoTotal,
            pesoPromedio: formData.pesoPromedio,
            calidad: formData.calidad,
            observaciones: formData.observaciones
        };

        try {
            const resultado = await AgregarCalidadCultivo(datos);
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
            if (onAdd) {
                onAdd();
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
                <h2>Calidad de Cultivos</h2>
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
                        <Label for="fechaCreacion" sm={4} className="input-label">Fecha</Label>
                        <Col sm={8}>
                            <Input
                                type="date"
                                id="fechaCreacion"
                                name="fechaCreacion"
                                value={formData.fechaCreacion}
                                onChange={handleInputChange}
                                className={errors.fechaCreacion ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.fechaCreacion}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="cultivo" sm={4} className="input-label">Nombre del Cultivo:</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="cultivo"
                                name="cultivo"
                                value={formData.cultivo}
                                onChange={handleInputChange}
                                className={errors.cultivo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Nombre del Cultivo"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.cultivo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="hora" sm={4} className="input-label">Hora:</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="hora"
                                name="hora"
                                value={formData.hora}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="08:00"
                                maxLength={5}
                            />
                            <FormFeedback>{errors.hora}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="lote" sm={4} className="input-label">Lote:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="dosis"
                                name="dosis"
                                value={formData.lote}
                                onChange={handleInputChange}
                                className={errors.lote ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Número de lote"
                            />
                            <FormFeedback>{errors.lote}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>


                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="pesoTotal" sm={4} className="input-label">Peso Total:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="pesoTotal"
                                name="pesoTotal"
                                value={formData.pesoTotal}
                                onChange={handleInputChange}
                                className={errors.pesoTotal ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Peso Total"
                            />
                            <FormFeedback>{errors.pesoTotal}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>


                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="pesoPromedio" sm={4} className="input-label">Peso Promedio:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="pesoPromedio"
                                name="pesoPromedio"
                                value={formData.pesoPromedio}
                                onChange={handleInputChange}
                                className={errors.pesoPromedio ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Peso Promedio"
                            />
                            <FormFeedback>{errors.pesoPromedio}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="calidad" sm={4} className="input-label">Calidad:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="calidad"
                                name="calidad"
                                value={formData.calidad}
                                onChange={handleInputChange}
                                className={errors.calidad ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0 al 5"
                            />
                            <FormFeedback>{errors.calidad}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>

            <FormGroup row>
                <Label for="observaciones" sm={2} className="input-label">Observaciones</Label>
                <Col sm={10}>
                    <Input
                        type="textarea"
                        id="observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        className="input-styled"
                        style={{ height: '75px', resize: "none" }}
                        placeholder="Observaciones"
                        maxLength={200}

                    />
                    <FormFeedback>{errors.observaciones}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                    <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                </Col>
            </FormGroup>
        </div>
    );
};

export default InsertarCalidadCultivo;
