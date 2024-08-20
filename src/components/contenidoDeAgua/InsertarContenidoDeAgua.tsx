import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
//import { InsertarManejoFertilizantes } from '../../servicios/ServicioFertilizantes.ts';
import { InsertarRegistroContenidoDeAgua, ObtenerPuntoMedicionFincaParcela} from '../../servicios/ServicioContenidoDeAgua.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';

interface InsertarContenidoDeAguaProps {
    onAdd: () => void;
}

interface Props {
    identificacion: string;
    idEmpresa: number;
};

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
    idPuntoMedicion: number;
    codigo: String;
}

const InsertarContenidoDeAgua: React.FC<InsertarContenidoDeAguaProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        idPuntoMedicion: '',
        fechaMuestreo:'',
        contenidoDeAguaEnSuelo: '',
        contenidoDeAguaEnPlanta:'',
        metodoDeMedicion:'',
        condicionSuelo:'',
        usuarioCreacionModificacion: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [datosContenidoAgua, setDatosContenidoAgua] = useState([]);

    // Obtener y ordenar datos de contenido de agua al cargar el componente
    
    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setpuntosMedicion] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedcondicionSuelo, setSelectedcondicionSuelo] = useState<string>('');

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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
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

    const obtenerParcelasDeFinca = async (idFinca: string) => {
        try {

            const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === parseInt(idFinca));

            setParcelasFiltradas(parcelasFinca);
        } catch (error) {
            console.error('Error al obtener las parcelas de la finca:', error);
        }
    };


// Función para obtener la fecha actual en formato YYYY-MM-DD
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Asegura que el mes tenga dos dígitos
    const day = String(today.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
    return year + '-' + month + '-' + day; // Devuelve la fecha en formato YYYY-MM-DD
  };
  
  useEffect(() => {
    setFormData(prevFormData => ({
      ...prevFormData,
      fechaMuestreo: getTodayDate() // Actualiza 'fechaMuestreo' con la fecha actual
    }));
  }, []);
  
    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
        setSelectedPuntoMedicion('');
        obtenerParcelasDeFinca(value)
    };

    const handleParcelaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        }

        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);

        setpuntosMedicion(puntosMedicion)

    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
    };
    
    //Agregar const de condicion del suelo
    const handlecondiciondelSueloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.condicionSuelo = value;
        setSelectedcondicionSuelo(value);
    };
    const handleSubmit = async () => {
        // Realizar validación de campos antes de enviar el formulario
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


        // Validacion punto de medicion
         if (!selectedPuntoMedicion) {
            newErrors.puntoMedicion = 'Debe seleccionar un punto de medición';
        } else {
            newErrors.puntoMedicion = '';
        }


        if (!selectedcondicionSuelo) {
            newErrors.condicionSuelo = 'Debe seleccionar la condicion del Suelo';
        } else {
            newErrors.condicionSuelo = '';
        }

        // Validacion de fecha
          if (!formData.fechaMuestreo.trim()) {
            newErrors.fechaMuestreo = 'La fecha es obligatoria';
           }

        //Validacion contenido de agua

        if (!formData.contenidoDeAguaEnSuelo.trim()) {
            newErrors.contenidoDeAguaEnSuelo = 'El contenido de Agua en el Suelo es requerido';
        } else if (formData.contenidoDeAguaEnSuelo.length < 0) {
            newErrors.contenidoDeAguaenSuelo = 'El contenido de Agua en el Suelo no puede ser menor a 0';
        } else {
            newErrors.contenidoDeAguaEnSuelo = '';
        }


        if (!formData.contenidoDeAguaEnPlanta.trim()) {
            newErrors.contenidoDeAguaEnPlanta = 'El contenido de Agua en la Planta es requerido';
        } else if (formData.contenidoDeAguaEnPlanta.length < 0) {
            newErrors.contenidoDeAguaEnPlanta = 'El contenido de Agua en la Planta no puede ser menor a 0';
        } else {
            newErrors.contenidoDeAguaEnPlanta = '';
        }
        
        //Validar metodo de medicion

        if (!formData.metodoDeMedicion.trim()) {
            newErrors.metodoDeMedicion = 'El Metodo de Medicion es requerido';
        } else if (formData.metodoDeMedicion.length > 1000) {
            newErrors.metodoDeMedicion = 'No puede ser mayor a 1000 caracteres';
        } else {
            newErrors.metodoDeMedicion = '';
        }

        //Validar condicion del suelo 
         if (!formData.condicionSuelo.trim()) {
            newErrors.condicionSuelo = 'La condicion del Suelo es obligatoria';
        } else {
            newErrors.condicionSuelo = '';
        }


         // Validación de formato de fecha
         const isValidDate = /^\d{4}-\d{2}-\d{2}/.test(formData.fechaMuestreo);
         if (!isValidDate) {
             newErrors.fechaMuestreo = 'La fecha debe estar en formato YYYY-MM-DD';
         }
 

        // // Crear el objeto Date con la fecha formateada
        // const fechaDate = new Date(fechaFormatted);

        // // Obtener la fecha actual
        // const today = new Date();

        // // Verificar si fechaDate es mayor que hoy
        // if (fechaDate > today) {
        //     newErrors.fecha = 'Fecha no puede ser mayor a hoy';
        // }

        formData.idPuntoMedicion = selectedPuntoMedicion;

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;
                formData.idPuntoMedicion = selectedPuntoMedicion;

                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                const resultado = await InsertarRegistroContenidoDeAgua(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro de contenido de Agua insertado!',
                        text: 'Se ha insertado el contenido de Agua con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el contenido de Agua',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el contenido de Agua:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el contenido de Agua',
                    text: 'Ocurrió un error al intentar insertar el contenido de Agua. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
          <h2>Contenido De Agua</h2>
           <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '95%', marginLeft: '0.5rem' }}>
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
                        {parcelasFiltradas.map((parcela) => (
                            <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                </FormGroup>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                         <label htmlFor="puntosMedicion">Punto de medición:</label>
                          <select className="custom-select" id="puntosMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange}>
                            <option key="default-puntoMedicion" value="">Seleccione...</option>
                            {puntosMedicion.map((puntoMedicion) => (
                                <option key={`${puntoMedicion.idPuntoMedicion}-${puntoMedicion.codigo || 'undefined'}`} value={puntoMedicion.idPuntoMedicion}>{puntoMedicion.codigo || 'Undefined'}</option>
                            ))}
                          </select>
                          {errors.puntoMedicion && <FormFeedback>{errors.puntoMedicion}</FormFeedback>}
                          </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
              <Label for="fechaMuestreo" sm={4} className="input-label">Fecha Muestreo:</Label>
                                   <Col sm={4}>
                                       <Input
                                           type="date"
                                           id="fechaMuestreo"
                                           name="fechaMuestreo"
                                           value={formData.fechaMuestreo}
                                           onChange={handleInputChange}
                                           className={errors.fechaMuestreo ? 'input-styled input-error' : 'input-styled'}
                                           placeholder="Selecciona una fecha"
                                       />
                                         <FormFeedback>{errors.fechaMuestreo}</FormFeedback>
                                   </Col>
                 </FormGroup>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                        <Label for="contenidoDeAguaEnSuelo" sm={4} className="input-label">Contenido de Agua en el Suelo:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="contenidoDeAguaEnSuelo"
                                name="contenidoDeAguaEnSuelo"
                                value={formData.contenidoDeAguaEnSuelo.toString()}
                                onChange={handleInputChange}
                                className={errors.contenidoDeAguaEnSuelo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.contenidoDeAguaEnSuelo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                        <Label for="contenidoDeAguaenPlanta" sm={4} className="input-label">Contenido De Agua en la Planta:</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="contenidoDeAguaEnPlanta"
                                name="contenidoDeAguaEnPlanta"
                                value={formData.contenidoDeAguaEnPlanta.toString()}
                                onChange={handleInputChange}
                                className={errors.contenidoDeAguaEnPlanta ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.contenidoDeAguaEnPlanta}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                    <Label for="metodoDeMedicion" sm={4} className="input-label">Metodo de Medicion:</Label>
                <Col sm={8}>
                  <Input
                    type="text"
                    id="metodoDeMedicion"
                    name="metodoDeMedicion"
                    value={formData.metodoDeMedicion}
                    onChange={handleInputChange}
                    className={errors.metodoDeMedicion ? 'input-styled input-error' : 'input-styled'}
                    placeholder="Metodo De Medicion"
                                    
                  />
                 <FormFeedback>{errors.metodoDeMedicion}</FormFeedback>
              </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
            <Label for="condiciondelsuelo" sm={4} className="input-label">Condicion del Suelo:</Label>
   
                   <select className="custom-select" id="condiciondelsuelo" value={selectedcondicionSuelo} onChange={handlecondiciondelSueloChange}>
               <option key="default-resultado" value="">Seleccione...</option>
               <option key="compacto" value="Compacto">Compacto</option>
                                <option key="suelto" value="Suelto">Suelto</option>
                                <option key="erosionado" value="Erosionado">Erosionado</option>
                                <option key="saturado" value="Saturado">Saturado</option>
                                <option key="arenoso" value="Arenoso">Arenoso</option>
              </select>
            { errors.condicionSuelo && <FormFeedback>{errors.condicionSuelo}</FormFeedback>}
            </FormGroup>
                </div>
            </div>
        </div>

        <div style={{ flex: 1, marginTop: '0.5rem', marginRight: '0.5rem', marginLeft: '0.5rem' }}>
        <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                           
                            <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                        </Col>
                    </FormGroup>
        </div>
    </div>
       );


};

export default InsertarContenidoDeAgua;
