import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/ManejoResiduos.css';
import { CrearRegistroEficienciaRiego } from '../../servicios/ServicioRiego.ts';
import { IoArrowBack, IoArrowForward, IoSave } from "react-icons/io5";

interface CrearEficienciaRiegoProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const CrearEficienciaRiegos: React.FC<CrearEficienciaRiegoProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        estadoTuberiasYAccesorios: false,
        uniformidadRiego: false,
       // estadoAspersores: false,
        estadoCanalesRiego: false,
        volumenAguaUtilizado: '',
        nivelFreatico: '',
        usuarioCreacionModificacion: '',
        uniformidadalerta:'',
        uniformidaddetalles:'',
        fugasalerta:'',
        fugasdetalles:'',
        canalesalerta:'',
        canalesdetalles:'',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [selecteduniformidadalerta, setSelecteduniformidadalerta] = useState<string>('');
    const [selectedfugasalerta, setSelectedfugasalerta] = useState<string>('');
    const [selectedcanalesalerta, setSelectedcanalesalerta] = useState<string>('');
    const [step, setStep] = useState(1);


    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = event.target;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked; // Cast target to HTMLInputElement to access 'checked'
    
        setFormData((prevState: any) => {
            const newValue = type === 'checkbox' ? checked : value;
            const updatedFormData = {
                ...prevState,
                [name]: newValue
            };
    
            // Limpiar los campos si el checkbox correspondiente se desmarca
            if (type === 'checkbox' && !checked) {
                if (name === 'uniformidadRiego') {
                    updatedFormData.uniformidadalerta = '';
                    updatedFormData.uniformidaddetalles = '';
                } else if (name === 'estadoCanalesRiego') {
                    updatedFormData.canalesalerta = '';
                    updatedFormData.canalesdetalles = '';
                } else if (name === 'estadoTuberiasYAccesorios') {
                    updatedFormData.fugasalerta = '';
                    updatedFormData.fugasdetalles = '';
                }
            }
    
            return updatedFormData;
        });
    };
    





    const handleuniformidadalertaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.uniformidadalerta = value;
        setSelecteduniformidadalerta(value);
    };

    const handlefugasalertaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.fugasalerta = value;
        setSelectedfugasalerta(value);
    };


    const handlecanalesalertaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.canalesalerta = value;
        setSelectedcanalesalerta(value);
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
        if (!formData.volumenAguaUtilizado) {
            newErrors.volumenAguaUtilizado = 'Consumo de agua es requerido';
        } else {
            newErrors.finca = '';
        }

        if (!formData.nivelFreatico) {
            newErrors.nivelFreatico = 'Nivel Freático es requerido';
        } else {
            newErrors.parcela = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }
               
                const resultado = await CrearRegistroEficienciaRiego(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro insertado!',
                        text: 'Se ha insertado  un registro de eficiencia de riego.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el registro de eficiencia de riego.',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el manejo de residuos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el manejo de residuos',
                    text: 'Ocurrió un error al intentar insertar el manejo de residuos. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth:'700px' }}>

            
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
                                {parcelasFiltradas.map((parcela) => (

                                    <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%', marginTop: '5px' }}>
                   
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup>

                            <Label for="volumenAguaUtilizado" sm={8} className="input-label">Consumo Agua (L)</Label>

                            <Col >
                                <Input
                                    type="number"
                                    id="volumenAguaUtilizado"
                                    name="volumenAguaUtilizado"
                                    value={formData.volumenAguaUtilizado}
                                    onChange={handleInputChange}
                                    className={errors.volumenAguaUtilizado ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                            </Col>

                            <FormFeedback>{errors.volumenAguaUtilizado}</FormFeedback>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="nivelFreatico" sm={4} className="input-label">Nivel Freático</Label>
                            <Col>
                                <Input
                                    type="number"
                                    id="nivelFreatico"
                                    name="nivelFreatico"
                                    value={formData.nivelFreatico}
                                    onChange={handleInputChange}
                                    className={errors.nivelFreatico ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.nivelFreatico}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                </div>
                <div className='botonesN'>
                  <button onClick={handleNextStep} className="btn-styled">Siguiente <IoArrowForward size={20} style={{marginLeft: '2%'}}/></button>
                </div>
         </div>

        )}
        {step === 2 && (
    <div>       
       
        <div className="row" style={{ marginTop: '5px' }}>
    <div className="col-sm-4" style={{ marginRight: "10px" }}>
      <FormGroup row style={{ display: 'flex' }}>
        <Label for="uniformidadRiego" className="input-label" style={{ width: '100%', textAlign: 'left', fontSize: '1.25rem' }}>
          Uniformidad de Riego
        </Label>
        <Col>
          <Input
            type="checkbox"
            id="uniformidadRiego"
            name="uniformidadRiego"
            checked={formData.uniformidadRiego}
            onChange={handleInputChange}
            className={errors.uniformidadRiego ? 'input-styled input-error' : 'input-styled'}
            style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
          />
        </Col>
        <FormFeedback>{errors.uniformidadRiego}</FormFeedback>
      </FormGroup>

      {formData.uniformidadRiego && (
        <>
          <FormGroup row>
            <Label for="uniformidadalerta" sm={4} className="input-label">
              Rango de alertas de Uniformidad de Riego:
            </Label>
            <Col sm={8}>
              <select
                className="custom-select"
                id="uniformidadalerta"
                value={formData.uniformidadalerta}
                onChange={handleInputChange}
                name="uniformidadalerta"
              >
                <option key="default-resultado" value="">Seleccione...</option>
                <option key="bajo" value="Bajo">Bajo</option>
                <option key="medio" value="Medio">Medio</option>
                <option key="alto" value="Alto">Alto</option>
              </select>
              {errors.uniformidadalerta && <FormFeedback>{errors.uniformidadalerta}</FormFeedback>}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="uniformidaddetalles" sm={4} className="input-label">
              Detalles de Uniformidad de Riego:
            </Label>
            <Col sm={8}>
              <Input
                type="text"
                id="uniformidaddetalles"
                name="uniformidaddetalles"
                value={formData.uniformidaddetalles}
                onChange={handleInputChange}
                className={errors.uniformidaddetalles ? 'input-styled input-error' : 'input-styled'}
                placeholder="Detalles"
              />
              <FormFeedback>{errors.uniformidaddetalles}</FormFeedback>
            </Col>
          </FormGroup>
        </>
      )}
    </div>

    <div className="col-sm-4" style={{ marginRight: "10px" }}>
      <FormGroup row style={{ display: 'flex' }}>
        <Label for="estadoCanalesRiego" className="input-label" style={{ width: '100%', textAlign: 'left', fontSize: '1.25rem' }}>
          Obstrucción en Canales de Riego
        </Label>
        <Col>
          <Input
            type="checkbox"
            id="estadoCanalesRiego"
            name="estadoCanalesRiego"
            checked={formData.estadoCanalesRiego}
            onChange={handleInputChange}
            className={errors.estadoCanalesRiego ? 'input-styled input-error' : 'input-styled'}
            style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
          />
        </Col>
        <FormFeedback>{errors.estadoCanalesRiego}</FormFeedback>
      </FormGroup>

      {formData.estadoCanalesRiego && (
        <>
          <FormGroup row>
            <Label for="canalesalerta" sm={4} className="input-label">
              Rango de alertas de Obstrucción en Canales de Riego:
            </Label>
            <Col sm={8}>
              <select
                className="custom-select"
                id="canalesalerta"
                value={formData.canalesalerta}
                onChange={handleInputChange}
                name="canalesalerta"
              >
                <option key="default-resultado" value="">Seleccione...</option>
                <option key="bajo" value="Bajo">Bajo</option>
                <option key="medio" value="Medio">Medio</option>
                <option key="alto" value="Alto">Alto</option>
              </select>
              {errors.canalesalerta && <FormFeedback>{errors.canalesalerta}</FormFeedback>}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="canalesdetalles" sm={4} className="input-label">
              Detalles de Obstrucción en Canales de Riego:
            </Label>
            <Col sm={8}>
              <Input
                type="text"
                id="canalesdetalles"
                name="canalesdetalles"
                value={formData.canalesdetalles}
                onChange={handleInputChange}
                className={errors.canalesdetalles ? 'input-styled input-error' : 'input-styled'}
                placeholder="Detalles"
              />
              <FormFeedback>{errors.canalesdetalles}</FormFeedback>
            </Col>
          </FormGroup>
        </>
      )}
    </div>

    <div className="col-sm-4" style={{ marginRight: "10px" }}>
      <FormGroup row style={{ display: 'flex' }}>
        <Label for="estadoTuberiasYAccesorios" className="input-label" style={{ width: '100%', textAlign: 'left', fontSize: '1.25rem' }}>
          Fugas en el Sistema de Riego
        </Label>
        <Col>
          <Input
            type="checkbox"
            id="estadoTuberiasYAccesorios"
            name="estadoTuberiasYAccesorios"
            checked={formData.estadoTuberiasYAccesorios}
            onChange={handleInputChange}
            className={errors.estadoTuberiasYAccesorios ? 'input-styled input-error' : 'input-styled'}
            style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
          />
        </Col>
        <FormFeedback>{errors.estadoTuberiasYAccesorios}</FormFeedback>
      </FormGroup>

      {formData.estadoTuberiasYAccesorios && (
        <>
          <FormGroup row>
            <Label for="fugasalerta" sm={4} className="input-label">
              Rango de alertas Fugas en el Sistema de Riego:
            </Label>
            <Col sm={8}>
              <select
                className="custom-select"
                id="fugasalerta"
                value={formData.fugasalerta}
                onChange={handleInputChange}
                name="fugasalerta"
              >
                <option key="default-resultado" value="">Seleccione...</option>
                <option key="bajo" value="Bajo">Bajo</option>
                <option key="medio" value="Medio">Medio</option>
                <option key="alto" value="Alto">Alto</option>
              </select>
              {errors.fugasalerta && <FormFeedback>{errors.fugasalerta}</FormFeedback>}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="fugasdetalles" sm={4} className="input-label">
              Detalles Fugas en el Sistema de Riego:
            </Label>
            <Col sm={8}>
              <Input
                type="text"
                id="fugasdetalles"
                name="fugasdetalles"
                value={formData.fugasdetalles}
                onChange={handleInputChange}
                className={errors.fugasdetalles ? 'input-styled input-error' : 'input-styled'}
                placeholder="Detalles"
              />
              <FormFeedback>{errors.fugasdetalles}</FormFeedback>
            </Col>
          </FormGroup>
        </>
      )}
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

export default CrearEficienciaRiegos;
