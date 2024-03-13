import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { EditarManejoFertilizantes } from "../../servicios/ServicioFertilizantes.ts";
import '../../css/CrearCuenta.css';

// Interfaz para las propiedades del componente
interface FertilizanteSeleccionado {
    idFinca: number;
    idParcela: number;
    idManejoFertilizantes: number;
    fechaCreacion: string;
    fertilizante: string;
    aplicacion: string;
    dosis: number;
    cultivoTratado: string;
    condicionesAmbientales: string;
    accionesAdicionales: string;
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

const ModificacionManejoFertilizante: React.FC<FertilizanteSeleccionado> = ({
    idFinca,
    idParcela,
    idManejoFertilizantes,
    fechaCreacion,
    fertilizante,
    aplicacion,
    dosis,
    cultivoTratado,
    condicionesAmbientales,
    accionesAdicionales,
    observaciones,
}) => {


    // Imprimir los datos en la consola
    console.log("Datos del Fertilizante Seleccionado:");
    console.log("ID Finca:", idFinca);
    console.log("ID Parcela:", idParcela);
    console.log("ID Manejo Fertilizante:", idManejoFertilizantes);
    console.log("Fecha:", fechaCreacion);
    console.log("Fertilizante:", fertilizante);
    console.log("Aplicación:", aplicacion);
    console.log("Dosis:", dosis);
    console.log("Cultivo Tratado:", cultivoTratado);
    console.log("Condiciones Ambientales:", condicionesAmbientales);
    console.log("Acciones Adicionales:", accionesAdicionales);
    console.log("Observaciones:", observaciones);

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');


    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idManejoFertilizantes: '',
        fechaCreacion: '',
        fertilizante: '',
        aplicacion: '',
        dosis: '',
        cultivoTratado: '',
        condicionesAmbientales: '',
        accionesAdicionales: '',
        observaciones: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idManejoFertilizantes: '',
        fechaCreacion: '',
        fertilizante: '',
        aplicacion: '',
        dosis: '',
        cultivoTratado: '',
        condicionesAmbientales: '',
        accionesAdicionales: '',
        observaciones: ''
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
        // Actualizar el formData cuando las props cambien
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idManejoFertilizantes: idManejoFertilizantes,
            fechaCreacion: fechaCreacion,
            fertilizante: fertilizante,
            aplicacion: aplicacion,
            dosis: dosis,
            cultivoTratado: cultivoTratado,
            condicionesAmbientales: condicionesAmbientales,
            accionesAdicionales: accionesAdicionales,
            observaciones: observaciones
        });
    }, [idManejoFertilizantes]);


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

                    console.log("fincasUsuario");
                    console.log(fincasUsuario);
                    console.log("fincasUsuario");
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

        if (!formData.fertilizante.trim()) {
            newErrors.fertilizante = 'El tipo de fertilizante es requerido';
        } else if (formData.fertilizante.length > 50) {
            newErrors.fertilizante = 'El tipo de fertilizante no puede tener más de 50 caracteres';
        } else {
            newErrors.fertilizante = '';
        }

        if (!formData.aplicacion.trim()) {
            newErrors.aplicacion = 'El método de aplicación es requerido';
        } else if (formData.aplicacion.length > 50) {
            newErrors.aplicacion = 'El método de aplicación no puede tener más de 50 caracteres';
        } else {
            newErrors.aplicacion = '';
        }

        if (!formData.cultivoTratado.trim()) {
            newErrors.cultivoTratado = 'El nombre del cultivo es requerido';
        } else if (formData.cultivoTratado.length > 50) {
            newErrors.cultivoTratado = 'El nombre del cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivoTratado = '';
        }

        if (formData.accionesAdicionales.length > 200) {
            newErrors.accionesAdicionales = 'Las acciones adicionales no pueden tener más de 200 caracteres';
        } else {
            newErrors.accionesAdicionales = '';
        }

        if (formData.condicionesAmbientales.length > 200) {
            newErrors.condicionesAmbientales = 'Las condiciones ambientales no pueden tener más de 200 caracteres';
        } else {
            newErrors.condicionesAmbientales = '';
        }

        if (formData.observaciones.length > 200) {
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

    // Función para formatear la fecha en el formato yyyy-MM-dd
    function formatDate(inputDate: any) {
        const parts = inputDate.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return year + '-' + month + '-' + day;
    }

    // Suponiendo que formData.fechaCreacion contiene la fecha recibida (08/03/2024)
    const formattedDate = formatDate(formData.fechaCreacion);

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idManejoFertilizantes: formData.idManejoFertilizantes,
            fechaCreacion: fechaCreacion,
            fertilizante: formData.fertilizante,
            aplicacion: formData.aplicacion,
            dosis: formData.dosis,
            cultivoTratado: formData.cultivoTratado,
            condicionesAmbientales: formData.condicionesAmbientales,
            accionesAdicionales: formData.accionesAdicionales,
            observaciones: formData.observaciones
        };
        try {
            const resultado = await EditarManejoFertilizantes(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Actualizado! ',
                    text: 'Usuario actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el usuario.',
                    text: resultado.mensaje,
                });
            };
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
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
                        <Label for="fertilizante" sm={4} className="input-label">Fertilizante</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="fertilizante"
                                name="fertilizante"
                                value={formData.fertilizante}
                                onChange={handleInputChange}
                                className={errors.fertilizante ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Tipo de fertilizante"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.fertilizante}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="aplicacion" sm={4} className="input-label">Aplicación</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="aplicacion"
                                name="aplicacion"
                                value={formData.aplicacion}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Método de aplicación"
                                maxLength={50}
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="dosis" sm={4} className="input-label">Dosis</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="dosis"
                                name="dosis"
                                value={formData.dosis}
                                onChange={handleInputChange}
                                className={errors.dosis ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Cantidad de dosis"
                            />
                            <FormFeedback>{errors.dosis}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="cultivoTratado" sm={4} className="input-label">Cultivo Tratado</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="cultivoTratado"
                                name="cultivoTratado"
                                value={formData.cultivoTratado}
                                onChange={handleInputChange}
                                className={errors.cultivoTratado ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Nombre del cultivo"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.cultivoTratado}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="accionesAdicionales" sm={4} className="input-label">Acciones Adicionales</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="accionesAdicionales"
                                name="accionesAdicionales"
                                value={formData.accionesAdicionales}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Acciones adicionales"
                                maxLength={200}
                            />
                            <FormFeedback>{errors.accionesAdicionales}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <FormGroup row>
                <Label for="condicionesAmbientales" sm={2} className="input-label">Condiciones Ambientales</Label>
                <Col sm={10}>
                    <Input
                        type="textarea"
                        id="condicionesAmbientales"
                        name="condicionesAmbientales"
                        value={formData.condicionesAmbientales}
                        onChange={handleInputChange}
                        className="input-styled"
                        style={{ height: '75px', resize: "none" }}
                        placeholder="Descripción de las condiciones ambientales"
                        maxLength={200}
                    />
                    <FormFeedback>{errors.condicionesAmbientales}</FormFeedback>
                </Col>
            </FormGroup>
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

export default ModificacionManejoFertilizante;
