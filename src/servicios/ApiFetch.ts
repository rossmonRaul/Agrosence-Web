export const ProcesarDatosApi = async (method: string, url: string, data: any) => {
    const storedToken = localStorage.getItem('token');

    let token
    if (storedToken) {
        token = storedToken
        console.log("🚀 ~ ProcesarDatosApi ~ token:", token)
    }
    let headers: Record<string, string> = {
        "Content-type": "application/json;charset=UTF-8",
        'Accept': 'application/json',
    };
    // Agregar token al encabezado de autorización si está presente
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const myInit: RequestInit = {
        method: method,
        headers: headers,
        mode: 'cors',
        cache: 'default',
    };

    if (method !== 'GET' && method !== undefined) {
        myInit.body = JSON.stringify(data)
    }

    const myRequest = new Request(url, myInit);
    try {
        const response = await fetch(myRequest);
        if (response.ok) {
            return await response.json();
        } else {
            return { indicador: 500, mensaje: 'Ocurrió un error en el proceso!' }
        }
    } catch (error) {
        console.error(error);
    }
}
