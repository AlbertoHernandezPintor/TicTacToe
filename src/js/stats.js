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
    document.querySelector('.sign-out').addEventListener("click", function(){signOut()});
    document.querySelector('.return-button').addEventListener("click", function(){goToMatch()});
    window.onload = function() {
        statsHandler();
    }
}

// Función para ir a la pantalla de juego
function goToMatch() {
    let url = new URL(document.location.href);
    var username = url.searchParams.get("username");

    document.location.target = "_self";
    document.location.href = "index.html?username=" + username;
}

// Función para cerrar sesión
function signOut() {
    let url = new URL(document.location.href);
    var username = url.searchParams.get("username");

    sessionStorage.removeItem(username);

    document.location.target = "_self";
    document.location.href = "login.html";
}

// Función que maneja la creación de estadísticas
function statsHandler() {
    var stats = new Stats();
    let url = new URL(document.location.href);
    var tableNames = ["Ganados", "Perdidos", "Empatados", "Abandonados", "Totales"];
    var username = url.searchParams.get("username");
    var userStats = stats.getUserStats(username);
    var arrayStats = [userStats.wins, userStats.lost, userStats.tie, userStats.giveUp, userStats.total];

    stats.createStatsTable(tableNames, arrayStats);
    stats.createProgressBars(tableNames, arrayStats);
}


/* ************************ */
/*          Clases          */
/* ************************ */

// Clase para el posterior manejo de estadísticas
class Stats {

    constructor() {
    }

    getUserStats(username) {
        if (localStorage.getItem(username + "Stats") === null) {
            var stats = {'total': 0, 'wins': 0, 'lost': 0, 'tie': 0, 'giveUp': 0};
            localStorage.setItem(username + "Stats", JSON.stringify(stats));
            return stats;
        } else {
            var userStats = JSON.parse(localStorage.getItem(username + "Stats"));
            return userStats;
        }
    }
 
    // Función que crea las barras de progreso para cada estadística
    createProgressBars(tableNames, arrayStats) {
        for (var i = 0; i < tableNames.length - 1; i++) {
            var per = (Math.round((arrayStats[i] / arrayStats[4]) * 100)).toString();

            var perLabel = document.createElement('label');
            perLabel.setAttribute('for', tableNames[i]);
            perLabel.innerText = tableNames[i];
            perLabel.style.marginTop = "3em";
            document.querySelector('.per').appendChild(perLabel);

            var perStatsDiv = document.createElement('div');
            perStatsDiv.classList.add("progress");
            perStatsDiv.style.margin = "auto";
            perStatsDiv.style.width = "50vh";
            perStatsDiv.id = tableNames[i];

            var perStats = document.createElement('div');
            perStats.classList.add("progress-bar");
            perStats.setAttribute('role', 'progressbar');
            perStats.style.width = per + "%";
            perStats.setAttribute('aria-valuenow', per);
            perStats.setAttribute('aria-valuemin', '0');
            perStats.setAttribute('aria-valuemax', '100');
            perStats.innerText = per + "%";
            perStats.style.backgroundColor = "#3F03FB";

            perStatsDiv.appendChild(perStats);
            document.querySelector('.per').appendChild(perStatsDiv);
        }
    }

    // Función que crea la tabla de estadíticas
    createStatsTable(tableNames, arrayStats) {
        // Creamos la tabla y sus atributos
        var gameTable = document.createElement('table');
        gameTable.style.minWidth = '70vh';
        gameTable.style.minHeight = '10vh';
        gameTable.style.margin = 'auto';
        gameTable.setAttribute('border', '1');

        // Creamos el cuerpo de la tabla
        var tableBody = document.createElement('tbody');

        // Creamos las filas
        for (var i = 0; i < 2; i++) {
            var tr = document.createElement('tr');

            //Creamos las columnas
            for (var j = 0; j < 5; j++) {
                var td = document.createElement('td');
                td.style.textAlign = 'center';

                if (i === 0) {
                    td.innerText = tableNames[j];
                } else {
                    td.innerText = arrayStats[j];
                }
        
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
        gameTable.appendChild(tableBody);

        document.querySelector('.stats-table').appendChild(gameTable);
    }
}