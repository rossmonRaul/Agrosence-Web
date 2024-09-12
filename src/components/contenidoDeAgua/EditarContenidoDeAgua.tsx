import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ModificarRegistroContenidoDeAgua, ObtenerPuntoMedicionFincaParcela } from "../../servicios/ServicioContenidoDeAgua.ts";
import '../../css/CrearCuenta.css';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente
interface ContenidoDeAguaSeleccionado {
    idFinca: string;
    idParcela: string;
    idContenidoDeAgua: string;
    idPuntoMedicion: string;
    fechaMuestreo: string,
    contenidoDeAguaEnSuelo: string;
    contenidoDeAguaEnPlanta: string;
    metodoDeMedicion: string;
    condicionSuelo: string;
    onEdit?: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
    idPuntoMedicion: number;
    codigo: String;
}

const ModificacionContenidoDeAgua: React.FC<ContenidoDeAguaSeleccionado> = ({
    idFinca,
    idParcela,
    idContenidoDeAgua,
    idPuntoMedicion,
    fechaMuestreo,
    contenidoDeAguaEnSuelo,
    contenidoDeAguaEnPlanta,
    metodoDeMedicion,
    condicionSuelo,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setpuntosMedicion] = useState<Option[]>([]);
    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');
    const [selectedcondicionSuelo, setSelectedcondicionSuelo] = useState<string>('');

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idContenidoDeAgua: '',
        fechaMuestreo: '',
        contenidoDeAguaEnSuelo: '',
        contenidoDeAguaEnPlanta:'',
        metodoDeMedicion: '',
        condicionSuelo: '',
        usuarioCreacionModificacion: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idContenidoDeAgua: '',
        idPuntoMedicion: 0,
        fechaMuestreo: Date,
        contenidoDeAguaEnSuelo: 0,
        contenidoDeAguaEnPlanta: 0,
        metodoDeMedicion: '',
        condicionSuelo: '',
        usuarioCreacionModificacion: ''
    });

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };


    const handlecondicionSueloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.condicionSuelo = value;
        setSelectedcondicionSuelo(value);
    };

    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        const parts = fechaMuestreo.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const Fecha = year + '-' + month + '-' + day;


        setSelectedcondicionSuelo(condicionSuelo)

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idContenidoDeAgua: idContenidoDeAgua,
            fechaMuestreo: Fecha,
            contenidoDeAguaEnSuelo: contenidoDeAguaEnSuelo,
            contenidoDeAguaEnPlanta: contenidoDeAguaEnPlanta,
            metodoDeMedicion: metodoDeMedicion,
            condicionSuelo: condicionSuelo,
        });
    }, [idContenidoDeAgua]);


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
                    const fincaParcelaCargar = {
                        idFinca: idFinca,
                        idParcela: idParcela
                    }

                    const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcelaCargar);

                    setpuntosMedicion(puntosMedicion)
                    setSelectedPuntoMedicion(idPuntoMedicion);
                    
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, []);


    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value
        formData.idParcela = ""
        setSelectedFinca(value);
        setSelectedParcela('');
        setpuntosMedicion([]);
        setSelectedPuntoMedicion('');
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }


    const handleParcelaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idParcela = value
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        }
        
        setpuntosMedicion([]);
        setSelectedPuntoMedicion('');
        if (value.length > 0 ) {
            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
            setpuntosMedicion(puntosMedicion)
        }
        
    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
    };

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de avanzar al siguiente paso
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

       

        if (!formData.fechaMuestreo) {
            newErrors.fechaMuestreo = 'La fecha es obligatoria';
        }

        if (!formData.contenidoDeAguaEnSuelo) {
            newErrors.contenidoDeAguaEnSuelo = 'El contenido de agua en el suelo es requerido';
        }else if (parseInt(formData.contenidoDeAguaEnSuelo) <= 0) {
            newErrors.contenidoDeAguaEnSuelo = 'El contenido de agua en el suelo debe ser mayor a 0';
        } else {
            newErrors.contenidoDeAguaEnSuelo = '';
        }
        
        if (!formData.contenidoDeAguaEnPlanta) {
            newErrors.contenidoDeAguaEnPlanta = 'El contenido de agua en la Planta es requerido';
        }else if (parseInt(formData.contenidoDeAguaEnPlanta) <= 0) {
            newErrors.contenidoDeAguaEnPlanta = 'El contenido de agua en la planta debe ser mayor a 0';
        } else {
            newErrors.contenidoDeAguaEnPlanta = '';
        }
        
        
        // const fechaParts = formData.fecha.split("/");
        // const fechaFormatted = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        // const fechaDate = new Date(fechaFormatted);

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaDate es mayor que hoy
        // if (fechaDate > today) {
        //     newErrors.fecha = 'Fecha no puede ser mayor a hoy';
        // }


        // Actualizar los errores
        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };

    // Función para formatear la fecha en el formato yyyy-MM-dd
    // function formatDate(inputDate: any) {
    //     const parts = inputDate.split('/');
    //     const day = parts[0];
    //     const month = parts[1];
    //     const year = parts[2];
    //     return year + '-' + month + '-' + day;
    // }

    // Suponiendo que formData.fechaCreacion contiene la fecha recibida (08/03/2024)
    // const formattedDate = formatDate(formData.fecha);

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const idUsuario = localStorage.getItem('identificacionUsuario');
        const datos = {
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idContenidoDeAgua: formData.idContenidoDeAgua,
            idPuntoMedicion: selectedPuntoMedicion,
            fechaMuestreo: formData.fechaMuestreo,
            contenidoDeAguaEnSuelo: formData.contenidoDeAguaEnSuelo,
            contenidoDeAguaEnPlanta: formData.contenidoDeAguaEnPlanta,
            metodoDeMedicion: formData.metodoDeMedicion,
            condicionSuelo: formData.condicionSuelo,
            usuarioCreacionModificacion: idUsuario

        };

        try {
            const resultado = await ModificarRegistroContenidoDeAgua(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Contenido de Agua Actualizado! ',
                    text: 'Contenido de Agua actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el contenido de Agua.',
                    text: resultado.mensaje,
                });
            };

            // vuelve a cargar la tabla

            if (onEdit) {
                onEdit();
            }

        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
         <div>
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
                            {filteredParcelas.map((parcela) => (
                                <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                    </FormGroup>
                    </div>
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
                                className={errors.contenidoDeAguaEnSuelo? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.contenidoDeAguaEnSuelo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                        <Label for="contenidoDeAguaEnPlanta" sm={4} className="input-label">Contenido De Agua en la Planta:</Label>
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
                     <div style={{ flex: 1, marginRight: '0px' }}>
                            <FormGroup row>
                            <label htmlFor="condicionSuelo">Condicion del Suelo:</label>
                            <select className="custom-select" id="condicionSuelo" value={selectedcondicionSuelo} onChange={handlecondicionSueloChange}>
                                <option key="compacto" value="Compacto">Compacto</option>
                                <option key="suelto" value="Suelto">Suelto</option>
                                <option key="erosionado" value="Erosionado">Erosionado</option>
                                <option key="saturado" value="Saturado">Saturado</option>
                                <option key="arenoso" value="Arenoso">Arenoso</option>
                                </select>

                            </FormGroup>
                        </div>
                </div>
            </div>
          </div>

            <div className='botonesN'>
                <Button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '1%'}}/>Actualizar datos</Button>
            </div>
        </div>

    );
};

export default ModificacionContenidoDeAgua;

