import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback } from 'reactstrap';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ObtenerDocumentacionSaludDeLaPlanta } from '../../servicios/ServicioSaludPlanta.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

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

const DetallesSaludDeLaPlanta: React.FC<SaludDeLaPlantaSeleccionado> = ({
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
    const [imageURL, setImageURL] = useState('');
    const [listaImagenes, setListaImagenes] = useState<any[]>([]);

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

    const MostrarImagen = (item: any) => {

        const url = URL.createObjectURL(item.file);
        setImageURL(url);
    }
    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };
    const columns = [
        { key: 'finca.name', header: 'Imagen' },
        { key: 'finca.size', header: 'Observar' },
        // { key: 'tamanoFormaHoja', header: 'Tamaño de la forma de la hoja' },
        // { key: 'estadoTallo', header: 'Estado del tallo' },
        // { key: 'estadoRaiz', header: 'Estado de la raiz' },
        // { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];


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

                    setSelectedColorHojas(idColorHojas)
                    setSelectedTamanoFormaHoja(idTamanoFormaHoja)
                    setSelectedEstadoTallo(idEstadoTallo)
                    setSelectedEstadoRaiz(idEstadoRaiz)


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

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }


    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: '650px' }}>
            {step === 1 && (
                <div>
                    <h2>Salud de la Planta</h2>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup>
                                <label htmlFor="fincas">Finca:</label>
                                <select className="custom-select input-styled" id="fincas" value={selectedFinca} disabled>
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
                                <select className="custom-select input-styled" id="parcelas" value={selectedParcela} disabled>
                                    <option key="default-parcela" value="">Seleccione...</option>
                                    {filteredParcelas.map((parcela) => (

                                        <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                    ))}
                                </select>
                                {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                            </FormGroup>
                        </div>
                    </div>

                    <div className="row" style={{ display: "flex", marginBottom: "30px", width: '100%' }}>
                        <div className="row" style={{ marginRight: '10px', width: '50%' }}>
                            <div style={{ marginRight: '10px', width: '98%' }}>
                                <FormGroup row>
                                    <Label for="fecha" sm={4} className="input-label">Fecha</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="text"
                                            id="fecha"
                                            name="fecha"
                                            value={fecha}
                                            readOnly
                                        />

                                    </Col>
                                </FormGroup>
                            </div>


                        </div>
                        <div style={{ flex: 1, marginRight: '0px' }}>
                            <FormGroup row>
                                <Label for="cultivo" sm={4} className="input-label">Cultivo</Label>
                                <Col sm={4}>
                                    <Input
                                        type="text"
                                        id="cultivo"
                                        name="cultivo"
                                        value={cultivo}
                                        readOnly
                                    />

                                </Col>
                            </FormGroup>


                        </div>

                    </div>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup row>
                                <Label for="colorHojas" sm={4} className="input-label">Color de las hojas</Label>

                                <select className="custom-select" id="colorHojas" value={selectedColorHojas} disabled>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="1" value="1">Verde Saludable</option>
                                    <option key="2" value="2">Amarillento (clorosis)</option>
                                    <option key="3" value="3">Marrón o quemado</option>
                                    <option key="4" value="4">Manchas (indicativas de enfermedades o plagas)</option>
                                </select>

                            </FormGroup>
                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>
                            <div style={{ flex: 1, marginRight: '0px' }}>
                                <FormGroup row>
                                    <Label for="tamanoFormaHoja" sm={4} className="input-label">Tamaño y forma de las hojas</Label>

                                    <select className="custom-select" id="tamanoFormaHoja" value={selectedTamanoFormaHoja} disabled>
                                        <option key="default-resultado" value="">Seleccione...</option>
                                        <option key="1" value="1">Tamaño adecuado según la especie</option>
                                        <option key="2" value="2">Deformaciones o irregularidades</option>
                                    </select>

                                </FormGroup>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="col-sm-4" style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup row>
                                <Label for="estadoTallo" sm={4} className="input-label">Estado del tallo</Label>
                                <select className="custom-select" id="estadoTallo" value={selectedEstadoTallo} disabled>
                                    <option key="default-resultado" value="">Seleccione...</option>
                                    <option key="1" value="1">Fuerza y firmeza</option>
                                    <option key="2" value="2">Presencia de hongos o enfermedades</option>
                                    <option key="3" value="3">Lesiones o daños fisicos</option>
                                </select>

                            </FormGroup>
                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>
                            <div style={{ flex: 1, marginRight: '0px' }}>
                                <FormGroup row>
                                    <Label for="estadoRaiz" sm={4} className="input-label">Estado de las raíces</Label>

                                    <select className="custom-select" id="estadoRaiz" value={selectedEstadoRaiz} disabled>
                                        <option key="default-resultado" value="">Seleccione...</option>
                                        <option key="1" value="1">Salud (blancas y firmes)</option>
                                        <option key="2" value="2">Daños o pudrición</option>
                                        <option key="3" value="3">Plagas o enfermedades</option>
                                    </select>

                                </FormGroup>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2>Listado de imágenes</h2>
                    <div style={{ display: "flex", height: "100%", width: "900px", paddingBottom: '10px' }}>
                        <table style={{ width: "50%", marginRight: "10px", textAlign: 'center', borderCollapse: "collapse", border: "1px solid #ddd", maxHeight: '330px', minHeight: '330px' }}>
                            <thead style={{ backgroundColor: "#f2f2f2", border: "1px solid #ddd" }}>
                                <tr style={{ backgroundColor: "#f2f2f2", border: "1px solid #ddd" }}>
                                    <th style={{ border: "1px solid #ddd" }}>Nombre archivo</th>
                                    <th style={{ border: "1px solid #ddd" }}>Visualizar imagen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((item) => (
                                    <tr key={item.idDocumento} style={{ border: "1px solid #ddd" }}>
                                        <td style={{ border: "1px solid #ddd", wordBreak: "break-word", whiteSpace: "normal", maxWidth: "700px", padding: "15px" }}>{item.file.name}</td>
                                        <td style={{ border: "1px solid #ddd" }}>
                                            <FontAwesomeIcon icon={faEye} onClick={() => MostrarImagen(item)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            
                        </table>
                        {imageURL && (
                            <div style={{ width: "400px", textAlign: 'center' }}>
                                <h4>Imagen seleccionada</h4>
                                <img src={imageURL} alt="img" style={{ width: '300px', height: '300px' }} />
                            </div>)}
                    </div>
                    <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                </div>

            )}

        </div>
    );
};

export default DetallesSaludDeLaPlanta;
