// Función para convertir hora de 24 horas a formato de 12 horas con AM/PM
export function convertirHora(hora24: any) {
    let hora = parseInt(hora24.substring(0, 2)); // Extraer la parte de la hora
    let minutos = hora24.substring(3, 5); // Extraer la parte de los minutos

    let meridiano = hora >= 12 ? 'PM' : 'AM'; // Determinar si es AM o PM
    hora = hora % 12 || 12; // Convertir hora a formato de 12 horas

    // Devolver la hora formateada
    return hora + ':' + minutos + ' ' + meridiano;
}

export function convertirHoraA24(hora12: string): string | null {
    // Separar la hora y el meridiano
    const partes = hora12.split(' ');
    if (partes.length !== 2) {
        // Si el formato es incorrecto, devolver null
        return null;
    }

    let [horaStr, meridiano] = partes;
    // Separar las horas y minutos
    let [hora, minutos] = horaStr.split(':').map(Number);

    if (meridiano === 'AM' || meridiano === 'am') {
        // Si es AM y la hora es 12, convertirla a 0
        if (hora === 12) {
            hora = 0;
        }
    } else if (meridiano === 'PM' || meridiano === 'pm') {
        // Si es PM y la hora no es 12, sumarle 12
        if (hora !== 12) {
            hora += 12;
        }
    } else {
        // Si el meridiano no es ni AM ni PM, devolver null
        return null;
    }

    // Devolver la hora en formato de 24 horas
    return `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}