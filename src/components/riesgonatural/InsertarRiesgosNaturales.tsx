import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/ManejoResiduos.css';
import '../../css/DropZoneComponent.css';
import { InsertarDocumentacionRiesgoNatural, InsertarRiesgoNatural } from '../../servicios/ServicioRiesgoNatural.ts';


interface CrearRiesgosNaturalesProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}


const CrearRiesgosNaturales: React.FC<CrearRiesgosNaturalesProps> = ({ onAdd }) => {

    const [files, setFiles] = useState<File[]>([]);

    const DropZoneComponent = () => {


        const onDrop = useCallback((acceptedFiles: File[]) => {
            
            // Validar que no se exceda el límite de 5 archivos
            if (files.length + acceptedFiles.length > 5) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se puede ingresar más de 5 archivos'
                });
                return;
            }
            const newFiles: { file: File; }[] = [];
            acceptedFiles.forEach(file => {
                // Validar el tamaño del archivo (máximo 5 MB)
                if (file.size > 5 * 1024 * 1024) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'El tamaño del archivo no debe exceder los 5 MB'
                    });
                    return;
                }
                let fileName = file.name;
                let index = 1;
                while (files.some(fileObj => fileObj.name === fileName)) {
                    const parts = file.name.split('.');
                    const name = parts.slice(0, -1).join('.');
                    const extension = parts[parts.length - 1];
                    fileName = `${name}(${index}).${extension}`;
                    index++;

                }
                const renamedFile = new File([file], fileName); // Crear un nuevo objeto de archivo con el nombre modificado
                newFiles.push({ file: renamedFile });
            });
            const addNewFiles = [...files, ...newFiles.map(({ file }) => file)];
            setFiles(addNewFiles);
        }, [files]);

        const handleRemoveFile = (indexToRemove: number) => {
            const newFiles = files.filter((_, index) => index !== indexToRemove);
            setFiles(newFiles);
        };

        const { getRootProps, getInputProps } = useDropzone({
            onDrop,
            accept: {
                'image/*': [],  // Permite todos los tipos de imagen
                'video/*': []   // Permite todos los tipos de video
            }
        });

        return (
            <div>
                <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    {
                        <p>Arrastra y suelta los archivos aquí.</p>
                    }
                </div>
                <div className="file-list">
                    {files.map((_, index) => (
                        <div className="file-item" key={index}>
                            <span>{files[index].name.length > 30 ? files[index].name.substring(0, 30) + '...' : files[index].name}</span>
                            <button className='button' onClick={(event) => { event.stopPropagation(); handleRemoveFile(index); }}>X</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        fecha: '',
        riesgoNatural: '',
        practicaPreventiva: '',
        responsable: '',
        resultadoPractica: '',
        accionesCorrectivas: '',
        observaciones: '',
        usuarioCreacionModificacion: ''

    });

    const [formDataDocument] = useState({
        idRiesgoNatural: '',
        Documento: '',
        NombreDocumento: '',
        usuarioCreacionModificacion: ''

    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [selectedRiesgo, setSelectedRiesgo] = useState<string>('');
    const [selectedResultadoPractica, setSelectedResultadoPractica] = useState<string>('');
    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };


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
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas();
                    //se filtran las parcelas con los idparcelasusuario
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
    //funcion para poder filtrar las parcelas de acuerdo al idFinca que se selecciona
    const obtenerParcelasDeFinca = async (idFinca: string) => {
        try {

            const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === parseInt(idFinca));
            //se asigna las parcelas de la IdFinca que se selecciona y se pone en parcelasfiltradas
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
        formData.idParcela = value;
        setSelectedParcela(value);
    };

    const handleRiesgoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.riesgoNatural = value;
        setSelectedRiesgo(value);
    };

    const handleResultadoPracticaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.resultadoPractica = value;
        setSelectedResultadoPractica(value);
    };

    const handleSubmit = async () => {
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

        if (!formData.riesgoNatural.trim()) {
            newErrors.riesgoNatural = 'El Riesgo Natural es obligatorio';
        } else {
            newErrors.riesgoNatural = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.practicaPreventiva) {
            newErrors.practicaPreventiva = 'La Practica Preventiva es obligatoria';
        } else {
            newErrors.practicaPreventiva = '';
        }

        if (!formData.responsable.trim()) {
            newErrors.responsable = 'El responsable es obligatoria';
        } else if (formData.responsable.length > 100) {
            newErrors.responsable = 'El responsable no pueden mas de 100 carateres';
        } else {
            newErrors.responsable = '';
        }

        if (!formData.resultadoPractica.trim()) {
            newErrors.resultadoPractica = 'El Resultado Practica es obligatorio';
        }else {
            newErrors.resultadoPractica = '';
        }

        if (!formData.accionesCorrectivas.trim()) {
            newErrors.accionesCorrectivas = 'Las Acciones Correctivas son obligatorias';
        } else if (formData.accionesCorrectivas.length > 250) {
            newErrors.accionesCorrectivas = 'Las Acciones Correctivas no pueden ser más de 250 carateres';
        } else {
            newErrors.accionesCorrectivas = '';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las Observaciones son obligatorias';
        } else if (formData.observaciones.length > 250) {
            newErrors.observaciones = 'Las Observaciones no puede ser mayor a 250 caracteres';
        } else {
            newErrors.observaciones = '';
        }

        const fechaParts = formData.fecha.split("/");
        const fechaFormatted = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
        const fechaDate = new Date(fechaFormatted);

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaGenerativaDate es mayor que hoy
        if (fechaDate > today) {
            newErrors.fecha = 'Fecha no puede ser mayor a hoy';
        }


        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {

                    formData.usuarioCreacionModificacion = idUsuario;
                    formDataDocument.usuarioCreacionModificacion = idUsuario
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                const resultado = await InsertarRiesgoNatural(formData);

                let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

                if (resultado.indicador === 1) {

                    formDataDocument.idRiesgoNatural = resultado.mensaje

                    for (let documento of files) {
                        const reader = new FileReader();

                        reader.onload = async () => {
                            // Convierte el resultado a una cadena base64
                            const contenidoArchivo = reader.result;
                            formDataDocument.NombreDocumento = documento.name;

                            formDataDocument.Documento = contenidoArchivo as string;


                            const resultadoDocumento = await InsertarDocumentacionRiesgoNatural(formDataDocument)

                            if (resultadoDocumento.indicador !== 1) {
                                errorEnviandoArchivos = true; // Marcar que hubo un error
                            }
                        };

                        reader.readAsDataURL(documento); // Lee el archivo como una URL de datos
                    }

                    if (errorEnviandoArchivos) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al insertar uno o varios documentos',
                            text: resultado.message
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro insertado!',
                            text: 'Se ha insertado un registro de riesgos naturales'
                        });
                        if (onAdd) {
                            onAdd();
                        }
                    }


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el registro de riesgos naturales',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el riesgo natural:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el riesgo natural',
                    text: 'Ocurrió un error al intentar insertar el riesgo natural.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: '650px' }}>
            {step === 1 && (
                <div>
                    <h2>Riesgos Naturales</h2>
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
                                    {parcelasFiltradas.map((parcela) => (

                                        <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                    ))}
                                </select>
                                {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                            </FormGroup>
                        </div>
                    </div>


                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup row>
                                <label htmlFor="riesgos">Riesgo Natural:</label>
                                <select className="custom-select" id="riesgoNatural" value={selectedRiesgo} onChange={handleRiesgoChange}>
                                    <option key="default-riesgos" value="">Seleccione...</option>
                                    <option key="terremoto" value="Terremoto">Terremoto</option>
                                    <option key="deslizamiento" value="Deslizamiento">Deslizamiento</option>
                                    <option key="deslizamiento" value="Deslizamiento">Inundacion</option>
                                    <option key="incendio" value="Incendio">Incendio</option>
                                    <option key="sequia" value="Sequia">Sequía</option>
                                    <option key="huracan" value="Huracan">Huracan</option>
                                </select>
                                {errors.riesgoNatural && <FormFeedback>{errors.riesgoNatural}</FormFeedback>}

                            </FormGroup>
                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>
                            <div style={{ flex: 1, marginRight: '0px' }}>
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


                        </div>
                    </div>

                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '0px', width: '100%' }}>
                            <FormGroup row>
                                <Label for="practicaPreventiva" sm={4} className="input-label">Practica Preventiva</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="practicaPreventiva"
                                        name="practicaPreventiva"
                                        value={formData.practicaPreventiva}
                                        onChange={handleInputChange}
                                        className={errors.practicaPreventiva ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Practica Preventiva"
                                    />
                                    <FormFeedback>{errors.practicaPreventiva}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>

                    </div>


                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h2>Riesgos Naturales</h2>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup row>
                                <Label for="resultadoPractica" sm={4} className="input-label">Resultado Practica Preventiva</Label>

                                <select className="custom-select" id="resultadoPractica" value={selectedResultadoPractica} onChange={handleResultadoPracticaChange}>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="bueno" value="Bueno">Bueno</option>
                                    <option key="regular" value="Regular">Regular</option>
                                    <option key="incendio" value="Incendio">Malo</option>
                                </select>
                                {errors.resultadoPractica && <FormFeedback>{errors.resultadoPractica}</FormFeedback>}
                            </FormGroup>
                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>
                            <div style={{ flex: 1, marginRight: '0px' }}>
                                <FormGroup row>
                                    <Label for="responsable" sm={4} className="input-label">Responsable</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="responsable"
                                            name="responsable"
                                            value={formData.responsable}
                                            onChange={handleInputChange}
                                            className={errors.responsable ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="Responsable"
                                        />
                                        <FormFeedback>{errors.fecha}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>


                        </div>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px" }}>
                        <FormGroup row>
                            <Label for="accionesCorrectivas" sm={4} className="input-label">Acciones Correctivas</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="accionesCorrectivas"
                                    name="accionesCorrectivas"
                                    value={formData.accionesCorrectivas}
                                    onChange={handleInputChange}
                                    className={errors.accionesCorrectivas ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="Acciones Corretivas"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.accionesCorrectivas}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px" }}>
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
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.observaciones}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>

            )}
            {step === 3 && (
                <div>
                    <h2>Riesgos Naturales</h2>

                    <div className="row" style={{ display: "flex", marginTop: "10px" }}>
                        <div className="col-sm-4" style={{ marginRight: '0px', width: '100%' }}>
                            <DropZoneComponent />
                        </div>
                    </div>


                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                            <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                            <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                        </Col>
                    </FormGroup>
                </div>

            )}
        </div>
    );

};

export default CrearRiesgosNaturales;
