let intervaloContador = null;

verificarBloqueoExistente();

document.getElementById('formulario-contacto').addEventListener('submit', async function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const mensajeEstado = document.getElementById('mensaje-estado');
    const botonEnviar = document.getElementById('botonenviar');

    const MAX_INTENTOS = 3;
    const TIEMPO_BLOQUEO_MINUTOS = 10;
   
    let tiempoBloqueo = localStorage.getItem('tiempoBloqueo');
    if (tiempoBloqueo) {
        const tiempoRestante = new Date(tiempoBloqueo).getTime() - new Date().getTime();
        if (tiempoRestante > 0) {
            iniciarContadorVisual(tiempoRestante);
            return;
        }
    }

    limpiarMensaje();

    if (!usernameInput || !passwordInput) {
        mostrarMensaje('Por favor, completa todos los campos.', 'error');
        return;
    }

    try {
        botonEnviar.disabled = true;
        botonEnviar.textContent = 'Autenticando...';

        // Petición al endpoint de DummyJSON para login
        const response = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                expiresInMins: 30,
            })
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Servidor no disponible. Intenta más tarde.");
        }

        const data = await response.json();

        if (!response.ok) {
            let errorIngles = data.message || '';
            let errorEspañol = 'Usuario o contraseña incorrectos.';

            if (errorIngles.toLowerCase() === 'invalid credentials') {
                errorEspañol = 'Credenciales incorrectas. Verifica tus datos.';
            }
            throw new Error(errorEspañol);
        }

        localStorage.removeItem('intentosFallidos');
        localStorage.removeItem('tiempoBloqueo');

        mostrarMensaje(`¡Bienvenido, ${data.firstName} ${data.lastName}!`, 'exito');

        const tokenRecibido = data.accessToken || data.token;
        sessionStorage.setItem('userToken', tokenRecibido);
        sessionStorage.setItem('userData', JSON.stringify(data));

        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1200);


    } catch (error) {
        let intentosFallidos = parseInt(localStorage.getItem('intentosFallidos')) || 0;
        intentosFallidos++;
        localStorage.setItem('intentosFallidos', intentosFallidos);

        if (intentosFallidos >= MAX_INTENTOS) {
            const fechaDesbloqueo = new Date(new Date().getTime() + TIEMPO_BLOQUEO_MINUTOS * 60000);
            localStorage.setItem('tiempoBloqueo', fechaDesbloqueo.toISOString());
            
            const tiempoInicialMs = TIEMPO_BLOQUEO_MINUTOS * 60000;
            iniciarContadorVisual(tiempoInicialMs);
        } else {
            const mensajeFinal = `${error.message} (Intento ${intentosFallidos} de ${MAX_INTENTOS})`;
            mostrarMensaje(mensajeFinal, 'error');
        }

    } finally {
        botonEnviar.disabled = false;
        botonEnviar.textContent = 'Ingresar';
    }
});

function iniciarContadorVisual(tiempoRestanteMs) {
    const botonEnviar = document.getElementById('botonenviar');
    const bloqueoPantalla = document.getElementById('bloqueo-pantalla');
    const bloqueoTextoReloj = document.getElementById('bloqueo-texto-reloj');
    
    botonEnviar.disabled = true;
    botonEnviar.textContent = 'Bloqueado';

    bloqueoPantalla.style.display = 'flex';

    clearInterval(intervaloContador);
    let tiempoRestante = tiempoRestanteMs;

    function actualizarReloj() {
        if (tiempoRestante <= 0) {
            clearInterval(intervaloContador);
            localStorage.removeItem('tiempoBloqueo');
            localStorage.setItem('intentosFallidos', '0');
            
            botonEnviar.disabled = false;
            botonEnviar.textContent = 'Ingresar';
            
            bloqueoPantalla.style.display = 'none';
            limpiarMensaje();
            return;
        }

        const minutos = Math.floor(tiempoRestante / (1000 * 60));
        const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
        const segundosFormateados = segundos < 10 ? '0' + segundos : segundos;

        bloqueoTextoReloj.innerHTML = `Has superado el límite de intentos permitidos.<br><br>Por seguridad, espera <strong style="font-size: 1.2rem; color: #c72626;">${minutos}:${segundosFormateados}</strong> minutos para reintentar.`;

        tiempoRestante -= 1000;
    }

    actualizarReloj();
    intervaloContador = setInterval(actualizarReloj, 1000);
}

function verificarBloqueoExistente() {
    const tiempoBloqueo = localStorage.getItem('tiempoBloqueo');
    if (tiempoBloqueo) {
        const tiempoRestante = new Date(tiempoBloqueo).getTime() - new Date().getTime();
        if (tiempoRestante > 0) {
            window.addEventListener('DOMContentLoaded', () => {
                iniciarContadorVisual(tiempoRestante);
            });
        } else {
            localStorage.removeItem('tiempoBloqueo');
            localStorage.setItem('intentosFallidos', '0');
        }
    }
}

function mostrarMensaje(texto, tipo) {
    const mensajeEstado = document.getElementById('mensaje-estado');
    mensajeEstado.textContent = texto;
    mensajeEstado.className = 'mensaje-estado ' + tipo;
    mensajeEstado.style.display = 'block';
}

function limpiarMensaje() {
    const mensajeEstado = document.getElementById('mensaje-estado');
    const bloqueoPantalla = document.getElementById('bloqueo-pantalla');
    
    if(mensajeEstado) {
        mensajeEstado.className = 'mensaje-estado';
        mensajeEstado.style.display = 'none';
        mensajeEstado.textContent = '';
    }
    if(bloqueoPantalla) {
        bloqueoPantalla.style.display = 'none';
    }
}