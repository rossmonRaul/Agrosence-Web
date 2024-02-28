import { Roles } from ".";

export interface UserInfo {
    identificacion: string;
    email: string;
    idFinca: number;
    idParcela: number;
    idEmpresa: number;
    idRol: Roles;
    estado: number;
}