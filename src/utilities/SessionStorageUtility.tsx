// Almacenar los datos en la session
export const persisSessionStorage = <T,>(key: string, value: T) =>{
    sessionStorage.setItem(key, JSON.stringify({...value}));
};

// Limpiar los datos de la session
export const clearSessionStorage = (key: string) =>{
    sessionStorage.removeItem(key);
};