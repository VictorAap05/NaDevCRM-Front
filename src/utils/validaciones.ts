
export const validarCedulaEcuatoriana = (cedula: string): boolean => {
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoRegion = parseInt(cedula[2]);
    if (digitoRegion >= 6) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
        const mult = parseInt(cedula[i]) * (i % 2 === 0 ? 2 : 1);
        suma += mult > 9 ? mult - 9 : mult;
    }
    const digitoVerificador = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    return digitoVerificador === parseInt(cedula[9]);
};

export const validarPassword = (pass: string): boolean => {
    // Mínimo 8 caracteres, al menos una letra y un número
    return pass.length >= 8 && /\d/.test(pass) && /[a-zA-Z]/.test(pass);
};

export const validarTelefonoEcuador = (telefono: string): boolean => {
    // 10 dígitos, empieza con 09
    return /^09\d{8}$/.test(telefono);
};

export const validarEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validarRUC = (ruc: string): boolean => {
    if (ruc.length !== 13 || !/^\d+$/.test(ruc)) return false;
    const establecimiento = ruc.substring(10, 13);
    if (establecimiento === '000') return false;
    
    return validarCedulaEcuatoriana(ruc.substring(0, 10));
};

export const validarNombreYApellido = (nombre: string): boolean => {
    const nombreLimpio = nombre.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)+$/;
    
    return regex.test(nombreLimpio);
};