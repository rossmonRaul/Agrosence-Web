import {jwtDecode} from "jwt-decode";

export const ProcesarDatosApi = async (
  method: string,
  url: string,
  data: any
) => {
  const storedToken = localStorage.getItem("token");

  let token;
  if (storedToken) {
    token = storedToken;
    const { exp } = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    if (exp < currentTime) {
      localStorage.setItem('sessionExpired', 'true'); // Establece el valor
      localStorage.removeItem("token"); 
      window.location.assign("/login")
      return { indicador: 401, mensaje: "La sesión ha expirado!" };
    }
      
  }
  let headers: Record<string, string> = {
    "Content-type": "application/json;charset=UTF-8",
    Accept: "application/json",
  };
  // Agregar token al encabezado de autorización si está presente
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const myInit: RequestInit = {
    method: method,
    headers: headers,
    mode: "cors",
    cache: "default",
  };

  if (method !== "GET" && method !== undefined) {
    myInit.body = JSON.stringify(data);
  }

  const myRequest = new Request(url, myInit);
  try {
    const response = await fetch(myRequest);

    if(response.status === 401){
        localStorage.setItem('sessionExpired', 'true'); // Establece el valor
        localStorage.removeItem('token');
        const loginUrl = '/login';
        window.location.assign(loginUrl);
        return { indicador: 401, mensaje: "La sesión ha expirado!" };
    }

    if (response.ok) {
      return await response.json();
    } else {
      return { indicador: 500, mensaje: "Ocurrió un error en el proceso!" };
    }
  } catch (error) {
    console.error(error);
  }
};
