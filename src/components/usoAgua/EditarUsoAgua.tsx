import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { EditarRegistroSeguimientoUsoAgua } from '../../servicios/ServicioUsoAgua.ts';

// Interfaz para las propiedades del componente
interface RegistroSeguimientoUsoAguaSeleccionado {
    idFinca: number;
    idParcela: number;
    idRegistroSeguimientoUsoAgua: number;
    fecha: string;
    actividad: string;
    caudal: string;
    consumoAgua: number;
    observaciones: string;
    usuarioModificacion?: string;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const ModificacionRegistroSeguimientoUsoAgua: React.FC<RegistroSeguimientoUsoAguaSeleccionado> = ({
    idFinca,
    idParcela,
    idRegistroSeguimientoUsoAgua,
    fecha,
    actividad,
    caudal,
    consumoAgua,
    observaciones,
    usuarioModificacion,
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
        fecha: '',
        actividad: '',
        caudal: '',
        consumoAgua: '',
        observaciones: '',
        usuarioModificacion: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idRegistroSeguimientoUsoAgua: '',
        fecha: '',
        actividad: '',
        caudal: '',
        consumoAgua: '',
        observaciones: '',
        usuarioModificacion: ''
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
        const parts = fecha.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const fechaUsoAgua = year + '-' + month + '-' + day;
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idRegistroSeguimientoUsoAgua: idRegistroSeguimientoUsoAgua,
            fecha: fechaUsoAgua,
            actividad: actividad,
            caudal: caudal,
            consumoAgua: consumoAgua,
            observaciones: observaciones
        });
    }, [idRegistroSeguimientoUsoAgua]);


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
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);
                    //Se obtienen las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //Se filtran las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtien las parcelas
                    const parcelasResponse = await ObtenerParcelas();
                    //se filtran las parcelas
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, []);

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value
        formData.idParcela = ""
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

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es requerida';
        } else {
            // Validar que la fecha esté en el rango desde el 2015 hasta la fecha actual
            const minDate = new Date('2015-01-01');
            const selectedDate = new Date(formData.fecha);
            if (selectedDate < minDate || selectedDate > new Date()) {
                newErrors.fecha = 'La fecha debe estar entre 2015 y la fecha actual';
            } else {
                newErrors.fecha = '';
            }
        }

        if (!formData.actividad.trim()) {
            newErrors.actividad = 'La actividad es requerida';
        } else if (formData.actividad.length > 50) {
            newErrors.actividad = 'La actividad no puede tener más de 50 caracteres';
        } else {
            newErrors.actividad = '';
        }

        if (!formData.consumoAgua) {
            newErrors.consumoAgua = 'El consumo de agua es requerido';
        } else if (!/^\d+$/.test(formData.consumoAgua)) {
            newErrors.consumoAgua = 'El consumo de agua debe ser un número';
        } else {
            newErrors.consumoAgua = '';
        }

        if (!formData.caudal) {
            newErrors.caudal = 'El caudal es requerido';
        } else if (!/^\d+$/.test(formData.caudal)) {
            newErrors.caudal = 'El caudal debe ser un número';
        } else {
            newErrors.caudal = '';
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
            idRegistroSeguimientoUsoAgua: formData.idRegistroSeguimientoUsoAgua,
            fecha: formData.fecha,
            actividad: formData.actividad,
            caudal: formData.caudal,
            consumoAgua: formData.consumoAgua,
            observaciones: formData.observaciones,
            usuarioModificacion: localStorage.getItem('identificacionUsuario'),
        };

        console.log('datos');
        console.log(datos);
        console.log('datos');

        try {
            const resultado = await EditarRegistroSeguimientoUsoAgua(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro de seguimiento del uso de agua Actualizado! ',
                    text: 'registro de seguimiento del uso de agua con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el registro de seguimiento del uso de agua.',
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
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto' }}>
            <h2>Registro de seguimiento del uso del agua</h2>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                <div style={{ marginRight: '10px', width: '50%' }}>
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
                <div style={{ marginRight: '0px', width: '50%' }}>
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
                    <FormGroup row>
                        <Label for="fecha" sm={4} className="input-label">Fecha</Label>
                        <Col sm={8}>
                            <Input
                                type="date"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                className={errors.fecha ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.fecha}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="actividad" sm={4} className="input-label">Actividad</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="actividad"
                                name="actividad"
                                value={formData.actividad}
                                onChange={handleInputChange}
                                className={errors.actividad ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Actividad"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.actividad}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="caudal" sm={4} className="input-label">Caudal(L/s)</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="caudal"
                                name="caudal"
                                value={formData.caudal}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Caudal"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.caudal}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="consumoAgua" sm={4} className="input-label">Consumo de agua(m3)</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="consumoAgua"
                                name="consumoAgua"
                                value={formData.consumoAgua}
                                onChange={handleInputChange}
                                className={errors.consumoAgua ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Consumo de agua"
                            />
                            <FormFeedback>{errors.consumoAgua}</FormFeedback>
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
        </div >
    );
};

export default ModificacionRegistroSeguimientoUsoAgua;