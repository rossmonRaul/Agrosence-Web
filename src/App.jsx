import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { InsertarUsuario, ObtenerUsuarios } from './servicios/ServicioUsuario';

function App() {
  
  const [count, setCount] = useState(0)

  const [usuarios, setUsuarios] = useState([]);
  const [ValorInput, setValorInput] = useState('');
  
  
  const handleInputChange = (event) => {
    setValorInput(event.target.value);
  };

  const handleClick = async () => {
    try {
      const resultado = await ObtenerUsuarios();
      setUsuarios(resultado);
      console.log(resultado);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const onClickAgregar = async () => {
      var Nombre=ValorInput;
      const datos = {
        Nombre: Nombre
    };
      const resultado = await InsertarUsuario(datos);
      console.log("Agregar");    
      console.log(resultado); 
      console.log("Agregar"); 
  };

  return (
    <>
    <div className="card">
      <button onClick={onClickAgregar}>
        Agregar
      </button>
      <input type="text" name="AgregarNombre" id="AgregarNombre" value={ValorInput}  onChange={handleInputChange}/>
    </div>
    <div className="card">
      <button onClick={handleClick}>
        obtener
      </button>
    </div>
  </>
  )
}

export default App
