import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { useDropzone } from 'react-dropzone';
import { ActualizarRiesgoNatural, DesactivarDocumentoRiesgoNatural, InsertarDocumentacionRiesgoNatural, ObtenerDocumentacionRiesgoNatural } from '../../servicios/ServicioRiesgoNatural.ts';
import { ActualizarSaludDeLaPlanta, DesactivarDocumentoSaludDeLaPlanta, InsertarDocumentacionSaludDeLaPlanta, ObtenerDocumentacionSaludDeLaPlanta } from '../../servicios/ServicioSaludPlanta.ts';

// Interfaz para las propiedades del componente
interface SaludDeLaPlantaSeleccionado {
    idFinca: string;
    idParcela: string;
    idSaludDeLaPlanta: string,
    fecha: string,
    cultivo: string,
    idColorHojas: string,
    idTamanoFormaHoja: string,
    idEstadoTallo: string,
    idEstadoRaiz: string,
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

const EditarSaludDeLaPlanta: React.FC<SaludDeLaPlantaSeleccionado> = ({
    idFinca,
    idParcela,
    idSaludDeLaPlanta,
    fecha,
    cultivo,
    idColorHojas,
    idTamanoFormaHoja,
    idEstadoTallo,
    idEstadoRaiz,
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

    const [selectedColorHojas, setSelectedColorHojas] = useState<string>('');
    const [selectedTamanoFormaHoja, setSelectedTamanoFormaHoja] = useState<string>('');
    const [selectedEstadoTallo, setSelectedEstadoTallo] = useState<string>('');
    const [selectedEstadoRaiz, setSelectedEstadoRaiz] = useState<string>('');

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idSaludDeLaPlanta: '',
        fecha: '',
        cultivo: '',
        idColorHojas: '',
        idTamanoFormaHoja: '',
        idEstadoTallo: '',
        idEstadoRaiz: '',
        usuarioCreacionModificacion: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idSaludDeLaPlanta: '',
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

                    //obtener los documentos

                    const documentos = await ObtenerDocumentacionSaludDeLaPlanta({ idSaludDeLaPlanta: idSaludDeLaPlanta })


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

        setSelectedColorHojas(idColorHojas)
        setSelectedTamanoFormaHoja(idTamanoFormaHoja)
        setSelectedEstadoTallo(idEstadoTallo)
        setSelectedEstadoRaiz(idEstadoRaiz)

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idSaludDeLaPlanta: idSaludDeLaPlanta,
            fecha: fechaFormateada,
            cultivo: cultivo,
            idColorHojas: idColorHojas,
            idTamanoFormaHoja: idTamanoFormaHoja,
            idEstadoTallo: idEstadoTallo,
            idEstadoRaiz: idEstadoRaiz,
        });

    }, [idSaludDeLaPlanta]);

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

        if (!formData.idColorHojas) {
            newErrors.idColorHojas = 'El color de hojas es obligatorio';
        } else {
            newErrors.idColorHojas = '';
        }

        if (!formData.idTamanoFormaHoja) {
            newErrors.idTamanoFormaHoja = 'El tamaño de la forma de la hoja es obligatorio';
        } else {
            newErrors.idTamanoFormaHoja = '';
        }

        if (!formData.idEstadoTallo) {
            newErrors.idEstadoTallo = 'El estado del tallo es obligatorio';
        } else {
            newErrors.idEstadoTallo = '';
        }

        if (!formData.idEstadoRaiz) {
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
                formDataDocument.usuarioCreacionModificacion = idUsuario
            } else {
                console.error('El valor de identificacionUsuario en localStorage es nulo.');
            }

            const resultado = await ActualizarSaludDeLaPlanta(formData);

            let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

            if (resultado.indicador === 1) {

                formDataDocument.idSaludDeLaPlanta = idSaludDeLaPlanta

                for (let documento of addFiles) {
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

                for (let documento of deletefiles) {

                    const resultadoDocumento = await DesactivarDocumentoSaludDeLaPlanta({ idDocumento: documento.idDocumento})

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
                        text: 'Se ha editado un registro de salud de la planta'
                    });
                };
                if (onEdit) {
                    onEdit();
                };
            };
        } catch (error) {
            console.error('Error al editar la salud de la planta:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al editar la salud de la planta',
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
                    <h2>Salud de la Planta</h2>
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
                        <div style={{ flex: 1, marginRight: '0px' }}>
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

                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2>Salud de la Planta</h2>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup row>
                                <Label for="colorHojas" sm={4} className="input-label">Color de las hojas</Label>

                                <select className="custom-select" id="colorHojas" value={selectedColorHojas} onChange={handleColorHojasChange}>
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
                            <div style={{ flex: 1, marginRight: '0px' }}>
                                <FormGroup row>
                                    <Label for="tamanoFormaHoja" sm={4} className="input-label">Tamaño y forma de las hojas</Label>

                                    <select className="custom-select" id="tamanoFormaHoja" value={selectedTamanoFormaHoja} onChange={handleTamanoFormaHojaChange}>
                                        <option key="default-resultado" value="">Seleccione...</option>
                                        <option key="1" value="1">Tamaño adecuado según la especie</option>
                                        <option key="2" value="2">Deformaciones o irregularidades</option>
                                    </select>
                                    {errors.idTamanoFormaHoja && <FormFeedback>{errors.idTamanoFormaHoja}</FormFeedback>}
                                </FormGroup>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px" }}>
                        <FormGroup row>
                            <Label for="estadoTallo" sm={4} className="input-label">Estado del tallo</Label>

                            <select className="custom-select" id="estadoTallo" value={selectedEstadoTallo} onChange={handleEstadoTalloChange}>
                                <option key="default-resultado" value="">Seleccione...</option>
                                <option key="1" value="1">Fuerza y firmeza</option>
                                <option key="2" value="2">Presencia de hongos o enfermedades</option>
                                <option key="3" value="3">Lesiones o daños fisicos</option>
                            </select>
                            {errors.idEstadoTallo && <FormFeedback>{errors.idEstadoTallo}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px" }}>
                        <FormGroup row>
                            <Label for="estadoRaiz" sm={4} className="input-label">Estado de las raíces</Label>

                            <select className="custom-select" id="estadoRaiz" value={selectedEstadoRaiz} onChange={handleEstadoRaizChange}>
                                <option key="default-resultado" value="">Seleccione...</option>
                                <option key="1" value="1">Salud (blancas y firmes)</option>
                                <option key="2" value="2">Daños o pudrición</option>
                                <option key="3" value="3">Plagas o enfermedades</option>
                            </select>
                            {errors.idEstadoRaiz && <FormFeedback>{errors.idEstadoRaiz}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>

            )}
            {step === 3 && (
                <div>
                    <h2>Salud de la Planta</h2>

                    <div className="row" style={{ display: "flex", marginTop: "10px" }}>
                        <div className="col-sm-4" style={{ marginRight: '0px', width: '100%' }}>
                            <DropZoneComponent />
                        </div>
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

export default EditarSaludDeLaPlanta;
