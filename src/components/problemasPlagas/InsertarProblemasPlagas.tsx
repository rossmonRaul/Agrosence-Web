import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button,InputGroup, InputGroupText } from 'reactstrap';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/ManejoResiduos.css';
import '../../css/DropZoneComponent.css';
import { InsertarRegistroSeguimientoPlagasyEnfermedades } from '../../servicios/ServicioProblemas.ts';
import {InsertarDocumentacionProblemasDePlagas } from '../../servicios/ServicioProblemas.ts';




interface CrearProblemaPlagasProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}


const CrearProblemaPlagas: React.FC<CrearProblemaPlagasProps> = ({ onAdd }) => {

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
        problema: '',
        plagaEnfermedad: '',
        incidencia: '',
        metodologiaEstimacion: '',
        accionTomada: '',
        valor:'',
        usuarioCreacionModificacion: ''

    });

    const [formDataDocument] = useState({
        idRegistroSeguimientoPlagasYEnfermedades: '',
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
    const [selectedincidencia, setSelectedincidencia] = useState<string>('');
    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        
        // Remove the '%' sign before processing
        let processedValue = value.replace('%', '');
      
        if (name === 'valor') {
          // Allow empty value to enable deletion
          if (processedValue === '') {
            setFormData((prevState) => ({
              ...prevState,
              [name]: ''
            }));
            return;
          }
      
          const numericValue = parseInt(processedValue, 10);
          processedValue = Math.max(0, Math.min(100, isNaN(numericValue) ? 1 : numericValue)).toString();
        }
      
        setFormData((prevState) => ({
          ...prevState,
          [name]: processedValue
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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
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
    
    ///////
    const handleincidenciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.incidencia = value;
        setSelectedincidencia(value);
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
        
        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El Cultivo es obligatorio';
        }else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El Cultivo no puede más de 50 carateres';
        }else {
            newErrors.cultivo = '';
        }



        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

       

        if (!formData.problema) {
            newErrors.problema = 'El problema es obligatoria';
        }else if (formData.problema.length > 100) {
            newErrors.problema = 'El problema no puede más de 100 carateres';
        } else {
            newErrors.problema = '';
        }

        if (!formData.plagaEnfermedad.trim()) {
            newErrors.plagaEnfermedad = 'El plaga o enfermedad es obligatoria';
        }else if (formData.plagaEnfermedad.length > 50) {
            newErrors.plagaEnfermedad = 'El plaga enfermedad no puede más de 50 carateres';
        }else {
            newErrors.plagaEnfermedad = '';
        }

        if (!formData.incidencia.trim()) {
            newErrors.incidencia = 'La incidencia es obligatoria';
        
        } else {
            newErrors.incidencia = '';
        }

        if (!formData.valor.trim()) {
            newErrors.valor = 'El Valor es obligatorio';
        
        } else {
            newErrors.valor = '';
        }

        if (!formData.metodologiaEstimacion.trim()) {
            newErrors.metodologiaEstimacion = 'Las Estimacion es obligatoria';
        }else if (formData.metodologiaEstimacion.length > 100) {
            newErrors.metodologiaEstimacion = 'El Estimacion no puede más de 100 carateres';
        } else {
            newErrors.metodologiaEstimacion = '';
        }

        if (!formData.accionTomada.trim()) {
            newErrors.accionTomada = 'La Accion Tomada son obligatoria';
        }else if (formData.accionTomada.length > 200) {
            newErrors.accionTomada = 'El Accion Tomada no puede más de 200 carateres';
        } else {
            newErrors.accionTomada = '';
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

                const resultado = await InsertarRegistroSeguimientoPlagasyEnfermedades(formData);

              
                let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

                if (resultado.indicador === 1) {

                    formDataDocument.idRegistroSeguimientoPlagasYEnfermedades = resultado.mensaje

                    for (let documento of files) {
                        const reader = new FileReader();

                        reader.onload = async () => {
                            // Convierte el resultado a una cadena base64
                            const contenidoArchivo = reader.result;
                            formDataDocument.NombreDocumento = documento.name;
                               
                            
                            formDataDocument.Documento = contenidoArchivo as string;
                            

                            const resultadoDocumento = await InsertarDocumentacionProblemasDePlagas(formDataDocument)

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
                            text: 'Se ha insertado un registro de problema'
                        });
                        if (onAdd) {
                            onAdd();
                        }
                    }


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el registro de problema',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar un problema:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar un problema',
                    text: 'Ocurrió un error al intentar insertar un problema.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: '650px' }}>
            {step === 1 && (
                <div>
                    <h2>Problemas Plagas</h2>
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


                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
    <div style={{ flex: 1, marginRight: '10px', width: '50%' }}>
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
    <div style={{ flex: 1, marginLeft: '10px' , width: '50%'}}>
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
                />
                <FormFeedback>{errors.cultivo}</FormFeedback>
            </Col>
        </FormGroup>
    </div>
</div>

<div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
<div style={{ flex: 1, marginRight: '10px', width: '50%' }}>
                            <FormGroup row>
                                 <Label for="incidencia" sm={4} className="input-label">Valoración:</Label>
                                      <Col sm={8}>
                             <Input
                    type="select" 
                    style={{ width: '100%', height: '2.6rem' }}
                    id="incidencia"
                    name="incidencia"
                    value={formData.incidencia}
                    onChange={handleInputChange}
                    className={errors.incidencia ? 'input-styled input-error' : 'input-styled'}
                >
                    <option key="default-resultado" value="">Seleccione...</option>
                    <option key="incidencia" value="Incidencia">Incidencia</option>
                    <option key="severidad" value="Severidad">Severidad</option>
                </Input>
                <FormFeedback>{errors.incidencia}</FormFeedback>
            </Col>
        </FormGroup>
    </div>
    <div style={{flex: 1 , width: '50%', marginLeft: '10px'}}>
        <FormGroup row>
            <Label for="valor" sm={4} className="input-label">Valor (%)</Label>
            <Col sm={8}>
                <Input
                    type="text"
                    id="valor"
                    name="valor"
                    value={formData.valor !== '' ? `${formData.valor}%` : ''}
                    onChange={handleInputChange}
                    className={errors.valor ? 'input-styled input-error' : 'input-styled'}
                    placeholder="Valor"
                    min="0"
                    max="100"
                />
                <FormFeedback>{errors.valor}</FormFeedback>
            </Col>
        </FormGroup>
    </div>
</div>

<div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
    <div style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
        <FormGroup row>
            <Label for="plagaEnfermedad" sm={4} className="input-label">Plaga o Enfermedad</Label>
            <Col sm={8}>
                <Input
                    type="text"
                    id="plagaEnfermedad"
                    name="plagaEnfermedad"
                    value={formData.plagaEnfermedad}
                    onChange={handleInputChange}
                    className={errors.plagaEnfermedad ? 'input-styled input-error' : 'input-styled'}
                    placeholder="Plaga o Enfermedad"
                />
                <FormFeedback>{errors.plagaEnfermedad}</FormFeedback>
            </Col>
        </FormGroup>
    </div>
</div>


                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>//cierra principal
            )}
            {step === 2 && (
                <div>
                    <h2>Problemas Plagas</h2>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                                <FormGroup row>
                                    <Label for="metodologiaEstimacion" sm={4} className="input-label">Metodologia de Estimacion</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="metodologiaEstimacion"
                                            name="metodologiaEstimacion"
                                            value={formData.metodologiaEstimacion}
                                            onChange={handleInputChange}
                                            className={errors.metodologiaEstimacion ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="Metodologia de Estimacion"
                                        />
                                        <FormFeedback>{errors.metodologiaEstimacion}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>
                        </div>
                        

                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px" }}>
                        <FormGroup row>
                            <Label for="problema" sm={4} className="input-label">Problema</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="problema"
                                    name="problema"
                                    value={formData.problema}
                                    onChange={handleInputChange}
                                    className={errors.problema ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="Problema"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.problema}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px" }}>
                        <FormGroup row>
                            <Label for="accionTomada" sm={4} className="input-label">Accion Tomada</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="accionTomada"
                                    name="accionTomada"
                                    value={formData.accionTomada}
                                    onChange={handleInputChange}
                                    className={errors.accionTomada ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="Accion Tomada"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.accionTomada}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    
                    <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>

            )}
            {step === 3 && (
                <div>
                    <h2>Problemas Plagas</h2>

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

export default CrearProblemaPlagas;
