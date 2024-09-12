import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ObtenerPuntoMedicionFincaParcela } from "../../servicios/ServicioContenidoDeClorofila.ts";
import '../../css/CrearCuenta.css';
import { ObtenerRegistroContenidoDeAgua } from '../../servicios/ServicioContenidoDeAgua.ts';

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

const DetallesContenidoDeAgua: React.FC<ContenidoDeAguaSeleccionado> = ({
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
        idContenidoDeClorofila: '',
        cultivo: '',
        fecha: '',
        valorDeClorofila: '',
        temperatura: '',
        humedad: '',
        observaciones: '',
        usuarioCreacionModificacion: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idContenidoDeClorofila: '',
        cultivo: '',
        fecha: '',
        valorDeClorofila: 0,
        idPuntoMedicion: 0,
        temperatura: '',
        humedad: '',
        observaciones: '',
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

   

    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        const parts = fechaMuestreo.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const Fecha = year + '-' + month + '-' + day;
       
       //Esta linea nos ayuda a que se pueda observar la condicion del suelo
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
        if (value.length > 0) {
            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
            setpuntosMedicion(puntosMedicion)
        }

    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
    };

    const handlecondicionSueloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedcondicionSuelo(value);
    };

   
   
    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
     <div>
        <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '95%', marginLeft: '0.5rem' }}>
           <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
           <FormGroup>
                        <label htmlFor="fincas">Finca:</label>
                        <select className="custom-select input-styled" id="fincas" value={selectedFinca} disabled>
                            <option key="default-finca" value="">Seleccione...</option>
                            {filteredFincas.map((finca) => (
                                <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        
                    </FormGroup>
            </div>
            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
            <FormGroup>
                        <label htmlFor="parcelas">Parcela:</label>
                        <select className="custom-select input-styled" id="parcelas" value={selectedParcela} disabled>
                            <option key="default-parcela" value="">Seleccione...</option>
                            {filteredParcelas.map((parcela) => (

                                <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        
                    </FormGroup>
                </div>
        </div>
            
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
            <FormGroup>
                   <label htmlFor="puntosMedicion">Punto de medición:</label>
                    <select className="custom-select" id="puntosMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange} disabled>
                   {puntosMedicion.map((puntoMedicion) => (
                     <option key={`${puntoMedicion.idPuntoMedicion}-${puntoMedicion.codigo || 'undefined'}`} value={puntoMedicion.idPuntoMedicion}>{puntoMedicion.codigo || 'Undefined'}</option>
                   ))}
                  </select>
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
                      readOnly
                  />
                 
                     
                  </Col>
                  </FormGroup>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
            <FormGroup row>
                  <Label for="contenidoDeAguaenSuelo" sm={4} className="input-label">Contenido de Agua en el Suelo:</Label>
                 <Col sm={8}>
                 <Input
                    type="number"
                     id="contenidoDeAguaenSuelo"
                      name="contenidoDeAguaenSuelo"
                    value={formData.contenidoDeAguaEnSuelo}
                    readOnly
                      />
        
                   </Col>
                    </FormGroup>
            </div>

            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
            <FormGroup row>
                     <Label for="contenidoDeAguaenPlanta" sm={4} className="input-label">Contenido De Agua en la Planta:</Label>
                       <Col sm={8}>
                         <Input
           
                         type="number"
                         id="contenidoDeAguaenPlanta"
                         name="contenidoDeAguaenPlanta"
                          value={formData.contenidoDeAguaEnPlanta}
                           readOnly
       
                         />
                   
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
                    readOnly
                
                  />
           
               </Col>
             </FormGroup>
            </div>

            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                 <div style={{ flex: 1, marginRight: '0px' }}>
                 <FormGroup row>
                                <Label for="condicionSuelo" sm={4} className="input-label">Condicion del Suelo</Label>
                                <select className="custom-select" id="condicionSuelo" value={selectedcondicionSuelo} disabled>
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
 </div >

    );
};

export default DetallesContenidoDeAgua;






              
                
               
