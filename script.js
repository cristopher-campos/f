// ====================================================================================
//                                  GLOBAL VARIABLES
// ====================================================================================

// Estructura de datos para los usuarios. Usaremos un objeto para un acceso rápido por nombre.
// La clave es el nombre de usuario y el valor es un objeto con sus datos.
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
// Variable para mantener el nombre del usuario actual.
let usuarioActual = localStorage.getItem('usuarioActual') || null;

// Estructura de datos para las ofertas publicadas.
let ofertas = JSON.parse(localStorage.getItem('ofertas')) || [];

// Estructura de datos para los chats.
// La clave es el usuario y el valor es un objeto con sus conversaciones.
let chats = JSON.parse(localStorage.getItem('chats')) || {};

// ====================================================================================
//                                  DATA HANDLING
// ====================================================================================

/**
 * Saves all global data (users, offers, chats) to localStorage.
 * This function should be called after any data modification.
 */
function saveData() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('ofertas', JSON.stringify(ofertas));
    localStorage.setItem('chats', JSON.stringify(chats));
}

// ====================================================================================
//                                  SCREEN MANAGEMENT
// ====================================================================================

/**
 * Manages the display of different screens in the application.
 * Hides all screens and shows only the one with the specified ID.
 * @param {string} screenId - The ID of the screen to display.
 */
function mostrarPantalla(screenId) {
    // Esconde todas las pantallas con la clase 'screen'
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
    });
    // Muestra la pantalla solicitada
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active-screen');
    }
}

// ====================================================================================
//                                 LOGIN & REGISTER
// ====================================================================================

/**
 * Handles the user login process.
 */
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (usuarios[username] && usuarios[username].password === password) {
        usuarioActual = username;
        localStorage.setItem('usuarioActual', usuarioActual);
        document.getElementById('saludoUsuario').textContent = `¡Hola, ${usuarioActual}!`;
        mostrarPantalla('menu-principal');
        console.log(`Usuario ${username} ha iniciado sesión.`);
    } else {
        showMessage('Usuario o contraseña incorrectos.');
    }
});

/**
 * Handles the user registration process.
 */
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (usuarios[username]) {
        showMessage('Este usuario ya existe. Por favor, elige otro.');
    } else {
        usuarios[username] = {
            password: password,
            profile: {
                slogan: "Un nuevo usuario en ChambAPP!",
                privado: false,
                biografia: "",
                contacto: "",
                fotoPerfil: "https://via.placeholder.com/120/1a1a2e/e0e0e0?text=👤",
                rank: "new",
                calificaciones: [],
                ubicacion: ""
            },
            ofertasUsuario: [],
            chats: {},
            notificaciones: []
        };
        saveData();
        showMessage('Registro exitoso. ¡Ahora puedes iniciar sesión!');
        document.getElementById('registerForm').reset();
    }
});

/**
 * Handles the "Switch to Register" button.
 */
document.getElementById('switchToRegisterBtn').addEventListener('click', () => {
    mostrarPantalla('register-screen');
});

/**
 * Handles the "Switch to Login" button.
 */
document.getElementById('switchToLoginBtn').addEventListener('click', () => {
    mostrarPantalla('login-register');
});

// ====================================================================================
//                                   MAIN MENU
// ====================================================================================

document.getElementById('btnMenu').addEventListener('click', () => {
    cargarPerfil();
    mostrarPantalla('perfil-screen');
});

document.getElementById('btnPublicar').addEventListener('click', () => {
    mostrarPantalla('publicar-screen');
});

document.getElementById('btnExplorar').addEventListener('click', () => {
    mostrarOfertas();
    mostrarPantalla('explorar-screen');
});

document.getElementById('btnChat').addEventListener('click', () => {
    mostrarChats();
    mostrarPantalla('chat-list-screen');
});

document.getElementById('btnNotificaciones').addEventListener('click', () => {
    mostrarNotificaciones();
    mostrarPantalla('notificaciones-screen');
});

// ====================================================================================
//                                   PROFILE SCREEN
// ====================================================================================

/**
 * Loads and displays the current user's profile information.
 */
function cargarPerfil() {
    if (!usuarioActual) return;
    const userProfile = usuarios[usuarioActual].profile;

    document.getElementById('profileImage').src = userProfile.fotoPerfil;
    document.getElementById('profileName').textContent = usuarioActual;
    document.getElementById('profileRank').textContent = userProfile.rank;
    document.getElementById('profileSlogan').textContent = userProfile.slogan;
    document.getElementById('profileBiografia').textContent = userProfile.biografia || 'Sin biografía.';
    document.getElementById('profileContacto').textContent = userProfile.contacto || 'Sin contacto.';
    document.getElementById('profileUbicacion').textContent = userProfile.ubicacion || 'Sin ubicación.';

    const calificacionesContainer = document.getElementById('profileCalificaciones');
    calificacionesContainer.innerHTML = '';
    const avgRating = userProfile.calificaciones.length > 0
        ? userProfile.calificaciones.reduce((sum, val) => sum + val, 0) / userProfile.calificaciones.length
        : 0;
    calificacionesContainer.innerHTML = generarEstrellas(avgRating);
}

/**
 * Generates a string of star icons based on a rating value.
 * @param {number} rating - The rating value (0 to 5).
 * @returns {string} HTML string with star icons.
 */
function generarEstrellas(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<span class="filled">★</span>';
        } else {
            starsHtml += '<span class="empty">★</span>';
        }
    }
    return starsHtml;
}

/**
 * Toggles the profile edit mode.
 */
document.getElementById('editProfileBtn').addEventListener('click', () => {
    const profileDetails = document.getElementById('profileDetails');
    const editForm = document.getElementById('editProfileForm');

    profileDetails.classList.toggle('hidden');
    editForm.classList.toggle('hidden');

    if (!editForm.classList.contains('hidden')) {
        const userProfile = usuarios[usuarioActual].profile;
        document.getElementById('editSlogan').value = userProfile.slogan;
        document.getElementById('editBiografia').value = userProfile.biografia;
        document.getElementById('editContacto').value = userProfile.contacto;
        document.getElementById('editUbicacion').value = userProfile.ubicacion;
    }
});

/**
 * Saves the edited profile information.
 */
document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!usuarioActual) return;

    const newSlogan = document.getElementById('editSlogan').value;
    const newBiografia = document.getElementById('editBiografia').value;
    const newContacto = document.getElementById('editContacto').value;
    const newUbicacion = document.getElementById('editUbicacion').value;

    usuarios[usuarioActual].profile.slogan = newSlogan;
    usuarios[usuarioActual].profile.biografia = newBiografia;
    usuarios[usuarioActual].profile.contacto = newContacto;
    usuarios[usuarioActual].profile.ubicacion = newUbicacion;

    saveData();
    cargarPerfil();
    mostrarPantalla('perfil-screen');
    showMessage('Perfil actualizado exitosamente.');
});

// ====================================================================================
//                                 PUBLISH OFFER
// ====================================================================================

/**
 * Handles the form submission for creating a new offer.
 */
document.getElementById('publicarForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = document.getElementById('inputTitulo').value;
    const descripcion = document.getElementById('inputDescripcion').value;
    const categoria = document.getElementById('inputCategoria').value;
    const precio = document.getElementById('inputPrecio').value;
    const tipo = document.getElementById('inputTipo').value;
    const imagen = document.getElementById('inputImagen').value;
    const isRopa = document.getElementById('isRopaCheckbox').checked;

    let talla = 'No aplica';
    let genero = 'No aplica';
    if (isRopa) {
        talla = document.getElementById('inputTalla').value;
        genero = document.getElementById('inputGenero').value;
    }

    const nuevaOferta = {
        id: Date.now(),
        autor: usuarioActual,
        titulo,
        descripcion,
        categoria,
        precio,
        tipo,
        imagen: imagen || 'https://via.placeholder.com/200/4a4a6b/e0e0e0?text=NO+IMAGE',
        isRopa,
        talla,
        genero,
        fecha: new Date().toISOString().slice(0, 10),
        interesados: []
    };

    ofertas.push(nuevaOferta);
    usuarios[usuarioActual].ofertasUsuario.push(nuevaOferta.id);
    saveData();

    showMessage('Oferta publicada con éxito!');
    document.getElementById('publicarForm').reset();
    document.getElementById('ropa-fields').classList.add('hidden');
    mostrarPantalla('menu-principal');
});

/**
 * Toggles the visibility of clothing-related fields.
 */
document.getElementById('isRopaCheckbox').addEventListener('change', (e) => {
    const ropaFields = document.getElementById('ropa-fields');
    if (e.target.checked) {
        ropaFields.classList.remove('hidden');
    } else {
        ropaFields.classList.add('hidden');
        document.getElementById('inputTalla').value = 'No aplica';
        document.getElementById('inputGenero').value = 'No aplica';
    }
});

// ====================================================================================
//                                  EXPLORE/OFFERS
// ====================================================================================

/**
 * Displays all available offers in the `explorar-screen`.
 */
function mostrarOfertas() {
    const grid = document.getElementById('ofertasGrid');
    grid.innerHTML = ''; // Limpiar ofertas existentes

    ofertas.forEach(oferta => {
        const card = document.createElement('div');
        card.className = 'offer-card';
        card.setAttribute('data-offer-id', oferta.id);
        card.innerHTML = `
            <img src="${oferta.imagen}" alt="${oferta.titulo}" class="offer-card-image">
            <h3>${oferta.titulo}</h3>
            <p>${oferta.descripcion}</p>
            <p class="price">$${oferta.precio}</p>
        `;
        grid.appendChild(card);
    });

    // Añade el evento de clic a las tarjetas
    document.querySelectorAll('.offer-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const offerId = e.currentTarget.getAttribute('data-offer-id');
            const ofertaSeleccionada = ofertas.find(o => o.id == offerId);
            if (ofertaSeleccionada) {
                cargarDetallesOferta(ofertaSeleccionada);
                mostrarPantalla('oferta-detalles-screen');
            }
        });
    });
}

/**
 * Displays the details of a single offer.
 * @param {object} offer - The offer object to display.
 */
function cargarDetallesOferta(offer) {
    document.getElementById('detalleTitulo').textContent = offer.titulo;
    document.getElementById('detalleDescripcion').textContent = offer.descripcion;
    document.getElementById('detallePrecio').textContent = `$${offer.precio}`;
    document.getElementById('detalleAutor').textContent = `Autor: ${offer.autor}`;
    document.getElementById('detalleCategoria').textContent = `Categoría: ${offer.categoria}`;
    document.getElementById('detalleTipo').textContent = `Tipo: ${offer.tipo}`;
    document.getElementById('detalleImagen').src = offer.imagen;

    const detallesAdicionales = document.getElementById('detallesAdicionales');
    detallesAdicionales.innerHTML = '';
    if (offer.isRopa) {
        detallesAdicionales.innerHTML = `<p>Talla: ${offer.talla}</p><p>Género: ${offer.genero}</p>`;
    }

    const contactBtn = document.getElementById('contactarBtn');
    contactBtn.onclick = () => {
        iniciarChat(offer.autor);
    };
}

// ====================================================================================
//                                  CHAT & NOTIFICATIONS
// ====================================================================================

/**
 * Displays a list of existing chat conversations.
 */
function mostrarChats() {
    const chatListContainer = document.getElementById('chatListContainer');
    chatListContainer.innerHTML = '';

    const userChats = chats[usuarioActual] || {};
    const chatPartners = Object.keys(userChats);

    chatPartners.forEach(partner => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.innerHTML = `<p>${partner}</p>`;
        chatItem.addEventListener('click', () => {
            cargarChat(partner);
        });
        chatListContainer.appendChild(chatItem);
    });
}

/**
 * Loads and displays a specific chat conversation.
 * @param {string} partnerId - The ID of the chat partner.
 */
function cargarChat(partnerId) {
    const messagesContainer = document.getElementById('chatMessagesContainer');
    messagesContainer.innerHTML = '';
    document.getElementById('chatPartnerName').textContent = partnerId;

    const conversation = (chats[usuarioActual] && chats[usuarioActual][partnerId]) || [];

    conversation.forEach(message => {
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${message.sender === usuarioActual ? 'my-message' : 'other-message'}`;
        messageBubble.textContent = message.text;
        messagesContainer.appendChild(messageBubble);
    });

    // Desplazarse al final de los mensajes
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    mostrarPantalla('chat-screen');

    // Manejar el envío de mensajes
    const chatForm = document.getElementById('chatForm');
    chatForm.onsubmit = (e) => {
        e.preventDefault();
        enviarMensaje(partnerId);
    };
}

/**
 * Sends a new message in the current chat.
 * @param {string} receiverId - The ID of the recipient.
 */
function enviarMensaje(receiverId) {
    const messageInput = document.getElementById('chatMessageInput');
    const messageText = messageInput.value.trim();

    if (messageText === '') return;

    // Crear el mensaje
    const newMessage = {
        sender: usuarioActual,
        text: messageText,
        timestamp: Date.now()
    };

    // Agregar el mensaje al chat del remitente
    if (!chats[usuarioActual]) chats[usuarioActual] = {};
    if (!chats[usuarioActual][receiverId]) chats[usuarioActual][receiverId] = [];
    chats[usuarioActual][receiverId].push(newMessage);

    // Agregar el mensaje al chat del receptor (simulando un chat real)
    if (!chats[receiverId]) chats[receiverId] = {};
    if (!chats[receiverId][usuarioActual]) chats[receiverId][usuarioActual] = [];
    chats[receiverId][usuarioActual].push(newMessage);

    saveData();
    messageInput.value = '';
    cargarChat(receiverId); // Recargar el chat para mostrar el nuevo mensaje
}

/**
 * Initiates a new chat conversation with a specific user.
 * @param {string} targetUser - The user to start the chat with.
 */
function iniciarChat(targetUser) {
    if (targetUser === usuarioActual) {
        showMessage('No puedes chatear contigo mismo.');
        return;
    }
    // Si el chat ya existe, simplemente cárgalo
    if (chats[usuarioActual] && chats[usuarioActual][targetUser]) {
        cargarChat(targetUser);
    } else {
        // Si no, crea un nuevo chat y cárgalo
        if (!chats[usuarioActual]) chats[usuarioActual] = {};
        chats[usuarioActual][targetUser] = [];
        saveData();
        cargarChat(targetUser);
    }
}

/**
 * Displays a list of notifications for the current user.
 */
function mostrarNotificaciones() {
    const notifContainer = document.getElementById('notifListContainer');
    notifContainer.innerHTML = '';
    const notificacionesUsuario = usuarios[usuarioActual]?.notificaciones || [];

    if (notificacionesUsuario.length === 0) {
        notifContainer.innerHTML = '<p>No tienes notificaciones.</p>';
        return;
    }

    notificacionesUsuario.forEach(notif => {
        const notifItem = document.createElement('div');
        notifItem.className = 'notification-item';
        notifItem.innerHTML = `<p>${notif.mensaje}</p>`;
        notifContainer.appendChild(notifItem);
    });
}

// ====================================================================================
//                                     UTILITY
// ====================================================================================

/**
 * Displays a temporary message box to the user.
 * @param {string} message - The message to display.
 */
function showMessage(message) {
    const modal = document.getElementById('messageModal');
    const messageText = document.getElementById('modalMessageText');
    messageText.textContent = message;
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000); // Esconde el modal después de 3 segundos
}

document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('messageModal').style.display = 'none';
});

// ====================================================================================
//                                     INITIALIZATION
// ====================================================================================

// Initialization on page load
document.addEventListener('DOMContentLoaded', () => {
    // Attempt to load usuarioActual from localStorage on page load
    const storedUsuario = localStorage.getItem('usuarioActual');
    if (storedUsuario) {
        usuarioActual = storedUsuario;
    }

    // Ensure all existing users have a complete profile structure
    for (const userKey in usuarios) {
        const defaultProfile = {
            slogan: "Un nuevo usuario en ChambAPP!",
            privado: false,
            biografia: "",
            contacto: "",
            fotoPerfil: "https://via.placeholder.com/120/1a1a2e/e0e0e0?text=👤",
            rank: "new",
            calificaciones: []
        };
        usuarios[userKey].profile = { ...defaultProfile, ...usuarios[userKey].profile };
    }

    // Initialize UI based on login status
    if (usuarioActual && usuarios[usuarioActual]) {
        document.getElementById('saludoUsuario').textContent = `¡Hola, ${usuarioActual}!`;
        mostrarPantalla('menu-principal');
    } else {
        mostrarPantalla('login-register');
    }

    // Set default values for ropa fields on load
    document.getElementById('isRopaCheckbox').checked = false;
    document.getElementById('ropa-fields').classList.add('hidden');
    document.getElementById('inputTalla').value = 'No aplica';
    document.getElementById('inputGenero').value = 'No aplica';

    // Set up back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentScreen = btn.closest('.screen');
            if (currentScreen) {
                const prevScreenId = currentScreen.getAttribute('data-prev-screen');
                if (prevScreenId) {
                    mostrarPantalla(prevScreenId);
                } else {
                    mostrarPantalla('menu-principal');
                }
            }
        });
    });

    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        usuarioActual = null;
        localStorage.removeItem('usuarioActual');
        showMessage('Sesión cerrada.');
        mostrarPantalla('login-register');
    });

    // Initial data save to ensure consistency
    saveData();
});
