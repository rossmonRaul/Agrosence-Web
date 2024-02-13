//import React, { useState, ChangeEvent } from 'react';
import './App.css'
//import { InsertarUsuario, ObtenerUsuarios } from './servicios/ServicioUsuario';
import Login from './pages/LoginPage';
import { ProveedorUsuarios } from './context/ContextoUsuario';



function App() {
  /*
  const [count, setCount] = useState<number>(0);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [ValorInput, setValorInput] = useState<string>('');


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    var Nombre = ValorInput;
    const datos = {
      Nombre: Nombre
    };
    const resultado = await InsertarUsuario(datos);
    console.log("Agregar");
    console.log(resultado);
    console.log("Agregar");ñ
  };

  return (
    <>
      <div className="card">
        <button onClick={onClickAgregar}>
          Agregar
        </button>
        <input type="text" name="AgregarNombre" id="AgregarNombre" value={ValorInput} onChange={handleInputChange} />
      </div>
      <div className="card">
        <button onClick={handleClick}>
          obtener
        </button>
      </div>
    </>
  );*/

  return (
    <ProveedorUsuarios>
      <Login />
    </ProveedorUsuarios>
      
     
    
  );

}

export default App;

