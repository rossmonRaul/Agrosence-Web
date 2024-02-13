// UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definimos el tipo para los datos del usuario
interface DatosUsuario {
  identificacion: string;
  email: string;
  idFinca: number;
  idParcela: number;
  idEmpresa: number;
}

// Definimos el tipo para el contexto del usuario
interface TipoContextoUsuario {
  user: DatosUsuario | null;
  setUser: React.Dispatch<React.SetStateAction<DatosUsuario | null>>;
  logout: () => void; // Método para cerrar la sesión
}

// Creamos el contexto de usuario
const ContextoUsurio = createContext<TipoContextoUsuario>({
  user: null,
  setUser: () => null,
  logout: () => null,
});

// Creamos un hook personalizado para acceder al contexto de usuario
export const useUser = () => useContext(ContextoUsurio);

// Componente proveedor del contexto de usuario
export const ProveedorUsuarios: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DatosUsuario | null>(null);

  // Método para cerrar la sesión
  const logout = () => {
    // Limpiar los datos del usuario al cerrar sesión
    setUser(null);
    // Aquí puedes agregar cualquier otra lógica necesaria al cerrar sesión, como redireccionar a la página de inicio, etc.
  };

  return (
    <ContextoUsurio.Provider value={{ user, setUser, logout }}>
      {children}
    </ContextoUsurio.Provider>
  );
};