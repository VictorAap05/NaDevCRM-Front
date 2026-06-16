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

export const validarRUC = (ruc: string): boolean => {
    if (ruc.length !== 13 || !/^\d+$/.test(ruc)) return false;

    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(ruc[2]);
    const establecimiento = ruc.substring(10, 13);
    if (establecimiento === '000') return false;

    if (tercerDigito < 6) {
        return validarCedulaEcuatoriana(ruc.substring(0, 10));
    }

    if (tercerDigito === 9) {
        const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            suma += parseInt(ruc[i]) * coeficientes[i];
        }
        const residuo = suma % 11;
        const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
        return digitoVerificador === parseInt(ruc[9]);
    }

    if (tercerDigito === 6) {
        const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 8; i++) {
            suma += parseInt(ruc[i]) * coeficientes[i];
        }
        const residuo = suma % 11;
        const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
        return digitoVerificador === parseInt(ruc[8]);
    }

    return false;
};

export const validarPassword = (pass: string): boolean => {
    return pass.length >= 8 && /\d/.test(pass) && /[a-zA-Z]/.test(pass);
};

export const validarTelefonoEcuador = (telefono: string): boolean => {
    return /^09\d{8}$/.test(telefono);
};

export const validarEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validarNombreYApellido = (nombre: string): boolean => {
    const nombreLimpio = nombre.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)+$/;
    return regex.test(nombreLimpio);
};