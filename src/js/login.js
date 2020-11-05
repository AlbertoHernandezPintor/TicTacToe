eventsHandler();

/* ************************ */
/*        Funciones         */
/* ************************ */

// Función que añade todos los eventos de elementos del html
function eventsHandler() {
    document.querySelector('#login-form').addEventListener("submit", function(){login()});
    document.querySelector('#register-form').addEventListener("submit", function(){register()});
}

// Función que realiza todo lo necesario para el login
function login() {
    event.preventDefault();
    var username = document.querySelector('#login-username').value;
    var password = document.querySelector('#login-password').value;

    var alertsHandler = new AlertsHandler();
    var login = new Login();
    login.login(username, password, alertsHandler);
}

// Función que realiza todo lo necesario para el registro
function register() {
    event.preventDefault();
    var username = document.querySelector('#register-username').value;
    var password = document.querySelector('#register-password').value;
    var secondPassword = document.querySelector('#register-second-password').value;
    
    var alertsHandler = new AlertsHandler();
    var register = new Register();
    register.saveNewUser(username, password, secondPassword, alertsHandler);
}

/* ************************ */
/*          Clases          */
/* ************************ */

// Clase que maneja el regsitro
class Login {

    constructor() {
    }

    login(username, password, alertsHandler) {
        var loginDiv = document.querySelector('.login');
        if (username === "" || password === "") {
            alertsHandler.createAlert("No has introducido todos los datos necesarios", loginDiv, "alert-warning");
        } else if (localStorage.getItem(username) === null) {
            alertsHandler.createAlert("El usuario introducido no existe", loginDiv, "alert-danger");
        } else {
            var user = JSON.parse(localStorage.getItem(username));
            
            if (atob(user.password) !== password) {
                alertsHandler.createAlert("La contraseña no es correcta", loginDiv, "alert-danger");
            }

            sessionStorage.setItem(username, btoa(password));

            document.location.target = "_self";
            document.location.href = "index.html?username=" + username;
        }
    }
}

// Clase que maneja el regsitro
class Register {

    constructor() {
    }

    saveNewUser(username, password, secondPassword, alertsHandler) {
        var registerDiv = document.querySelector('.register');
        if (username === "" || password === "" || secondPassword === "") {
            alertsHandler.createAlert("No has introducido todos los datos necesarios", registerDiv, "alert-warning");
        } else if (localStorage.getItem(username) !== null) {
            alertsHandler.createAlert("El nombre de usuario ya existe", registerDiv, "alert-danger");
        }else if (password !== secondPassword) {
            alertsHandler.createAlert("Las contraseñas no coinciden", registerDiv, "alert-danger");
        } else {
            var register = { 'username': username, 'password': btoa(password) };
            localStorage.setItem(username, JSON.stringify(register));

            document.querySelector('#register-username').value = "";
            document.querySelector('#register-password').value = "";
            document.querySelector('#register-second-password').value = "";

            alertsHandler.createAlert("Usuario registrado correctamente", registerDiv, "alert-success");
        }
    }
}

// Clase que maneja la creación de alertas
class AlertsHandler {

    constructor() {
    }

    createAlert(text, container, type) {
        if (document.querySelector(".alert") === null) {
            var alert = document.createElement('div');
            alert.classList.add("alert");
            alert.classList.add(type);
            alert.classList.add("alert-dismissible");
            alert.classList.add("fade");
            alert.classList.add("show");
            alert.style.margin = 'auto';
            alert.style.marginTop = '1em';
            alert.setAttribute('role', "alert");
            alert.innerText = text;
    
            var alertButton = document.createElement('button');
            alertButton.classList.add("close");
            alertButton.setAttribute('type', "button");
            alertButton.setAttribute('data-dismiss', "alert");
            alertButton.setAttribute('aria-label', "close");
    
            var spanButton = document.createElement('span');
            spanButton.setAttribute('aria-hidden', "true");
            spanButton.innerHTML = "&times;";
    
            alertButton.appendChild(spanButton);
            alert.appendChild(alertButton);
            container.appendChild(alert);
        }  
    }
}