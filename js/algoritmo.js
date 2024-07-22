// Configuración
let contraseña = "";
let mensaje;
let salt;
let iv;
let encrypted; // Variable para almacenar el mensaje encriptado
let key; // Variable para almacenar la clave

// Función para guardar la contraseña
function guardarContraseña() {
    contraseña = document.getElementById("txtLlave").value;
}

// Función para generar una clave a partir de una contraseña y salt
async function generarClave(contraseña, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(contraseña),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Función para encriptar
async function encriptar(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv },
        key,
        data
    );
    return new Uint8Array(encrypted);
}

// Función para desencriptar
async function desencriptar(encrypted, key) {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv },
        key,
        encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}



// Función para manejar el clic en el botón de encriptar
async function accionar() {
    const mensajeInput = document.getElementById("txtMensaje").value;
    const llaveInput = document.getElementById("txtLlave").value;

    if (!mensajeInput && !llaveInput) {
        document.getElementById("popup").innerHTML = "Ingresa un mensaje para encriptar y crea una llave.";
    } else if (!mensajeInput) {
        document.getElementById("popup").innerHTML = "Ingresa un mensaje para encriptar.";
    } else if (!llaveInput) {
        document.getElementById("popup").innerHTML = "Crea una llave para encriptar el mensaje.";
    } else {
        contraseña = llaveInput;
        mensaje = mensajeInput;
        salt = window.crypto.getRandomValues(new Uint8Array(16));
        key = await generarClave(contraseña, salt);
        encrypted = await encriptar(mensaje, key);


        document.getElementById("popupMensaje").innerHTML = "Mensaje encriptado";
        document.getElementById("iv").innerHTML = "IV: " + Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        document.getElementById("salt").innerHTML = "SALT: " + Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        document.getElementById("MENSAJE").innerHTML = "MENSAJE: " + Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
    }
}


// Funcion para manejar cambio de mensaje 

document.getElementById("txtMensaje").addEventListener("click", function(){

document.getElementById("popup").innerHTML = "Encripta un mensaje con el algoritmo AES256"; 

});


// Funciòn para manejar el click en el botòn limpiar 

function Limpiar(){

    document.getElementById("txtMensaje").value = "";
    document.getElementById("txtLlave").value = "";
    document.getElementById("iv").innerHTML = "IV: ";
    document.getElementById("salt").innerHTML = "SALT: ";
    document.getElementById("MENSAJE").innerHTML = "MENSAJE: ";
}


// Función para manejar el clic en el botón de desencriptar
async function accionarDesencriptar() {
    const llaveInput = document.getElementById("txtLlave").value;

    if (!llaveInput) {
        document.getElementById("popup").innerHTML = "Crea una llave para desencriptar el mensaje.";
        return;
    }

    const keyForDecryption = await generarClave(llaveInput, salt);
    const decryptedMessage = await desencriptar(encrypted, keyForDecryption);
    document.getElementById("popupMensaje").innerHTML = "Mensaje desencriptado";
    document.getElementById("MENSAJE").innerHTML = "MENSAJE: " + decryptedMessage;
}

