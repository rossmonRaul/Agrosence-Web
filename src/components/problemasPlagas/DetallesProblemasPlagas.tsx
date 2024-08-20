import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback } from 'reactstrap';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ObtenerDocumentacionProblemasDePlagas } from '../../servicios/ServicioProblemas.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

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

const DetallesProblemasPlagas: React.FC<ProblemaSeleccionado> = ({
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
    const [selectedincidencia, setSelectedincidencia] = useState<string>('');
    const [files, setFiles] = useState<{ file: File; idDocumento?: number }[]>([]);
    const [addFiles, setAddFiles] = useState<File[]>([]);
    const [deletefiles, setDeleteFiles] = useState<{ idDocumento?: number }[]>([]);

    const [imageURL, setImageURL] = useState('');
    const [listaImagenes, setListaImagenes] = useState<any[]>([]);

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
        valor: '',
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
                    //obtener los documentos

                    const documentos = await ObtenerDocumentacionProblemasDePlagas({ idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades })

                    setSelectedincidencia(incidencia)


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
                    <h2>Problemas Plagas</h2>
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
                     
                    <div className="row" style={{ display: "flex" }}>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '50%' }}>
                            <div style={{ flex: 1, marginRight: '10px' }}>
                                <FormGroup row>
                                    <Label for="fecha" sm={4} className="input-label">Fecha</Label>
                                    <Col sm={8}>
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
                        <div className="col-sm-4" style={{ marginRight: '0px', width: '50%' }}>
                            <FormGroup row>
                                <Label for="cultivo" sm={4} className="input-label">Cultivo</Label>
                                <Col sm={8}>
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
                 
                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                    <div style={{flex: 1, marginRight: '10px' }}>
                            <FormGroup row>
                                <Label for="incidencia" sm={4} className="input-label">Valoracion:</Label>
                                <select
                                className="custom-select"
                                id="incidencia"
                                value={selectedincidencia}
                                disabled
                                style={{ width: '100%', height: '2.4rem' }}  // Ajusta el ancho y altura aquí
                            >
                      
                           <option key="incidencia" value="Incidencia">Incidencia</option>
                                <option key="severidad" value="Severidad">Severidad</option>
                                
                          </select>
                          
                            </FormGroup>
                            
                        </div>
                       
                        <div style={{ marginRight: '0px', width: '50%'}}>
                            <FormGroup row>
                               <Label for="valor" sm={4} className="input-label">Valor (%)</Label>
                                 <Col sm={8}>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                      <Input
                                        type="text" 
                                        id="valor"
                                        name="valor"
                                        value={`${valor}%`} 
                                        readOnly
                                        style={{ textAlign: 'left' }} 
                                      />
                                 </div>
                              </Col>
                      </FormGroup>
                       </div>

                        

                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '1.5rem' }}> {/* Ajusta el margen aquí */}
                       <div style={{ flex: 1 }}>
                          <FormGroup row>
                           <Label for="plagaEnfermedad" sm={4} className="input-label">Plaga o Enfermedad</Label>
                           <Col sm={8}>
                           <Input
                            type="text"
                             id="plagaEnfermedad"
                             name="plagaEnfermedad"
                               value={plagaEnfermedad}
                              readOnly
                           />
                          <FormFeedback>{errors.plagaEnfermedad}</FormFeedback>
                      </Col>
                    </FormGroup>  
                     </div>
                  </div>
{/* Espacio adicional entre el formulario y el botón */}

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
                                       value={metodologiaEstimacion}
                                       className={errors.metodologiaEstimacion ? 'input-styled input-error' : 'input-styled'}
                                       readOnly
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
                               value={problema}
                               className={errors.problema ? 'input-styled input-error' : 'input-styled'}
                               style={{ minWidth: '350px' }}
                               maxLength={100}
                               readOnly
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
                               value={accionTomada}
                               className={errors.accionTomada ? 'input-styled input-error' : 'input-styled'}
                               style={{ minWidth: '350px' }}
                               maxLength={100}
                               readOnly
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

export default DetallesProblemasPlagas;
