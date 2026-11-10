/* ==========================================================
   script.js
   Lógica de la página de login:
   - Validación de correo y contraseña
   - Mostrar/ocultar contraseña
   - "Recordar mi correo" (solo el correo, NUNCA la contraseña)
   - Autenticación simulada con credenciales de demostración
   ========================================================== */

"use strict"; // modo estricto: ayuda a detectar errores comunes

/* ----------------------------------------------------------
   CREDENCIALES DE DEMOSTRACIÓN
   ⚠️ AVISO IMPORTANTE:
   Esta comprobación es EXCLUSIVAMENTE DIDÁCTICA y NO es un
   mecanismo seguro de autenticación. Cualquier persona puede
   leer este archivo desde el navegador y ver la contraseña.
   En un sistema real, la verificación se hace en un servidor,
   la contraseña se guarda cifrada (hash) y se usa HTTPS.
   ---------------------------------------------------------- */
const DEMO_EMAIL = "demo@ejemplo.com";
const DEMO_PASSWORD = "Demo1234!";

// Clave con la que se guarda el correo en localStorage
const STORAGE_KEY = "login_demo_email";

// Longitud mínima de la contraseña
const MIN_PASSWORD_LENGTH = 8;

/* ----------------------------------------------------------
   REFERENCIAS A ELEMENTOS DEL DOM
   ---------------------------------------------------------- */
const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const rememberCheck = document.getElementById("remember");
const toggleBtn = document.getElementById("toggle-password");
const forgotLink = document.getElementById("forgot-link");
const submitBtn = document.getElementById("submit-btn");
const statusBox = document.getElementById("form-status");

/* ----------------------------------------------------------
   FUNCIONES DE VALIDACIÓN
   Cada una devuelve un texto con el error, o "" si todo está bien.
   ---------------------------------------------------------- */

// Expresión regular sencilla para el formato de correo: algo@dominio.ext
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value) {
  const email = value.trim();
  if (email === "") {
    return "Ingresa tu correo electrónico.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Escribe un correo válido, por ejemplo nombre@ejemplo.com.";
  }
  return "";
}

function validatePassword(value) {
  if (value === "") {
    return "Ingresa tu contraseña.";
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return "";
}

/* ----------------------------------------------------------
   FUNCIONES PARA MOSTRAR / LIMPIAR ERRORES
   ---------------------------------------------------------- */
function showError(input, errorElement, message) {
  errorElement.textContent = message;
  input.setAttribute("aria-invalid", "true"); // también activa el estilo rojo en CSS
}

function clearError(input, errorElement) {
  errorElement.textContent = "";
  input.setAttribute("aria-invalid", "false");
}

// Valida un campo y muestra o limpia su error. Devuelve true si es válido.
function checkField(input, errorElement, validator) {
  const message = validator(input.value);
  if (message) {
    showError(input, errorElement, message);
    return false;
  }
  clearError(input, errorElement);
  return true;
}

/* ----------------------------------------------------------
   MENSAJES DE ESTADO (confirmación, bienvenida, error)
   type: "info" | "success" | "error"
   ---------------------------------------------------------- */
function showStatus(message, type) {
  statusBox.className = `status status--${type}`;
  statusBox.textContent = message;
}

function clearStatus() {
  statusBox.className = "status";
  statusBox.textContent = "";
}

/* ----------------------------------------------------------
   MOSTRAR / OCULTAR CONTRASEÑA
   Cambia el type del input entre "password" y "text".
   ---------------------------------------------------------- */
toggleBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";

  passwordInput.type = isHidden ? "text" : "password";

  // Actualiza el estado accesible del botón y su etiqueta
  toggleBtn.setAttribute("aria-pressed", String(isHidden));
  toggleBtn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");

  // Alterna el icono (ojo abierto / ojo tachado)
  toggleBtn.querySelector(".icon-eye").hidden = isHidden;
  toggleBtn.querySelector(".icon-eye-off").hidden = !isHidden;

  passwordInput.focus(); // devuelve el foco al campo
});

/* ----------------------------------------------------------
   VALIDACIÓN EN TIEMPO REAL
   - Al salir del campo (blur) se valida.
   - Al escribir, si había error, se vuelve a validar para quitarlo
     en cuanto el usuario lo corrige.
   ---------------------------------------------------------- */
emailInput.addEventListener("blur", () => {
  checkField(emailInput, emailError, validateEmail);
});
passwordInput.addEventListener("blur", () => {
  checkField(passwordInput, passwordError, validatePassword);
});

emailInput.addEventListener("input", () => {
  if (emailInput.getAttribute("aria-invalid") === "true") {
    checkField(emailInput, emailError, validateEmail);
  }
});
passwordInput.addEventListener("input", () => {
  if (passwordInput.getAttribute("aria-invalid") === "true") {
    checkField(passwordInput, passwordError, validatePassword);
  }
});

/* ----------------------------------------------------------
   "RECORDAR MI CORREO"
   Solo se guarda el correo. La contraseña NUNCA se guarda
   en localStorage ni sessionStorage.
   ---------------------------------------------------------- */
function loadRememberedEmail() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      emailInput.value = saved;
      rememberCheck.checked = true;
    }
  } catch (error) {
    // Si el navegador bloquea el almacenamiento, simplemente no se recuerda nada
    console.warn("No se pudo leer el almacenamiento local.", error);
  }
}

function saveOrForgetEmail(email) {
  try {
    if (rememberCheck.checked) {
      localStorage.setItem(STORAGE_KEY, email); // solo el correo
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn("No se pudo escribir en el almacenamiento local.", error);
  }
}

/* ----------------------------------------------------------
   ENLACE "¿OLVIDASTE TU CONTRASEÑA?"
   En la práctica solo muestra un aviso (no hay servidor).
   ---------------------------------------------------------- */
forgotLink.addEventListener("click", (event) => {
  event.preventDefault(); // evita que el enlace "#" mueva la página
  showStatus(
    "Función de práctica: aquí se enviaría un enlace para restablecer tu contraseña.",
    "info"
  );
});

/* ----------------------------------------------------------
   ENVÍO DEL FORMULARIO
   ---------------------------------------------------------- */
form.addEventListener("submit", (event) => {
  // 1) Evita que el formulario se envíe o recargue la página
  event.preventDefault();
  clearStatus();

  // 2) Valida ambos campos (se evalúan los dos para mostrar todos los errores a la vez)
  const emailOk = checkField(emailInput, emailError, validateEmail);
  const passwordOk = checkField(passwordInput, passwordError, validatePassword);

  // 3) Si hay errores, se detiene y se lleva el foco al primer campo inválido
  if (!emailOk || !passwordOk) {
    (!emailOk ? emailInput : passwordInput).focus();
    return;
  }

  // 4) Datos con formato válido: mensaje de confirmación
  showStatus("Datos válidos. Verificando credenciales…", "info");
  submitBtn.disabled = true; // evita envíos repetidos mientras "verifica"

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // 5) Autenticación SIMULADA (solo didáctica). El retraso imita una consulta a un servidor.
  setTimeout(() => {
    const isValidUser =
      email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;

    if (isValidUser) {
      saveOrForgetEmail(email);
      showStatus("¡Bienvenido/a! Has iniciado sesión correctamente.", "success");
      passwordInput.value = ""; // no dejamos la contraseña en el campo
    } else {
      showStatus("Credenciales incorrectas. Revisa tu correo y contraseña.", "error");
      passwordInput.value = "";
      passwordInput.focus();
    }

    submitBtn.disabled = false;
  }, 700);
});

/* ----------------------------------------------------------
   INICIO: al cargar la página, recupera el correo recordado
   ---------------------------------------------------------- */
loadRememberedEmail();
