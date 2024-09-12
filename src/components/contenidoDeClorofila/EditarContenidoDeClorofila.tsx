import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ModificarRegistroContenidoDeClorofila, ObtenerPuntoMedicionFincaParcela } from "../../servicios/ServicioContenidoDeClorofila.ts";
import '../../css/CrearCuenta.css';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente
interface ContenidoDeClorofilaSeleccionado {
    idFinca: string;
    idParcela: string;
    idContenidoDeClorofila: string;
    cultivo: string;
    fecha: string,
    valorDeClorofila: string;
    idPuntoMedicion: string;
    observaciones: string;
    onEdit?: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
    idPuntoMedicion: number;
    codigo: String;
}

const ModificacionContenidoDeClorofila: React.FC<ContenidoDeClorofilaSeleccionado> = ({
    idFinca,
    idParcela,
    idContenidoDeClorofila,
    cultivo,
    fecha,
    valorDeClorofila,
    idPuntoMedicion,
    observaciones,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setpuntosMedicion] = useState<Option[]>([]);
    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idContenidoDeClorofila: '',
        cultivo: '',
        fecha: '',
        valorDeClorofila: '',
        temperatura: '',
        humedad: '',
        observaciones: '',
        usuarioCreacionModificacion: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idContenidoDeClorofila: '',
        cultivo: '',
        fecha: '',
        valorDeClorofila: 0,
        idPuntoMedicion: 0,
        temperatura: 0,
        humedad: 0,
        observaciones: '',
        usuarioCreacionModificacion: ''
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
        const Fecha = year + '-' + month + '-' + day;

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idContenidoDeClorofila: idContenidoDeClorofila,
            cultivo: cultivo,
            fecha: Fecha,
            valorDeClorofila: valorDeClorofila,
            observaciones: observaciones,
        });
    }, [idContenidoDeClorofila]);


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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    //Se obtienen las fincas 
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    //Se filtran las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtien las parcelas
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    //se filtran las parcelas
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)
                    }
                    const fincaParcelaCargar = {
                        idFinca: idFinca,
                        idParcela: idParcela
                    }

                    const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcelaCargar);

                    setpuntosMedicion(puntosMedicion)
                    setSelectedPuntoMedicion(idPuntoMedicion);
                    
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
        setpuntosMedicion([]);
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
        formData.idParcela = value
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        }
        
        setpuntosMedicion([]);
        setSelectedPuntoMedicion('');
        if (value.length > 0 ) {
            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
            setpuntosMedicion(puntosMedicion)
        }
        
    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
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

        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El cultivo es requerido';
        } else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivo = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.valorDeClorofila) {
            newErrors.valorDeClorofila = 'El valor de clorofila es requerido';
        }else if (parseInt(formData.valorDeClorofila) <= 0) {
            newErrors.valorDeClorofila = 'El valor de clorofila debe ser mayor a 0';
        } else {
            newErrors.valorDeClorofila = '';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las Observaciones son obligatorias';
        } else if (formData.observaciones.length > 2000) {
            newErrors.observaciones = 'Las Observaciones no puede ser mayor a 2000 caracteres';
        } else {
            newErrors.observaciones = '';
        }

        const fechaParts = formData.fecha.split("/");
        const fechaFormatted = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaDate = new Date(fechaFormatted);

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaDate es mayor que hoy
        if (fechaDate > today) {
            newErrors.fecha = 'Fecha no puede ser mayor a hoy';
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
    const formattedDate = formatDate(formData.fecha);

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const idUsuario = localStorage.getItem('identificacionUsuario');
        const datos = {
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idContenidoDeClorofila: formData.idContenidoDeClorofila,
            cultivo: formData.cultivo,
            fecha: formData.fecha,
            valorDeClorofila: formData.valorDeClorofila,
            idPuntoMedicion: selectedPuntoMedicion,
            temperatura: formData.temperatura,
            humedad: formData.humedad,
            observaciones: formData.observaciones,
            usuarioCreacionModificacion: idUsuario

        };

        try {
            const resultado = await ModificarRegistroContenidoDeClorofila(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Contenido de clorofila Actualizado! ',
                    text: 'Contenido de clorofila actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el contenido de clorofila.',
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
                    <FormGroup row>
                        <Label for="cultivo" sm={4} className="input-label">Cultivo</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="cultivo"
                                name="cultivo"
                                value={formData.cultivo}
                                onChange={handleInputChange}
                                className={errors.codigo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="cultivo"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.cultivo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
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
                                className={errors.FechaEntrega ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.fecha}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', width: '100%' }}>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="valorDeClorofila" sm={4} className="input-label">Valor de Clorofila (μmol m<sup>2</sup>)</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="valorDeClorofila"
                                name="valorDeClorofila"
                                value={formData.valorDeClorofila.toString()}
                                onChange={handleInputChange}
                                className={errors.valorDeClorofila ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.valorDeClorofila}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
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
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="observaciones" sm={4} className="input-label">Observaciones</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                className={errors.observaciones ? 'input-styled input-error' : 'input-styled'}
                                style={{ minWidth: '350px' }}
                                placeholder="Observaciones"
                                maxLength={2000}
                            />
                            <FormFeedback>{errors.observaciones}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div className='botonesN'>
                <Button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Actualizar datos</Button>
            </div>
        </div >
    );
};

export default ModificacionContenidoDeClorofila;
