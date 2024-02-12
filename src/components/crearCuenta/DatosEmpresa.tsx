import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Label,  FormGroup, FormFeedback } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'


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
}

const DatosEmpresa: React.FC<Props> = ({ formData, prevStep,handleSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({ empresa: '', finca: '', parcela: '' });

  // Estados para almacenar los datos obtenidos de la API
  const [empresas, setEmpresas] = useState<Option[]>([]);
  const [fincas, setFincas] = useState<Option[]>([]);
  const [parcelas, setParcelas] = useState<Option[]>([]);

  // Estado para almacenar la selección actual de cada select
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(() => localStorage.getItem('selectedEmpresa') || '');
  const [selectedFinca, setSelectedFinca] = useState<string>(() => localStorage.getItem('selectedFinca') || '');
  const [selectedParcela, setSelectedParcela] = useState<string>(() => localStorage.getItem('selectedParcela') || '');

  useEffect(() => {
      const fetchData = async () => {
          try {
              // Obtener todas las fincas y parcelas de una vez
              const [empresasResponse, fincasResponse, parcelasResponse] = await Promise.all([
                  axios.get<Option[]>('http://localhost:5271/api/v1.0/Empresa/ObtenerEmpresas'),
                  axios.get<Option[]>('http://localhost:5271/api/v1.0/Finca/ObtenerFincas'),
                  axios.get<Option[]>('http://localhost:5271/api/v1.0/Parcela/ObtenerParcelas')
              ]);

              setEmpresas(empresasResponse.data);
              setFincas(fincasResponse.data);
              setParcelas(parcelasResponse.data);
          } catch (error) {
              console.error('Error al obtener las empresas, fincas y parcelas:', error);
          }
      };

      fetchData();
  }, []);

  // Filtrar fincas según la empresa seleccionada
  const filteredFincas = fincas.filter(finca => finca.idEmpresa === parseInt(selectedEmpresa));

  // Filtrar parcelas según la finca seleccionada
  const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));


  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEmpresa(value);
    setSelectedFinca('');
    setSelectedParcela('');
    localStorage.setItem('selectedEmpresa', value);
  };

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

  const handleSubmitConValidacion = () => {
    // Validar campos antes de enviar los datos al servidor
    const newErrors: Record<string, string> = {};

    // Validar selección de empresa
    if (!selectedEmpresa) {
      newErrors.empresa = 'Debe seleccionar una empresa';
    } else {
      newErrors.empresa = '';
    }

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

    // Actualizar los errores
    setErrors(newErrors);

    // Si no hay errores, enviar los datos al servidor
    if (Object.values(newErrors).every(error => error === '')) {
      // Actualizar el estado formData con las selecciones
      
        
        formData.empresa = selectedEmpresa,
        formData.finca = selectedFinca,
        formData.parcela = selectedParcela
      

      // Llamar a la función handleSubmit para enviar los datos al servidor
      handleSubmit();
    }
  };



  return (
    <div>
      <div className="form-container-fse">
             <h2>Organización</h2>
            {/* Selector de empresas */}
            <FormGroup>
          <Label htmlFor="empresas" className="input-label">Empresa:</Label>
          <select className="custom-select" id="empresas" value={selectedEmpresa} onChange={handleEmpresaChange}>
            <option key="default-empresa" value="">Seleccione...</option>
            {empresas.map((empresa) => (
              <option key={`${empresa.idEmpresa}-${empresa.nombre}`} value={empresa.idEmpresa}>{empresa.nombre}</option>
            ))}
          </select>
          {errors.empresa && <FormFeedback>{errors.empresa}</FormFeedback>}
        </FormGroup>
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
      <button onClick={prevStep} className='btn-styled-danger'>Anterior</button>
      <button onClick={handleSubmitConValidacion} className="btn-styled">Crear Cuenta</button> 
    </div>
  );
}

export default DatosEmpresa;