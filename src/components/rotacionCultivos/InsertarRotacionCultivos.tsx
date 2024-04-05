import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { InsertarRotacionCultivoSegunEstacionalidad } from '../../servicios/ServicioCultivo.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';

interface InsertarRotacionCultivosProps {
    onAdd: () => void;
}

interface Props {
    identificacion: string;
    idEmpresa: number;
};

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const InsertarRotacionCultivos: React.FC<InsertarRotacionCultivosProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        identificacionUsuario: localStorage.getItem('identificacionUsuario'),
        idFinca: '',
        idParcela: '',
        epocaSiembra: '',
        tiempoCosecha: '',
        cultivo: '',
        cultivoSiguiente: '',
        epocaSiembraCultivoSiguiente: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');

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
        formData.idFinca = value
        formData.idParcela = ''
        setSelectedFinca(value);
        setSelectedParcela('');
        obtenerParcelasDeFinca(value)
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
    };

    const handleSubmit = async () => {
        // Realizar validación de campos antes de enviar el formulario
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



        // Validar fecha de creación
        if (!formData.epocaSiembra.trim()) {
            newErrors.epocaSiembra = 'La época de siembra es requerida';
        } else {
            newErrors.epocaSiembra = '';
        }
        // Validar tiempo de cosecha
        if (!formData.tiempoCosecha.trim()) {
            newErrors.tiempoCosecha = 'El tiempo de cosecha es requerido';
        } else {
            newErrors.tiempoCosecha = '';
        }

        // Validar cultivo
        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El cultivo es requerido';
        } else if (formData.cultivo.trim().length > 50) {
            newErrors.cultivo = 'El cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivo = '';
        }
        // Convertir las fechas a objetos Date
        const parseDate = (dateString: any) => {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}`);
        };
        const epocaSiembraDate = parseDate(formData.epocaSiembra);
        const epocaSiembraCultivoSiguienteDate = parseDate(formData.epocaSiembraCultivoSiguiente);
        const tiempoCosechaDate = parseDate(formData.tiempoCosecha);

        if (tiempoCosechaDate <= epocaSiembraDate || tiempoCosechaDate >= epocaSiembraCultivoSiguienteDate) {
            newErrors.epocaSiembra = 'El tiempo de cosecha no puede ser anterior a la época de siembra ni tampoco después de la época de siembra siguiente.';
        } else {
            newErrors.epocaSiembra = '';
        }

        if (epocaSiembraCultivoSiguienteDate <= epocaSiembraDate || epocaSiembraCultivoSiguienteDate <= tiempoCosechaDate) {
            newErrors.tiempoCosecha = 'Época de siembra no puede ser anterior a la época de siembra ni tampoco al tiempo de cosecha.';
        } else {
            newErrors.tiempoCosecha = '';
        }

        // Validar cultivo siguiente
        if (!formData.cultivoSiguiente.trim()) {
            newErrors.cultivoSiguiente = 'El cultivo siguiente es requerido';
        } else if (formData.cultivoSiguiente.trim().length > 50) {
            newErrors.cultivoSiguiente = 'El cultivo siguiente no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivoSiguiente = '';
        }
        // Validar época de siembra del cultivo siguiente
        if (!formData.epocaSiembraCultivoSiguiente.trim()) {
            newErrors.epocaSiembraCultivoSiguiente = 'La época de siembra del cultivo siguiente es requerida';
        } else {
            newErrors.epocaSiembraCultivoSiguiente = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;

                const resultado = await InsertarRotacionCultivoSegunEstacionalidad(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Rotación de cultivo insertado!',
                        text: 'Se ha insertado la rotación de cultivo con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar la rotación de cultivo',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la rotación de cultivo:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la rotación de cultivo',
                    text: 'Ocurrió un error al intentar insertar la rotación de cultivo. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
                <h2>Manejo de rotación de cultivos</h2>
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
                        {parcelasFiltradas.map((parcela) => (
                            <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                </FormGroup>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', alignItems: 'center', minWidth: '650px' }}>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="epocaSiembra" sm={4} className="input-label">Época de siembra</Label>
                        <Col sm={8}>
                            <Input
                                type="date"
                                id="epocaSiembra"
                                name="epocaSiembra"
                                value={formData.epocaSiembra}
                                onChange={handleInputChange}
                                className={errors.epocaSiembra ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.epocaSiembra}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="tiempoCosecha" sm={4} className="input-label">Tiempo de cosecha</Label>
                        <Col sm={8}>
                            <Input
                                type="date"
                                id="tiempoCosecha"
                                name="tiempoCosecha"
                                value={formData.tiempoCosecha}
                                onChange={handleInputChange}
                                className={errors.tiempoCosecha ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.tiempoCosecha}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="epocaSiembraCultivoSiguiente" sm={4} className="input-label">Época de siembra siguiente</Label>
                        <Col sm={8}>
                            <Input
                                type="date"
                                id="epocaSiembraCultivoSiguiente"
                                name="epocaSiembraCultivoSiguiente"
                                value={formData.epocaSiembraCultivoSiguiente}
                                onChange={handleInputChange}
                                className={errors.epocaSiembraCultivoSiguiente ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.epocaSiembraCultivoSiguiente}</FormFeedback>
                        </Col>
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
                                className={errors.cultivo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Nombre de cultivo"
                            />
                            <FormFeedback>{errors.cultivo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="cultivoSiguiente" sm={4} className="input-label">Cultivo siguiente</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="cultivoSiguiente"
                                name="cultivoSiguiente"
                                value={formData.cultivoSiguiente}
                                onChange={handleInputChange}
                                className={errors.cultivoSiguiente ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Nombre del siguiente cultivo"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.cultivoSiguiente}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>

            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                    <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                </Col>
            </FormGroup>
        </div>
    );

};

export default InsertarRotacionCultivos;
