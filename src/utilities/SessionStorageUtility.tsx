// Almacenar los datos en la session
export const persisSessionStorage = <T,>(key: string, value: T) => {
    sessionStorage.setItem(key, JSON.stringify({ ...value }));
};

// Limpiar los datos de la session
export const clearSessionStorage = (key: string) => {
    const token = localStorage.getItem('token');

    if (token) {
        // Verificar si el token ha expirado
        const tokenData = JSON.parse(atob(token.split('.')[1])); // Decodificar el token JWT
        const tokenExpiration = tokenData.exp * 1000; // Convertir la fecha de expiración a milisegundos
        const currentTime = new Date().getTime(); // Obtener el tiempo actual en milisegundos

        if (currentTime >= tokenExpiration) {
            // Si el token ha expirado, eliminar el token y realizar otras acciones de cierre de sesión
            sessionStorage.removeItem(key);
            sessionStorage.clear();
            localStorage.removeItem('token');
        }
    } else {
        sessionStorage.removeItem(key);
        sessionStorage.clear();
    }
};