import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormGroup, FormFeedback } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { IoSave, IoArrowBack } from 'react-icons/io5';
import { ObtenerRolesAsignablesUsuarios } from '../../servicios/ServicioUsuario';


interface Props {
  formData: any;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  prevStep: () => void;
  handleSubmit: () => void;
}

// Interfaz para el formato de los datos recibidos de la API
interface Option { 
  idEmpresa: number;
  nombre: string;
  idParcela: number;
  idFinca: number;
  idRol: number;
  rol: string;
}

const DatosEmpresa: React.FC<Props> = ({ formData, prevStep, handleSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({ empresa: '', finca: '', parcela: '' });

  const [fincas, setFincas] = useState<Option[]>([]);
  const [parcelas, setParcelas] = useState<Option[]>([]);
  const [roles, setRoles] = useState<Option[]>([]);


  // Estado para almacenar la selección actual de cada select
  const [selectedFinca, setSelectedFinca] =  useState<string>(() => localStorage.getItem('selectedFinca') || '');
  const [selectedParcela, setSelectedParcela] = useState<string>(() => localStorage.getItem('selectedParcela') || '');
  const [selectedRoles, setSelectedRoles] = useState<string>(() => localStorage.getItem('selectedRoles') || '');


  // Estado para obtener el estado del usuario que inició sesión
  const userLoginState = useSelector((store: AppStore) => store.user);

  useEffect(() => {
    const obtenerFincas = async () => {
      try {
        const idEmpresa = localStorage.getItem('empresaUsuario');
        if (idEmpresa) {
        const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
        setFincas(fincasResponse);
        }
      } catch (error) {
        console.error('Error al obtener las fincas:', error);
      }
    };
    obtenerFincas();
  }, []);

  useEffect(() => {
    const obtenerParcelas = async () => {
      try {
        const idEmpresa = localStorage.getItem('empresaUsuario');
        if (idEmpresa) {
        const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
        setParcelas(parcelasResponse);
        }
      } catch (error) {
        console.error('Error al obtener las parcelas:', error);
      }
    };
    obtenerParcelas();
  }, []);

  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const idEmpresa = localStorage.getItem('empresaUsuario');
        if (idEmpresa) {
        const rolesResponse = await ObtenerRolesAsignablesUsuarios();
        setRoles(rolesResponse);
        }
      } catch (error) {
        console.error('Error al obtener roles:', error);
      }
    };
    obtenerRoles();
  }, []);

  // Filtrar fincas según la empresa seleccionada
  const filteredFincas = fincas.filter(finca => finca.idEmpresa === userLoginState.idEmpresa);

  // Filtrar parcelas según la finca seleccionada
  const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

  const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFinca(value);
    setSelectedParcela('');
    localStorage.setItem('selectedFinca', value);
  };
  const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedParcela(value);
    localStorage.setItem('selectedParcela', value);
  };
  const handleRolesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRoles(value);
    localStorage.setItem('selectedRoles', value);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener todas las fincas y parcelas de una vez
        const [fincasResponse, parcelasResponse, rolesResponse] = await Promise.all([
          axios.get<Option[]>('http://localhost:5271/api/v1.0/Finca/ObtenerFincas'),
          axios.get<Option[]>('http://localhost:5271/api/v1.0/Parcela/ObtenerParcelas'),
          axios.get<Option[]>('http://localhost:5271/api/v1.0/Usuario/ObtenerRolesAsignablesUsuarios')
        ]);
        setFincas(fincasResponse.data);
        setParcelas(parcelasResponse.data);
        setRoles(rolesResponse.data);
      } catch (error) {
        console.error('Error al obtener las roles, fincas y parcelas:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmitConValidacion = () => {
    // Validar campos antes de enviar los datos al servidor
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

    if (!selectedRoles) {
      newErrors.roles = 'Debe seleccionar un rol';
    } else {
      newErrors.roles = '';
    }

    // Actualizar los errores
    setErrors(newErrors);

    // Si no hay errores, enviar los datos al servidor
    if (Object.values(newErrors).every(error => error === '')) {
      // Actualizar el estado formData con las selecciones

        formData.empresa = userLoginState.idEmpresa,
        formData.finca = selectedFinca,
        formData.parcela = selectedParcela,
        formData.rol=selectedRoles


      // Llamar a la función handleSubmit para enviar los datos al servidor
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '96.5%',justifyContent: 'center', marginLeft: '9px',marginRight: '0', gap: '0' }}>
        {/* Selector de empresas */}
        <FormGroup style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%'}}>
          <label htmlFor="fincas">Finca:</label>
          <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange} style={{height:'44px'}}>
            <option key="default-finca" value="">Seleccione...</option>
            {filteredFincas.map((finca) => (
              <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
            ))}
          </select>
          {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
        </FormGroup>
        <FormGroup style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%'}}>
          <label htmlFor="parcelas">Parcela:</label>
          <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} style={{height:'44px'}}>
            <option key="default-parcela" value="">Seleccione...</option>
            {filteredParcelas.map((parcela) => (
              <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
            ))}
          </select>
          {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
        </FormGroup>
      </div>
      <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '48.2%',justifyContent: 'center', marginLeft: '9px',marginRight: '0', gap: '0' }}>
      <FormGroup style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%'}}>
          <label htmlFor="rol">Rol:</label>
          <select className="custom-select" id="rol" value={selectedRoles} onChange={handleRolesChange} style={{height:'44px'}}>
            <option key="default-rol" value="">Seleccione...</option>
            {roles.map((rol) => (
              <option key={`${rol.idRol}-${rol.rol || 'undefined'}`} value={rol.idRol}>{rol.rol || 'Undefined'}</option>
            ))}
          </select>
          {errors.roles && <FormFeedback>{errors.roles}</FormFeedback>}
        </FormGroup>
      </div>
      <div className='botones'>
        <button onClick={prevStep} className='btn-styled-danger'><IoArrowBack size={20} style={{marginRight: '5%'}}/>Anterior</button>
        <button onClick={handleSubmitConValidacion} className="btn-styled" style={{marginRight:'1.5%'}}><IoSave size={20} style={{marginRight: '5%'}}/>Guardar</button>
      </div>      
    </div>
  );
}

export default DatosEmpresa;