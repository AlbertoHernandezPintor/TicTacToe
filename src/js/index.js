eventsHandler();

/* ************************ */
/*        Funciones         */
/* ************************ */

// Función que añade todos los eventos de elementos del html
function eventsHandler() {
    if (sessionStorage.length === 0) {
        document.location.target = "_self";
        document.location.href = "error.html";
    }
    document.querySelector('.radio-onePlayer').addEventListener("click", function(){playerSelected()});
    document.querySelector('.stats').addEventListener("click", function(){goToStats()});
    document.querySelector('.sign-out').addEventListener("click", function(){signOut()});
    document.querySelector('.radio-twoPlayers').addEventListener("click", function(){playerSelected()});
    document.querySelector('.submit-button').addEventListener("click", function(){formSubmit()});
    document.querySelector('.reset-button').addEventListener("click", function(){resetMatch()});

    cameraHandler();
}

// Función que maneja todo lo relacionado con la cámara
function cameraHandler() {
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'user', canvasElement);

    webcam.start();
}

// Función para ir a las estadíticas
function goToStats() {
    let url = new URL(document.location.href);
    var username = url.searchParams.get("username");

    document.location.target = "_self";
    document.location.href = "stats.html?username=" + username;
}

// Función para cerrar sesión
function signOut() {
    let url = new URL(document.location.href);
    var username = url.searchParams.get("username");

    sessionStorage.removeItem(username);

    document.location.target = "_self";
    document.location.href = "login.html";
}

// Función que se ejecuta cuando pulsamos sobre el botón comenzar partida
function formSubmit() {
    var alertsHandler = new AlertsHandler();

    // Obtenemos las lista de radio buttons tanto del modo de juego como de la dificultad
    var arrayGameMode = document.querySelectorAll('input[name="radio-gameMode"]:checked')[0];
    var arrayGameDifficulty = document.querySelectorAll('input[name="radio-difficulty"]:checked')[0];

    // Comprobamos si se han introducdo correctamente todos los datos necesarios, en caso negativo mensaje de error, en caso afirmativo
    // se puede empezar la partida
    if (arrayGameMode === undefined) {
        var gameModeDiv = document.querySelector('.gameMode');
        alertsHandler.createAlert("Seleccione un modo de juego", gameModeDiv, "alert-warning");
    } else if (arrayGameDifficulty === undefined && arrayGameMode.id === "onePlayer"){
        var difficultyDiv = document.querySelector('.difficulty');
        alertsHandler.createAlert("Seleccione una dificultad", difficultyDiv, "alert-warning");
    } else {
        var gameMode = arrayGameMode.id;

        if (arrayGameDifficulty !== undefined) {
            var gameDifficulty = arrayGameDifficulty.id;
        }

        // Si queda alguna alerta abierta la cerramos
        var confAlert = document.querySelector('.alert');
        if(confAlert !== null) {
            parent = confAlert.parentNode;
            document.querySelector("." + parent.id).removeChild(confAlert);
        }

        // Deshabilitamos el form mientras se juega
        var formControl = document.querySelector('#form-control');
        formControl.classList.add("disable");

        // Habilitamos el botón de resetear partida
        var resetControl = document.querySelector('.reset-button');
        resetControl.classList.remove("disable");

        // Creamos el objeto partida
        var match = new Match(gameMode, gameDifficulty, 1, {"00": 0, "01": 0, "02": 0, "10": 0, "11": 0, "12": 0, "20": 0, "21": 0, "22": 0},
        ["00", "01", "02", "10", "11", "12", "20", "21", "22"], 0);

        let url = new URL(document.location.href);
        var username = url.searchParams.get("username");
        if (gameMode === "onePlayer") {
            const webcamElement = document.getElementById('webcam');
            const canvasElement = document.getElementById('canvas');
            const webcam = new Webcam(webcamElement, 'user', canvasElement);
            var picture = webcam.snap();

            match.incrementMatches(username, "init");
        } else {
            var picture = "../../assets/images/cross.png";
        }

        var iaHandler = new IaHandler();
        var indexHandler = new IndexHandler();
        var gameHandler = new GameHandler();
        gameHandler.createTable(match, indexHandler, iaHandler, alertsHandler, username, picture);
    }
} 

// Función que resetea la partida
function resetMatch() {
    // Habilitamos el form 
    var formControl = document.querySelector('#form-control');
    formControl.classList.remove("disable");

    // Deshabilitamos el botón de resetear partida
    var resetControl = document.querySelector('.reset-button');
    resetControl.classList.add("disable");

    // Eliminar tablero actual
    var gameTable = document.querySelector('table');
    document.querySelector('#game-table').removeChild(gameTable);

    // Borramos la alerta de ganador
    var winAlert = document.querySelector('.alert');
    if (winAlert !== null) {
        document.querySelector('#game-table').removeChild(winAlert);
    }

    if (winAlert === null) {
        var match = new Match();
        let url = new URL(document.location.href);
        var username = url.searchParams.get("username");
        match.incrementMatches(username, "giveUp");
    }
}

// Función para saber si hay que elegir dificultad o no en función del modo de juego
function playerSelected() {
    var arrayGameMode = document.querySelectorAll('input[name="radio-gameMode"]');

    // Recorremos el primer array de radio buttons (Modo de juego) en busca del checkeado
    for (const gameMode of arrayGameMode) {
        if (gameMode.checked === true) {
            var selectedGameMode = gameMode.id;
        }
    }

    var difficultyRadios = document.querySelector('.difficulty');
    if (selectedGameMode === "onePlayer") {
        difficultyRadios.classList.remove("disable");
    } else {
        difficultyRadios.classList.add("disable");
    }
}

/* ************************ */
/*          Clases          */
/* ************************ */

// Clase que alamacena los datos de la partida
class Match {

    constructor (gameMode, gameDifficulty, playerTurn, gameState, freeOptions, winner) {
        this.gameMode = gameMode;
        this.gameDifficulty = gameDifficulty;
        this.playerTurn = playerTurn;
        this.gameState = gameState;
        this.freeOptions = freeOptions;
        this. winner = winner;
    }

    // Función que elimina posiciones ocupadas
    deleteFreeOption(option, match) {
        for (var i = 0; i < match.freeOptions.length; i++) {
            if (match.freeOptions[i] === option) {
                match.freeOptions.splice(i, 1);
            }
        }
    }

    // Función que muestra quien ha ganado en casa de que haya un ganador
    checkPlay(match, indexHandler, alertsHandler, username) {
        match.checkVictory(match, indexHandler);

        if (match.winner === 1) {
            var gameTable = document.querySelector('#game-table');
            if (match.gameMode === "twoPlayers") {
                alertsHandler.createAlert("Ha ganado el jugador 1 (Aspas)", gameTable, "alert-success");
            } else {
                alertsHandler.createAlert("Ha ganado el jugador 1", gameTable, "alert-success");
            }
            var table = document.querySelector('table');
            table.classList.add("disable");
            if (match.gameMode === "onePlayer") {
                match.incrementMatches(username, "win")
            }
        } else if (match.winner === 2) {
            var gameTable = document.querySelector('#game-table');
            alertsHandler.createAlert("Ha ganado el jugador 2 (Círculos)", gameTable, "alert-success");
            var table = document.querySelector('table');
            table.classList.add("disable");
            if (match.gameMode === "onePlayer") {
                match.incrementMatches(username, "lost")
            }
        } else if (match.freeOptions.length === 0 && match.winner !== 1 && match.winner !== 2) {
            var gameTable = document.querySelector('#game-table');
            alertsHandler.createAlert("Empate!", gameTable, "alert-success");
            var table = document.querySelector('table');
            table.classList.add("disable");
            match.winner = 3;
            if (match.gameMode === "onePlayer") {
                match.incrementMatches(username, "tie")
            }
        }
    }

    // Función que comprueba si hay victoria
    checkVictory(match, indexHandler) {
        // Horizontal
        for (let i = 0; i < 3; i++) {
            if (indexHandler.equalsIndex(match.gameState[indexHandler.createIndex(i,0)], match.gameState[indexHandler.createIndex(i,1)], match.gameState[indexHandler.createIndex(i,2)])) {
                match.winner = match.gameState[indexHandler.createIndex(i,0)];
                break;
            }
        }

        //Vertical
        for (let i = 0; i < 3; i++) {
            if (indexHandler.equalsIndex(match.gameState[indexHandler.createIndex(0,i)], match.gameState[indexHandler.createIndex(1,i)], match.gameState[indexHandler.createIndex(2,i)])) {
                match.winner = match.gameState[indexHandler.createIndex(0,i)];
                break;
            }
        }

        //Diagonal
        if (indexHandler.equalsIndex(match.gameState[indexHandler.createIndex(0,0)], match.gameState[indexHandler.createIndex(1,1)], match.gameState[indexHandler.createIndex(2,2)])) {
            match.winner = match.gameState[indexHandler.createIndex(0,0)];
        } else if (indexHandler.equalsIndex(match.gameState[indexHandler.createIndex(2,0)], match.gameState[indexHandler.createIndex(1,1)], match.gameState[indexHandler.createIndex(0,2)])) {
            match.winner = match.gameState[indexHandler.createIndex(2,0)];
        }
    }

    // Función que devuelve que posición defender para evitar vistoria
    checkPosibleVictory(match, indexHandler) {
        let position = null;

        // Horizontal
        for (let i = 0; i < 3; i++) {
            if ((indexHandler.equalsTwoIndex(match.gameState[indexHandler.createIndex(i,0)], match.gameState[indexHandler.createIndex(i,1)], match.gameState[indexHandler.createIndex(i,2)])) && position === null) {
                if (match.gameState[indexHandler.createIndex(i,0)] === 0) {
                    position = indexHandler.createIndex(i,0);
                } else if (match.gameState[indexHandler.createIndex(i,1)] === 0) {
                    position = indexHandler.createIndex(i,1);
                } else  {
                    position = indexHandler.createIndex(i,2);
                }
                break;
            }
        }

        //Vertical
        for (let i = 0; i < 3; i++) {
            if ((indexHandler.equalsTwoIndex(match.gameState[indexHandler.createIndex(0,i)], match.gameState[indexHandler.createIndex(1,i)], match.gameState[indexHandler.createIndex(2,i)])) && position === null) {
                if (match.gameState[indexHandler.createIndex(0,i)] === 0) {
                    position = indexHandler.createIndex(0,i);
                } else if (match.gameState[indexHandler.createIndex(1,i)] === 0) {
                    position = indexHandler.createIndex(1,i);
                } else  {
                    position = indexHandler.createIndex(2,i);
                }
                break;
            }
        }

        //Diagonal
        if ((indexHandler.equalsTwoIndex(match.gameState[indexHandler.createIndex(0,0)], match.gameState[indexHandler.createIndex(1,1)], match.gameState[indexHandler.createIndex(2,2)])) && position === null) {
            if (match.gameState[indexHandler.createIndex(0,0)] === 0) {
                position = indexHandler.createIndex(0,0);
            } else if (match.gameState[indexHandler.createIndex(1,1)] === 0) {
                position = indexHandler.createIndex(1,1);
            } else  {
                position = indexHandler.createIndex(2,2);
            }
        } else if ((indexHandler.equalsTwoIndex(match.gameState[indexHandler.createIndex(2,0)], match.gameState[indexHandler.createIndex(1,1)], match.gameState[indexHandler.createIndex(0,2)])) && position === null) {
            if (match.gameState[indexHandler.createIndex(2,0)] === 0) {
                position = indexHandler.createIndex(2,0);
            } else if (match.gameState[indexHandler.createIndex(1,1)] === 0) {
                position = indexHandler.createIndex(1,1);
            } else  {
                position = indexHandler.createIndex(0,2);
            }
        }

        return position;
    }

    // Función que calcula si alguien gana o se empata para el algoritmo minimax
    checkWinner(match, indexHandler) {
        var winner = null;

        match.checkVictory(match, indexHandler);

        if (match.winner === 1) {
            winner = -1;
        } else if (match.winner === 2) {
            winner = 1;
        } 

        var emptyPositions = [];
        for (var key in match.gameState) {
            if (match.gameState[key] === 0) {
                emptyPositions.push(key);
            }
        }
        
        match.winner = 0;
        if (winner === null && emptyPositions.length === 0) {
            return 0;
        } else  {
            return winner;
        }
    }

    // Función que incrementa las estadíticas
    incrementMatches(username, type) {
        if (localStorage.getItem(username + "Stats") === null) {
            var stats = {'total': 1, 'wins': 0, 'lost': 0, 'tie': 0, 'giveUp': 0};
            localStorage.setItem(username + "Stats", JSON.stringify(stats));
        } else {
            var stats = JSON.parse(localStorage.getItem(username + "Stats"));
            if (type === "init") {
                stats.total += 1;
            } else if (type === "giveUp") {
                stats.giveUp += 1;
            } else if (type === "win") {
                stats.wins += 1;
            } else if (type === "lost") {
                stats.lost += 1;
            } else if (type === "tie") {
                stats.tie += 1;
            }
            localStorage.setItem(username + "Stats", JSON.stringify(stats));
        }
    }
}

// Clase para el manejo de indices
class IndexHandler {

    constructor () {
    }

    createIndex(number1, number2) {
        return number1.toString() + number2.toString();
    }

    equalsIndex(index1, index2, index3) {
        if (index1 !== 0 || index2 !== 0 || index3 !== 0) {
            return (index1 === index2 && index2 === index3 && index1 === index3);
        } else {
            return false;
        }
    }

    equalsTwoIndex(index1, index2, index3) {
        if (index1 !== 0 && index2 !== 0 || index2 !== 0 && index3 !== 0 || index1 !== 0 && index3 !== 0) {
            if (index1 !== 2 && index2 !==2 && index3 !== 2) {
                return (index1 === index2 || index2 === index3 || index1 === index3);
            }
        } else {
            return false
        }
    }
}

// Clase que maneja el escenario de juego
class GameHandler {

    constructor() {
    }

    // Función que recibe la fila y la columna pulsada para saber donde poner la ficha correspondiente
    static setTableBox(row, col, match, indexHandler, iaHandler, alertsHandler, username, picture) {
        var index = indexHandler.createIndex(row, col);
        var boxClass = "." + "box" + index;
        var clickedBox = document.querySelector(boxClass);
        clickedBox.classList.add("no-events");

        var image = document.createElement('img');

        // Comprobamos si la casilla ya contiene una imagen
        if (match.gameState[index] === 0) {

            // Comprobamos el modo en el que estamos y el turno para saber como actuar
            if (match.playerTurn === 1 && (match.gameMode === "twoPlayers" || match.gameMode === "onePlayer")) {
                image.setAttribute('alt', 'imagen de un aspa');
                image.setAttribute('src', picture);
                if (match.gameMode === "twoPlayers") {
                    image.style.width = "60%";
                    image.style.height = "10%";
                } else {
                    image.style.width = "80%";
                    image.style.height = "50%";
                }
                match.playerTurn = 2;
                match.gameState[index] = 1;
            } else if ( match.playerTurn === 2 && match.gameMode === "twoPlayers"){
                image.setAttribute('alt', 'imagen de un círculo');
                image.setAttribute('src', "../../assets/images/circle.png");
                image.style.width = "80%";
                image.style.height = "10%";
                match.playerTurn = 1;
                match.gameState[index] = 2;
            }
        }

        clickedBox.appendChild(image);
        match.deleteFreeOption(index, match);
        match.checkPlay(match, indexHandler, alertsHandler, username);
        if (match.gameMode === "onePlayer" && match.winner === 0) {
            iaHandler.iaPlay(match, indexHandler, alertsHandler, username);
        }
    }
        
    // Función que crea el tablero de partida
    createTable(match, indexHandler, iaHandler, alertsHandler, username, picture) {
        // Creamos la tabla y sus atributos
        var gameTable = document.createElement('table');
        gameTable.style.width = '50vh';
        gameTable.style.height = '50vh';
        gameTable.style.margin = 'auto';
        gameTable.setAttribute('border', '1');

        // Creamos el cuerpo de la tabla
        var tableBody = document.createElement('tbody');

        // Creamos las filas
        for (var i = 0; i < 3; i++) {
            var tr = document.createElement('tr');

            //Creamos las columnas
            for (var j = 0; j < 3; j++) {
                var td = document.createElement('td');
                td.classList.add("box" + indexHandler.createIndex(i, j));
                td.style.width = '30%';
                td.style.height = '30%';
                td.style.textAlign = 'center';

                // Establecemos un evento para saber cuando una casilla ha sido pulsada
                (function (i_copy, j_copy) {
                    td.addEventListener("click", function() {
                        GameHandler.setTableBox(i_copy, j_copy, match, indexHandler, iaHandler, alertsHandler, username, picture);
                    });
                })(i, j);
        
                td.style.cursor = 'pointer';
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
        gameTable.appendChild(tableBody);

        document.querySelector('#game-table').appendChild(gameTable);
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
            alert.innerHTML = text;
    
            if (type === "alert-warning") {
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
            }
            container.appendChild(alert);
        }
    }
}

// Clase que maneja el comportamiento de la IA
class IaHandler {

    constructor() {
    }

    // Función que define los movimientos de la IA
    iaPlay(match, indexHandler, alertsHandler, username) {
        if (match.gameDifficulty === "easy") {
            IaHandler.iaEasy(match, indexHandler, alertsHandler, username);
        } else if (match.gameDifficulty === "medium") {
            IaHandler.iaMedium(match, indexHandler, alertsHandler, username);
        } else {
            IaHandler.iaHard(match, indexHandler, alertsHandler, username);
        }
    }

    // Función de juego de la IA en modo fácil, movimientos aleatorios
    static iaEasy(match, indexHandler, alertsHandler, username) {

        var option = match.freeOptions[Math.floor(Math.random() * match.freeOptions.length)].toString();

        IaHandler.setTableBoxIa(option, match, indexHandler, alertsHandler, username);
    }

    // Función de juego de la IA en modo intermedio, movimientos aleatorios y defiende jugadas de contrincante cuando solo le queda 1 para ganar
    static iaMedium(match, indexHandler, alertsHandler, username) {
        let selectedPosition = match.checkPosibleVictory(match, indexHandler);
        let findPos = 0;

        if (selectedPosition === null) {
            selectedPosition = match.freeOptions[Math.floor(Math.random() * match.freeOptions.length)].toString();
        } else {
            for (let pos in match.freeOptions) {
                if (match.freeOptions[pos] === selectedPosition) {
                    findPos = 1;
                    break;
                }
            }

            if (findPos === 0) {
                selectedPosition = match.freeOptions[Math.floor(Math.random() * match.freeOptions.length)].toString();
            }
        }

        IaHandler.setTableBoxIa(selectedPosition, match, indexHandler, alertsHandler, username);
    }

    // Función de juego de la IA en modo difícil, algoritmo minimax
    static iaHard(match, indexHandler, alertsHandler, username) {
        IaHandler.bestMove(match, indexHandler, alertsHandler, username);
    }

    // Función que coloca la ficha de la IA en el tablero
    static setTableBoxIa(option, match, indexHandler, alertsHandler, username) {
        var boxClass = "." + "box" + option;
        var clickedBox = document.querySelector(boxClass);
        clickedBox.classList.add("no-events");

        var image = document.createElement('img');

        image.setAttribute('alt', 'imagen de un círculo');
        image.setAttribute('src', "../../assets/images/circle.png");
        image.style.width = "80%";
        image.style.height = "10%";
        match.playerTurn = 1;
        match.gameState[option] = 2;

        clickedBox.appendChild(image);
        match.deleteFreeOption(option, match);
        match.checkPlay(match, indexHandler, alertsHandler, username);
    }

    // Calcular el mejor movimiento posible para la IA
    static bestMove(match, indexHandler, alertsHandler, username) {
        var bestScore = -Infinity;

        // Hay que probar cada una de las posiciones vacías
        for (var key in match.gameState) {
            if (match.gameState[key] === 0){
                match.gameState[key] = 2;
                var score = IaHandler.minimax(match, 0, false, indexHandler);
                match.gameState[key] = 0;
        
                // Nos quedamos con el mejor valor
                if (score > bestScore) {
                    bestScore = score;
                    var move = key;
                }
            }
        }

        IaHandler.setTableBoxIa(move.toString(), match, indexHandler, alertsHandler, username);
    }

    // Función con el algoritmo minimax de la teoría de juegos
    static minimax(match, depth, isMax, indexHandler) {
        // Comprobamos quien ganaría
        var result = match.checkWinner(match, indexHandler);

        // Condición de salida de la recursividad, en caso de que haya empate o uno de los dos gane
        if (result !== null) {
            return result;
        }

        // Dependiendo de si le toca a la IA o al humano cogeremos el valor máximo o mínimo
        if(isMax === true) {
            var bestScore = -Infinity;
            
            for (var key in match.gameState) {
                if (match.gameState[key] === 0) {
                    match.gameState[key] = 2;
                    var score = IaHandler.minimax(match, depth + 1, false, indexHandler);
                    match.gameState[key] = 0;

                    if (score > bestScore) {
                        bestScore = score;
                    }
                }
            }

            
        } else {
            var bestScore = Infinity;
            
            for (var key in match.gameState) {
                if (match.gameState[key] === 0) {
                    match.gameState[key] = 1;
                    var score = IaHandler.minimax(match, depth + 1, true, indexHandler);
                    match.gameState[key] = 0;

                    if (score < bestScore) {
                        bestScore = score;
                    }
                }
            }
        }

        return bestScore;
    }
}