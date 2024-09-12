import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button,InputGroup, InputGroupText } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ModificarRegistroSeguimientoPlagasyEnfermedades } from '../../servicios/ServicioProblemas.ts';
import { useDropzone } from 'react-dropzone';
import {InsertarDocumentacionProblemasDePlagas, DesactivarDocumentoProblemasDePlagas,ObtenerDocumentacionProblemasDePlagas } from '../../servicios/ServicioProblemas.ts';
import { IoArrowBack, IoArrowForward, IoSave } from 'react-icons/io5';
// Interfaz para las propiedades del componente
interface ProblemaSeleccionado {
    idFinca: number;
    idParcela: number;
    idRegistroSeguimientoPlagasYEnfermedades: string,
    fecha: string,
    cultivo: string,
    plagaEnfermedad: string,
    incidencia: string,
    metodologiaEstimacion: string,
    problema: string,
    accionTomada: string,
    valor: string,
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Documento {
    idDocumento: number;
    documento: string;
    nombreDocumento: string;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const EditarProblemaPlagas: React.FC<ProblemaSeleccionado> = ({
    idFinca,
    idParcela,
    idRegistroSeguimientoPlagasYEnfermedades,
    fecha,
    cultivo,
    plagaEnfermedad,
    incidencia,
    metodologiaEstimacion,
    problema,
    accionTomada,
    valor,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    const [files, setFiles] = useState<{ file: File; idDocumento?: number }[]>([]);
    const [addFiles, setAddFiles] = useState<File[]>([]);
    const [deletefiles, setDeleteFiles] = useState<{ idDocumento?: number }[]>([]);

    const [selectedincidencia, setSelectedincidencia] = useState<string>('');
    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        fecha: '',
        cultivo: '',
        problema: '',
        plagaEnfermedad: '',
        incidencia: '',
        metodologiaEstimacion: '',
        accionTomada: '',
        valor: '',
        usuarioCreacionModificacion: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        idParcela: 0,
        idRegistroSeguimientoPlagasYEnfermedades: 0,
        cultivo: '',
        fecha: '',
        incidencia: '',
        metodologiaEstimacion: '',
        problema: '',
        accionesCorrectivas: '',
        accionTomada: '',
        valor:'',
        usuarioCreacionModificacion: '',
    });

    const [formDataDocument] = useState({
        idRegistroSeguimientoPlagasYEnfermedades: '',
        Documento: '',
        NombreDocumento: '',
        usuarioCreacionModificacion: ''

    });
    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    // Función para manejar cambios en los inputs del formulario
    // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = event.target;
    //     setFormData((prevState: any) => ({
    //         ...prevState,
    //         [name]: value
    //     }));
    // };
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        
        // Remove the '%' sign before processing
        let processedValue = value.replace('%', '');
      
        if (name === 'valor') {
          // Allow empty value to enable deletion
          if (processedValue === '') {
        setFormData((prevState: FormData) => ({
            ...prevState,
            [name]: ''
          }));
          return;
        }
    
       
        const numericValue = parseInt(processedValue, 10);
        processedValue = Math.max(0, Math.min(100, isNaN(numericValue) ? 1 : numericValue)).toString();
      }
        setFormData((prevState: FormData) => ({
          ...prevState,
          [name]: processedValue
        }));
      };
     
      
    const handleincidenciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.incidencia = value;
        setSelectedincidencia(value);
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

                    const documentos = await ObtenerDocumentacionProblemasDePlagas({ idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades })


                    const archivos = documentos.map((doc: Documento) => {
                        // Convertir los datos base64 a un blob
                        const byteCharacters = atob(doc.documento.split(',')[1]);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'application/octet-stream' });

                        // Crear un archivo a partir del blob
                        const archivo = new File([blob], doc.nombreDocumento);

                        // Devolver un objeto que incluya el archivo y su ID asociado
                        return { file: archivo, idDocumento: doc.idDocumento };
                    });


                    setFiles(archivos);

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
        const parts = fecha.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const fechaFormateada = year + '-' + month + '-' + day;
       
        setSelectedincidencia(incidencia)
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades,
            fecha: fechaFormateada,
            cultivo: cultivo,
            plagaEnfermedad: plagaEnfermedad,
            incidencia: incidencia,
            metodologiaEstimacion: metodologiaEstimacion,
            problema: problema,
            accionTomada: accionTomada,
            valor: valor,
        });

    }, [idRegistroSeguimientoPlagasYEnfermedades]);

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

        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El Cultivo es obligatorio';
        } else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El Cultivo no puede más de 50 carateres';
        } else {
            newErrors.cultivo = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        } else {
            newErrors.fecha = '';
        }

        if (!formData.problema) {
            newErrors.problema = 'El problema es obligatoria';
        } else if (formData.problema.length > 100) {
            newErrors.problema = 'El problema no puede más de 100 carateres';
        } else {
            newErrors.problema = '';
        }

        if (!formData.plagaEnfermedad.trim()) {
            newErrors.plagaEnfermedad = 'El plaga o enfermedad es obligatoria';
        } else if (formData.plagaEnfermedad.length > 50) {
            newErrors.plagaEnfermedad = 'El plaga enfermedad no puede más de 50 carateres';
        } else {
            newErrors.plagaEnfermedad = '';
        }

        if (!formData.incidencia.trim()) {
            newErrors.incidencia = 'La incidencia es obligatoria';
        } else if (formData.incidencia.length > 50) {
            newErrors.incidencia = 'El incidencia no puede más de 50 carateres';
        } else {
            newErrors.incidencia = '';
        }

        if (!formData.metodologiaEstimacion.trim()) {
            newErrors.metodologiaEstimacion = 'Las Estimacion es obligatoria';
        } else if (formData.metodologiaEstimacion.length > 100) {
            newErrors.metodologiaEstimacion = 'El Estimacion no puede más de 100 carateres';
        } else {
            newErrors.metodologiaEstimacion = '';
        }

        if (!formData.accionTomada.trim()) {
            newErrors.accionTomada = 'La Accion Tomada son obligatoria';
        } else if (formData.accionTomada.length > 200) {
            newErrors.accionTomada = 'El Accion Tomada no puede más de 200 carateres';
        } else {
            newErrors.accionTomada = '';
        }

        const fechaParts = formData.fecha.split("/");
        const fechaFormatted = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
        const fechaDate = new Date(fechaFormatted);

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si es mayor que hoy
        if (fechaDate > today) {
            newErrors.fecha = 'Fecha no puede ser mayor a hoy';
        }

        setErrors(newErrors);
        console.log(formData)
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
                formData.usuarioCreacionModificacion = idUsuario;
            } else {
                console.error('El valor de identificacionUsuario en localStorage es nulo.');
            }

            const resultado = await ModificarRegistroSeguimientoPlagasyEnfermedades(formData);

              
            let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

            if (resultado.indicador === 1) {

                formDataDocument.idRegistroSeguimientoPlagasYEnfermedades = idRegistroSeguimientoPlagasYEnfermedades

                for (let documento of addFiles) {
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

                for (let documento of deletefiles) {

                    const resultadoDocumento = await DesactivarDocumentoProblemasDePlagas({ idDocumento: documento.idDocumento})

                    if (resultadoDocumento.indicador !== 1) {
                        errorEnviandoArchivos = true; // Marcar que hubo un error
                    }

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
                        title: '¡Registro editado!',
                        text: 'Se ha editado un registro de Problema de Plagas o Enfermdedad'
                    });
                };
                if (onEdit) {
                    onEdit();
                };
            };
        } catch (error) {
            console.error('Error al editar un Problema de Plagas o Enfermdedad:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al editar un Problema de Plagas o Enfermdedad',
                text: 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.'
            });
        }
    };


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
                while (files.some(fileObj => fileObj.file.name === fileName)) {
                    const parts = file.name.split('.');
                    const name = parts.slice(0, -1).join('.');
                    const extension = parts[parts.length - 1];
                    fileName = `${name}(${index}).${extension}`;
                    index++;

                }
                const renamedFile = new File([file], fileName); // Crear un nuevo objeto de archivo con el nombre modificado
                newFiles.push({ file: renamedFile });
            });

            setFiles(prevFiles => [...prevFiles, ...newFiles]);
            const addNewFiles = [...addFiles, ...newFiles.map(({ file }) => file)];
            setAddFiles(addNewFiles);
        }, [files, addFiles]);

        const handleRemoveFile = (idDocumentoToRemove?: number, index?: number) => {
            if (index !== undefined) {

                // Eliminar el archivo de files
                const newFiles = files.filter((_, idx) => idx !== index);

                setFiles(newFiles);

                // Obtener el nombre del archivo correspondiente en files
                const fileNameToDelete = files[index].file.name;

                // Buscar el archivo correspondiente en addFiles y eliminarlo
                const addNewFiles = addFiles.filter(file => file.name !== fileNameToDelete);

                setAddFiles(addNewFiles);

                // Si idDocumentoToRemove según sea necesario
                if (idDocumentoToRemove !== undefined) {

                    setDeleteFiles(prevDeleteFiles => [...prevDeleteFiles, { idDocumento: idDocumentoToRemove }]);
                }
            }
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
                        <p>Haz clic o arrastra y suelta los archivos aquí.</p>
                    }
                </div>

                <div className="file-list">
                    {files.map(({ file, idDocumento }, index) => (
                        <div className="file-item" key={index}>
                            <a href={URL.createObjectURL(file)} download={file.name}>
                                {file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}
                            </a>
                            <button className='button' onClick={() => handleRemoveFile(idDocumento, index)}>X</button>
                        </div>
                    ))}
                </div>

            </div>
        );
    };



    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: '650px' }}>
            {step === 1 && (
                <div>
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


                    <div className="row" style={{ display: "flex" }}>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>
                            <div style={{ flex: 1, marginRight: '10px' }}>
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
                        <div className="col-sm-4" style={{ marginRight: '0px', width: '50%' }}>
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
                    <div style={{ flex: 1, marginRight: '10px'  }}>
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
    <div style={{ marginRight: '0px', width: '50%'}}>
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


                    <div className='botonesN'><button onClick={handleNextStep} className="btn-styled">Siguiente<IoArrowForward size={20} style={{marginLeft: '2%'}}/></button></div>
                </div>
            )}
            {step === 2 && (
                <div>
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
                        <Button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Actualizar</Button>
                    </div>
                </div>

            )}

        </div>
    );
};

export default EditarProblemaPlagas;