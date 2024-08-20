import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
//import { EditarManejoFertilizantes } from "../../servicios/ServicioFertilizantes.ts";
import { ModificarRegistroPuntoMedicion } from "../../servicios/ServicioPuntoMedicion.ts";
import '../../css/CrearCuenta.css';

// Interfaz para las propiedades del componente
interface PuntoMedicionSeleccionado {
    idFinca: number;
    idParcela: number;
    idPuntoMedicion : number;
    codigo: string;
    altitud   : string;
    latitud  : string;
    longitud: string;
   // usuarioCreacionModificacion: string;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const ModificacionPuntoMedicion: React.FC<PuntoMedicionSeleccionado> = ({
    idFinca,
    idParcela,
    idPuntoMedicion,
    codigo,
    altitud,
    latitud,
    longitud,
    //usuarioCreacionModificacion,
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
        idPuntoMedicion: '',
        codigo: '',
        altitud: '',
        latitud: '',
        longitud: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idPuntoMedicion: '',
        codigo: '',
        altitud: '',
        latitud: '',
        longitud: '',
        usuarioCreacionModificacion:''
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
            idPuntoMedicion: idPuntoMedicion,
            codigo: codigo,
            altitud: altitud,
            latitud: latitud,
            longitud: longitud 
        });
    }, [idPuntoMedicion]);


    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
               
                if (identificacionString && idEmpresaString) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresaString));
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresaString));
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
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
        formData.idFinca = value;
        formData.idParcela = "";
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

        if (!formData.codigo.trim()) {
            newErrors.codigo = 'El codigo es requerido';
        } else if (formData.codigo.length > 50) {
            newErrors.codigo = 'El codigo no puede tener más de 50 caracteres';
        } else {
            newErrors.codigo = '';
        }

        if (!formData.altitud) {
            newErrors.altitud = 'La elevación es requerida';
        } else if (!/^\d+(\.\d+)?$/.test(formData.altitud)){
            newErrors.altitud = 'La elevación debe ser un número';
        }else {
            newErrors.altitud = '';
        }


        if (!formData.latitud.trim()) {
            newErrors.latitud = 'La latitud son requeridas';
        } else if (formData.latitud.length > 50) {
            newErrors.latitud = 'La latitud no pueden tener más de 50 caracteres';
        } else {
            newErrors.latitud = '';
        }
  
        if (!formData.longitud.trim()) {
            newErrors.longitud = 'La longitud son requeridas';
        } else if (formData.longitud.length > 50) {
            newErrors.longitud = 'La longitud no pueden tener más de 50 caracteres';
        } else {
            newErrors.longitud = '';
        }
        // Actualizar los errores
        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };

    // Función para formatear la fecha en el formato yyyy-MM-dd

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idPuntoMedicion: formData.idPuntoMedicion,
            codigo: formData.codigo,
            altitud: formData.altitud,
            latitud: formData.latitud,
            longitud: formData.longitud,
            usuarioCreacionModificacion:localStorage.getItem('identificacionUsuario')  
        };
            // console.log("data");
            // console.log(datos);
            // console.log("data");
        try {
            const resultado = await ModificarRegistroPuntoMedicion(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'Punto medición actualizado! ',
                    text: 'Punto medición actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el punto medición.',
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
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <h2>Punto de medición</h2>

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
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                        <Label for="codigo" sm={4} className="input-label">Código</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="codigo"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleInputChange}
                                className={errors.codigo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="código"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.codigo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="altitud" sm={4} className="input-label">Elevación(m s. n. m.)</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="altitud"
                                name="altitud"
                                value={formData.altitud}
                                onChange={handleInputChange}
                                className={errors.altitud ? 'input-styled input-error' : 'input-styled'}
                                placeholder="elevación"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.altitud}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="latitud" sm={4} className="input-label">Latitud</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="latitud"
                                name="latitud"
                                value={formData.latitud}
                                onChange={handleInputChange}
                                className={errors.latitud ? 'input-styled input-error' : 'input-styled'}
                                placeholder="latitud"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.latitud}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="longitud" sm={4} className="input-label">Longitud</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="longitud"
                                name="longitud"
                                value={formData.longitud}
                                onChange={handleInputChange}
                                className={errors.longitud ? 'input-styled input-error' : 'input-styled'}
                                placeholder="longitud"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.longitud}</FormFeedback>
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

export default ModificacionPuntoMedicion;
