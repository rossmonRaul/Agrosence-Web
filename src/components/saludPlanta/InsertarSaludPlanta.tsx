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
import { InsertarDocumentacionSaludDeLaPlanta, InsertarSaludDeLaPlanta } from '../../servicios/ServicioSaludPlanta.ts';
import { IoArrowBack, IoArrowForward, IoSave } from 'react-icons/io5';


interface CrearSaludDeLaPlantaProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}


const CrearSaludDeLaPlanta: React.FC<CrearSaludDeLaPlantaProps> = ({ onAdd }) => {

    const [files, setFiles] = useState<File[]>([]);

    const DropZoneComponent = () => {


        const onDrop = useCallback((acceptedFiles: File[]) => {

            // Validar que no se exceda el límite de 3 archivos
            if (files.length + acceptedFiles.length > 3) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se puede ingresar más de 3 archivos'
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
        cultivo: '',
        idColorHojas: '',
        idTamanoFormaHoja: '',
        idEstadoTallo: '',
        idEstadoRaiz: '',
        usuarioCreacionModificacion: ''

    });

    const [formDataDocument] = useState({
        idSaludDeLaPlanta: '',
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

    const [selectedColorHojas, setSelectedColorHojas] = useState<string>('');
    const [selectedTamanoFormaHoja, setSelectedTamanoFormaHoja] = useState<string>('');
    const [selectedEstadoTallo, setSelectedEstadoTallo] = useState<string>('');
    const [selectedEstadoRaiz, setSelectedEstadoRaiz] = useState<string>('');


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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    //se filtran las parcelas con los idparcelasusuario
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)
                    }
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
    //dropsdown customs
    const handleColorHojasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idColorHojas = value;
        setSelectedColorHojas(value);
    };

    const handleTamanoFormaHojaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idTamanoFormaHoja = value;
        setSelectedTamanoFormaHoja(value);
    };

    //dropsdown customs
    const handleEstadoTalloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idEstadoTallo = value;
        setSelectedEstadoTallo(value);
    };

    const handleEstadoRaizChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idEstadoRaiz = value;
        setSelectedEstadoRaiz(value);
    };

    ///////

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

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El cultivo es obligatorio';
        } else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El cultivo no puede ser mayor a 50 caracteres';
        } else {
            newErrors.cultivo = '';
        }

        if (!formData.idColorHojas.trim()) {
            newErrors.idColorHojas = 'El color de hojas es obligatorio';
        } else {
            newErrors.idColorHojas = '';
        }

        if (!formData.idTamanoFormaHoja) {
            newErrors.idTamanoFormaHoja = 'El tamaño de la forma de la hoja es obligatorio';
        } else {
            newErrors.idTamanoFormaHoja = '';
        }

        if (!formData.idEstadoTallo.trim()) {
            newErrors.idEstadoTallo = 'El estado del tallo es obligatorio';
        } else {
            newErrors.idEstadoTallo = '';
        }

        if (!formData.idEstadoRaiz.trim()) {
            newErrors.idEstadoRaiz = 'El estado de la raíz es obligatorio';
        } else {
            newErrors.idEstadoRaiz = '';
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

        if (files.length<1) {
            
            newErrors.files = 'Se debe insertar minimo una imagen';
            Swal.fire({
                icon: 'info',
                title: 'No se puede guardar el registro',
                text: 'Se debe insertar minimo una imagen'
            });
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

                const resultado = await InsertarSaludDeLaPlanta(formData);

                let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

                if (resultado.indicador === 1) {

                    formDataDocument.idSaludDeLaPlanta = resultado.mensaje

                    for (let documento of files) {
                        const reader = new FileReader();

                        reader.onload = async () => {
                            // Convierte el resultado a una cadena base64
                            const contenidoArchivo = reader.result;
                            formDataDocument.NombreDocumento = documento.name;

                            formDataDocument.Documento = contenidoArchivo as string;


                            const resultadoDocumento = await InsertarDocumentacionSaludDeLaPlanta(formDataDocument)

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
                            text: 'Se ha insertado un registro de salud de la planta'
                        });
                        if (onAdd) {
                            onAdd();
                        }
                    }


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el registro de salud de la planta',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la salud de la planta:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la salud de la planta',
                    text: 'Ocurrió un error al intentar insertar la salud de la planta.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: '650px' }}>
            {step === 1 && (
                <div>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup>
                                <label htmlFor="fincas">Finca:</label>
                                <select className="custom-select input-styled" id="fincas" value={selectedFinca} onChange={handleFincaChange} style={{ height: '44px'}}>
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
                                <select className="custom-select input-styled" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} style={{ height: '44px'}}>
                                    <option key="default-parcela" value="">Seleccione...</option>
                                    {parcelasFiltradas.map((parcela) => (

                                        <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                    ))}
                                </select>
                                {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                            </FormGroup>
                        </div>
                    </div>

                    <div className="row" style={{ display: "flex" , width:'97.5%' }}>
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
                        <div style={{ flex: 1, marginLeft: '1%', marginTop:'0.3%'}}>
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
                                        placeholder="Cultivo"
                                        style={{ height: '44px',width: '107%'}}
                                    />
                                    <FormFeedback>{errors.cultivo}</FormFeedback>
                                </Col>
                            </FormGroup>


                        </div>

                    </div>
                    <div className='botonesN' style={{display:'flex', justifyContent:'end', marginLeft:'22px'}}>
                        <button onClick={handleNextStep} className="btn-styled" style={{width:'49.5%'}}>Siguiente<IoArrowForward size={20} style={{marginLeft: '2%'}}/></button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                        <FormGroup row>
                                <Label for="colorHojas" sm={4} className="input-label">Color de las hojas</Label>

                                <select className="custom-select" id="colorHojas" value={selectedColorHojas} onChange={handleColorHojasChange} style={{height:'42px'}}>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="1" value="1">Verde Saludable</option>
                                    <option key="2" value="2">Amarillento (clorosis)</option>
                                    <option key="3" value="3">Marrón o quemado</option>
                                    <option key="4" value="4">Manchas (indicativas de enfermedades o plagas)</option>   
                                </select>
                                {errors.idColorHojas && <FormFeedback>{errors.idColorHojas}</FormFeedback>}
                            </FormGroup>
                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>

                            <FormGroup row>
                                <Label for="tamanoFormaHoja" sm={4} className="input-label">Tamaño y forma de las hojas</Label>

                                <select className="custom-select" id="tamanoFormaHoja" value={selectedTamanoFormaHoja} onChange={handleTamanoFormaHojaChange} style={{height:'42px'}}>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="1" value="1">Tamaño adecuado según la especie</option>
                                    <option key="2" value="2">Deformaciones o irregularidades</option>
                                </select>
                                {errors.idTamanoFormaHoja && <FormFeedback>{errors.idTamanoFormaHoja}</FormFeedback>}
                            </FormGroup>


                        </div>
                    </div>
                    <div className="row" style={{ display: "flex" }}>
                    <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                    <FormGroup row>
                                <Label for="estadoTallo" sm={4} className="input-label">Estado del tallo</Label>

                                <select className="custom-select" id="estadoTallo" value={selectedEstadoTallo} onChange={handleEstadoTalloChange} style={{height:'42px'}}>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="1" value="1">Fuerza y firmeza</option>
                                    <option key="2" value="2">Presencia de hongos o enfermedades</option>
                                    <option key="3" value="3">Lesiones o daños fisicos</option>
                                </select>
                                {errors.idEstadoTallo && <FormFeedback>{errors.idEstadoTallo}</FormFeedback>}
                            </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px",width: '50%' }}>
                    <FormGroup row>
                                <Label for="estadoRaiz" sm={4} className="input-label">Estado de las raíces</Label>

                                <select className="custom-select" id="estadoRaiz" value={selectedEstadoRaiz} onChange={handleEstadoRaizChange} style={{height:'42px'}}>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="1" value="1">Salud (blancas y firmes)</option>
                                    <option key="2" value="2">Daños o pudrición</option>
                                    <option key="3" value="3">Plagas o enfermedades</option>
                                </select>
                                {errors.idEstadoRaiz && <FormFeedback>{errors.idEstadoRaiz}</FormFeedback>}
                            </FormGroup>
                    </div>
                    </div>
                    <div className='botones'>
                        <button onClick={handlePreviousStep} className='btn-styled-danger'><IoArrowBack size={20} style={{marginRight: '2%'}}/>Anterior</button>
                        <button onClick={handleNextStep} className="btn-styled">Siguiente<IoArrowForward size={20} style={{marginLeft: '2%'}}/></button>
                    </div>
                </div>

            )}
            {step === 3 && (
                <div>

                    <div className="row" style={{ display: "flex", marginTop: "10px" }}>
                        <div className="col-sm-4" style={{ marginRight: '0px', width: '100%' }}>
                            <DropZoneComponent />
                        </div>
                    </div>

                    <div className='botones'>
                        <button onClick={handlePreviousStep} className='btn-styled-danger'><IoArrowBack size={20} style={{marginRight: '2%'}}/>Anterior</button>
                        <Button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</Button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default CrearSaludDeLaPlanta;
