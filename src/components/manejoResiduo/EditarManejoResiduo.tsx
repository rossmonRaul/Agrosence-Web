import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ModificarManejoResiduos } from "../../servicios/ServicioResiduo.ts";
import '../../css/CrearCuenta.css';

// Interfaz para las propiedades del componente
interface ResiduoSeleccionado {
    idFinca: number;
    idParcela: number;
    idManejoResiduos: number,
    residuo: string,
    fechaGeneracion: string,
    fechaManejo: string,
    cantidad: number,
    accionManejo: string,
    destinoFinal: string,
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const EditarManejoResiduo: React.FC<ResiduoSeleccionado> = ({
    idFinca,
    idParcela,
    idManejoResiduos,
    residuo,
    fechaGeneracion,
    fechaManejo,
    cantidad,
    accionManejo,
    destinoFinal,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    const [selectedResiduo, setSelectedResiduo] = useState<string>('');


    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idManejoResiduos: '',
        residuo: '',
        fechaGeneracion: '',
        fechaManejo: '',
        cantidad: '',
        accionManejo: '',
        usuarioModificacion: '',
    });

    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        idParcela: 0,
        idManejoResiduos: 0,
        residuo: '',
        fechaGeneracion: '',
        fechaManejo: '',
        cantidad: '',
        accionManejo: '',
        destinoFinal: '',
        usuarioModificacion: '',
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
    const handleResiduoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.residuo = value;
        setSelectedResiduo(value);
    };



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
    }, [setParcelas]);

    //se filtran las parcelas de acuerdo a la finca seleccionada
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

    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        const parts = fechaGeneracion.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const fecha = year + '-' + month + '-' + day;

        const partsManejo = fechaManejo.split('/');
        const dayManejo = partsManejo[0];
        const monthManejo = partsManejo[1];
        const yearManejo = partsManejo[2];
        const fechaManejoForm = yearManejo + '-' + monthManejo + '-' + dayManejo;
        setSelectedResiduo(residuo)
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idManejoResiduos: idManejoResiduos,
            residuo: residuo,
            fechaGeneracion: fecha,
            fechaManejo: fechaManejoForm,
            cantidad: cantidad,
            accionManejo: accionManejo,
            destinoFinal: destinoFinal,
        });

    }, [idManejoResiduos]);

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        if (!formData.idFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!formData.idParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }

        if (!formData.residuo.trim()) {
            newErrors.residuo = 'El residuo es obligatorio';
        } else if (formData.residuo.length > 50) {
            newErrors.residuo = 'El residuo no pueden tener más de 50 caracteres';
        } else {
            newErrors.residuo = '';
        }

        if (!formData.fechaGeneracion.trim()) {
            newErrors.fechaGenerativa = 'La fecha generacion es obligatoria';
        }

        if (!formData.fechaManejo.trim()) {
            newErrors.fechaManejo = 'La fecha de manejo es obligatoria';
        }
        console.log(formData)
        if (!formData.cantidad) {
            newErrors.cantidad = 'La cantidad es obligatoria';
        } else {
            newErrors.cantidad = '';
        }

        if (!formData.accionManejo.trim()) {
            newErrors.accionManejo = 'La accion de manejo es obligatoria';
        } else if (formData.accionManejo.length > 100) {
            newErrors.accionManejo = 'Las acciones de manejo no pueden mas de 100 carateres';
        } else {
            newErrors.accionManejo = '';
        }

        if (!formData.destinoFinal.trim()) {
            newErrors.destinoFinal = 'El destino es obligatorio';
        } else if (formData.destinoFinal.length > 100) {
            newErrors.destinoFinal = 'El destino final no puede ser mayor a 100 caracteres';
        } else {
            newErrors.destinoFinal = '';
        }


        const fechaGenerativaParts = formData.fechaGeneracion.split("/");
        const fechaGenerativaFormatted = `${fechaGenerativaParts[2]}-${fechaGenerativaParts[1]}-${fechaGenerativaParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaGenerativaDate = new Date(fechaGenerativaFormatted);

        const fechaManejoParts = formData.fechaManejo.split("/");
        const fechaManejoFormatted = `${fechaManejoParts[2]}-${fechaManejoParts[1]}-${fechaManejoParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaManejoDate = new Date(fechaManejoFormatted)

        if (fechaGenerativaDate > fechaManejoDate) {
            newErrors.fechaGeneracion = 'Error Fechas Incorrectas';
        }

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaGenerativaDate es mayor que hoy
        if (fechaGenerativaDate > today) {
            newErrors.fechaGeneracion = 'Fecha de Generacion no puede ser mayor a hoy';
        }

        // Verificar si fechaManejoDate es mayor que hoy
        if (fechaManejoDate > today) {
            newErrors.fechaManejo = 'Fecha de Manejo no puede ser mayor a hoy';
        }

        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };
    // Función para manejar el envío del formulario
    const handleSubmit = async () => {


        try {
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idUsuario !== null) {
                formData.usuarioModificacion = idUsuario;
            } else {
                console.error('El valor de identificacionUsuario en localStorage es nulo.');
            }

            const resultado = await ModificarManejoResiduos(formData);

            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Manejo de residuo Actualizado! ',
                    text: 'Manejo de residuo actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el manejo de residuo.',
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
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto' }}>
            {step === 1 && (
                <div>
                    <h2>Manejo de Residuos</h2>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup>
                                <label htmlFor="fincas">Finca:</label>
                                <select className="custom-select input-styled" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
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
                                <select className="custom-select input-styled" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                                    <option key="default-parcela" value="">Seleccione...</option>
                                    {filteredParcelas.map((parcela) => (
                                        <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                    ))}
                                </select>
                                {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                            </FormGroup>
                        </div>
                    </div>

                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                        <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="cantidad" sm={4} className="input-label">Cantidad (kg)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="cantidad"
                                        name="cantidad"
                                        value={formData.cantidad.toString()}
                                        onChange={handleInputChange}
                                        className={errors.cantidad ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.cantidad}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <label htmlFor="residuos">Residuo:</label>
                                <select className="custom-select" id="residuo" value={selectedResiduo} onChange={handleResiduoChange}>
                                    <option key="default-residuo" value="">Seleccione un residuo...</option>
                                    <option key="organicos" value="Organicos">Orgánicos</option>
                                    <option key="inorganicos" value="Inorganicos">Inorgánicos</option>
                                    <option key="peligroso" value="Peligroso">Peligroso</option>
                                    <option key="construccion" value="Construccion">Construcción</option>
                                    <option key="electronicos" value="Electronicos">Electrónicos</option>
                                    <option key="forestales" value="Forestales">Forestales</option>
                                </select>
                                {errors.residuo && <FormFeedback>{errors.residuo}</FormFeedback>}

                            </FormGroup>
                        </div>

                    </div>

                    <div className="row" style={{ display: "flex" }}>
                        <div style={{ flex: 1, marginRight: '10px' }}>
                            <FormGroup row>
                                <Label for="fechaGeneracion" sm={4} className="input-label">Fecha Generativa</Label>
                                <Col sm={8}>
                                    <Input
                                        type="date"
                                        id="fechaGeneracion"
                                        name="fechaGeneracion"
                                        value={formData.fechaGeneracion}
                                        onChange={handleInputChange}
                                        className={errors.fechaGeneracion ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Selecciona una fecha"
                                    />
                                    <FormFeedback>{errors.fechaGeneracion}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1 }}>
                            <FormGroup row>
                                <Label for="fechaManejo" sm={4} className="input-label">Fecha Manejo</Label>
                                <Col sm={8}>
                                    <Input
                                        type="date"
                                        id="fechaManejo"
                                        name="fechaManejo"
                                        value={formData.fechaManejo}
                                        onChange={handleInputChange}
                                        className={errors.fechaManejo ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Selecciona una fecha"
                                    />
                                    <FormFeedback>{errors.fechaManejo}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                    </div>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h2>Manejo de Residuo</h2>
                    <div className="col-sm-4" style={{ marginRight: "40px" }}>
                        <FormGroup row>
                            <Label for="accionManejo" sm={4} className="input-label">Accion del Manejo</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="accionManejo"
                                    name="accionManejo"
                                    value={formData.accionManejo}
                                    onChange={handleInputChange}
                                    className={errors.accionManejo ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="Accion del Manejo"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.accionManejo}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "40px" }}>
                        <FormGroup row>
                            <Label for="destinoFinal" sm={4} className="input-label">Destino Final del Residuo</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="destinoFinal"
                                    name="destinoFinal"
                                    value={formData.destinoFinal}
                                    onChange={handleInputChange}
                                    className={errors.destinoFinal ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="Destino Final"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.accionManejo}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                            <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                            <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                        </Col>
                    </FormGroup>
                </div>

            )}
        </div>
    );
};

export default EditarManejoResiduo;
