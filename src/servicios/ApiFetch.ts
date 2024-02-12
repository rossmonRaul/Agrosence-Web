export const ProcesarDatosApi = async (method: string, url: string, data: any) => {
    const myInit: RequestInit = {
        method: method,
        headers: {
            "Content-type": "application/json;charset=UTF-8",
            'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'default',
        //credentials: 'include',

    };

    if (method !== 'GET' && data !== undefined) {
        myInit.body = JSON.stringify(data)
    }

    const myRequest = new Request(url, myInit);
    try {
        const response = await fetch(myRequest);
        console.log("AAAAAA");
        console.log(response);
        console.log("AAAAAA");
        if (response.ok) {
            return await response.json();
        } else {
            return { indicador: 500, mensaje: 'Ocurrio un error en el proceso!' }
        }
    } catch (error) {
        console.log(error);
    }

}