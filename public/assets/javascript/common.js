class Player{
    constructor(name) {
        // give player initial stats
        this.food = 120;
        this.money = 1550;
        this.mokeballs = 27;
        this.grenades = 9;
        this.speed = 4;
        this.name = name || 'simone';
        // reset to beginning of trail
        this.progress = 1;
        this.time = 0;
        this.day = 0;
        this.messages = ["You set off on the trail! Next stop: the forest of doom."];
        this.posse = [{name: 'dezzy'}, {name: 'apismanion'}, {name: 'mallowbear'}, {name: 'marlequin'}, {name: 'wingmat'}];
        let urlParams = new URLSearchParams(location.search)
        this.authtoken = urlParams.get('auth')    
    }
    get foodPerDay() {
        return 5 + player.posse.reduce((sum, moke) => sum + moke.hunger, 0)
    }
    get currentMessage() {
        return player.messages[player.messages.length - 1]
    }
    uploadJson() {
        return {
            ...player,
            isLoaded: false,
            currentLocation: player.currentLocation.name,
            posse: player.posse.map(moke => {return {
                type: moke.type,
                name: moke.name,
                health: moke.health,
                conditions: moke.conditions
            }})
        }
    }
}
let player = new Player();
let paused = false;
let msgBoxActive = false;

function msgBox(title, text, buttons = [{text: "ok", function: () => {}}]) {
    if (pause) pause();
    msgBoxActive = true;
    if (!text) {
        text = title;
        title = "-------"
    }
    $("#msgbox").empty().show()
        .append($("<div>").addClass('msgTitle').text(title))
        .append($("<div>").attr('id', 'msgText').html(text + "<br>"))
        .append($("<div>").attr('id', 'msgbuttons'))
    if (typeof(buttons) === "string") {
        buttons = [{text: buttons}]
    }
    buttons.forEach(button => {
        $("#msgbuttons").append($("<button>")
            .addClass('msgbutton')
            .text(button.text)
            .click(() => {$("#msgbox").hide(); unpause(); msgBoxActive = false; if (button.function) button.function();})
            .attr("type", (buttons.length === 1 ? "submit" : "none"))
        )
    })
    return $("#msgbox");
}

function clearDialogs() {
    $("#msgbox").hide();
    $("#optionsMenu").hide();
}

function saveGame() {

    $.ajax({
        method: "POST",
        url: '/save',
        data: {data: JSON.stringify(player.uploadJson())}
    })
}

function loadPlayer(callback) {
    let urlParams = new URLSearchParams(location.search)
    let authtoken = urlParams.get('auth')

    $.ajax({
        method: "GET",
        url: "/load/" + $("#playerName").text() + "/" + authtoken
    }).done(data => callback({...data, messages: data.messages || [], authtoken: authtoken}))
    .fail(err => {
        console.log('load error: ', err);
        if (err.status === 403) {
            // auth code expired
            window.location.href = "/logout"
        }
        callback({name: urlParams.get('name')})
    });
    // try {
    //     player = JSON.parse($("#playerInfo").text());
    // }
    // catch{
    //     player.name = $("#playerName").text();
    // }
    // $("#playerName").remove();
    // $("#playerInfo").remove();
    // if (this._then) {
    //     this._then(player);
    // }
}

function loadTrail(callback) {
    $.ajax({
        method: "GET",
        url: "/load/trail"
    }).done(data => {
        callback(data)
    }).fail(err => {
        console.log('load error: ', err);
        callback({name: urlParams.get('name')})
    });

}


function pause() {
    paused = true;
}

function unpause() {
    if (paused) {
        paused = false;
    }
}
