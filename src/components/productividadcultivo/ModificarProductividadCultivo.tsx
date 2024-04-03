import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store.ts';
import { EditarProductividadCultivo } from '../../servicios/ServicioCultivo.ts';

// Interfaz para las propiedades del componente
interface Props {
    idFinca: number;
    idParcela: number;
    idManejoProductividadCultivo: number;
    cultivo: string;
    temporada: string;
    area: number;
    produccion: number;
    productividad: number;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
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
const ModificarCalidadCultivo: React.FC<Props> = ({
    idFinca,
    idParcela,
    idManejoProductividadCultivo,
    cultivo,
    temporada,
    area,
    produccion,
    productividad,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    useEffect(() => {
        setTemporadas([
            { nombre: 'Lluviosa' },
            { nombre: 'Seca' }
        ]);
    }, []);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const userState = useSelector((store: AppStore) => store.user);
    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [selectedTemporada, setSelectedTemporada] = useState<string>(() => temporada ? temporada.toString() : '');

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idManejoProductividadCultivo: '',
        cultivo: '',
        temporada: '',
        area: '',
        produccion: '',
        productividad: ''
    });

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idManejoProductividadCultivo: '',
        cultivo: '',
        temporada: '',
        area: '',
        produccion: '',
        productividad: ''
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
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idManejoProductividadCultivo: idManejoProductividadCultivo,
            cultivo: cultivo,
            temporada: temporada,
            area: area,
            produccion: produccion,
            productividad: productividad
        });
    }, [idManejoProductividadCultivo]);

    

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
        obtenerFincas();
    }, [setParcelas]);


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
        formData.idParcela = value
        setSelectedParcela(value);
    };

    const handleTemporadaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedTemporada(value);
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

        // Validar selección de temporada
        if (!selectedTemporada) {
            newErrors.temporada = 'Debe seleccionar una temporada';
        } else {
            newErrors.temporada = '';
        }

        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El cultivo es requerido';
        } else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El nombre del cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivo = '';
        }

        if (!formData.area) {
            newErrors.area = 'El área es requerida';
        } else {
            newErrors.area = '';
        }

        if (!formData.produccion) {
            newErrors.produccion = 'La produccion es requerida';
        } else {
            newErrors.produccion = '';
        }

        if (!formData.productividad) {
            newErrors.productividad = 'La productividad es requerida';
        } else {
            newErrors.productividad = '';
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
            IdFinca: selectedFinca,
            IdParcela: selectedParcela,
            IdManejoProductividadCultivo: idManejoProductividadCultivo,
            Cultivo: formData.cultivo,
            Temporada: selectedTemporada,
            Area: formData.area,
            Produccion: formData.produccion,
            Productividad: formData.productividad,
            Usuario: userState.identificacion
        };

        try {
            const resultado = await EditarProductividadCultivo(datos);
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
            if (onEdit) {
                onEdit();
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handleInputBlur = (fieldName: string) => {
        // Eliminar el mensaje de error para el campo cuando el identificacion comienza a escribir en él
        if (errors[fieldName]) {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                [fieldName]: ''
            }));
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <h2>Productividad de Cultivos</h2>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '60%', marginLeft: '0.5rem' }}>

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

                <FormGroup>
                    <label htmlFor="temporadas">Temporada:</label>
                    <select className="custom-select" id="temporadas" value={selectedTemporada} onChange={handleTemporadaChange}>
                        <option key="default-temporada" value="">Seleccione...</option>
                        {temporadas.map((temporada) => (
                            <option key={`${temporada.nombre}}-${temporada.nombre || 'undefined'}`} value={temporada.nombre}>{temporada.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.temporada && <FormFeedback>{errors.temporada}</FormFeedback>}
                </FormGroup>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>

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
                                onBlur={() => handleInputBlur('cultivo')}
                                placeholder="Nombre del Cultivo"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.cultivo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="area" sm={4} className="input-label">Área (ha):</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="area"
                                name="area"
                                value={formData.area}
                                onChange={handleInputChange}
                                onBlur={() => handleInputBlur('area')}
                                className={errors.area ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Número de lote"
                            />
                            <FormFeedback>{errors.area}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="produccion" sm={4} className="input-label">Produccion (ton):</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="produccion"
                                name="produccion"
                                value={formData.produccion}
                                onChange={handleInputChange}
                                onBlur={() => handleInputBlur('produccion')}
                                className={errors.produccion ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Produccion"
                            />
                            <FormFeedback>{errors.produccion}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>


                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="productividad" sm={4} className="input-label">Productividad:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="productividad"
                                name="productividad"
                                value={formData.productividad}
                                onChange={handleInputChange}
                                onBlur={() => handleInputBlur('productividad')}
                                className={errors.productividad ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Productividad"
                            />
                            <FormFeedback>{errors.productividad}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>

            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                    <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                </Col>
            </FormGroup>
        </div>
    );

};

export default ModificarCalidadCultivo;
