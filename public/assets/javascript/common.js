let player = {};
let paused = false;

function msgBox(title, text, buttons = [{text: "ok"}]) {
    if (pause) pause();
    if (!text) {
        text = title;
        title = "-------"
    }
    $("#msgbox").empty().show()
        .html(text + "<br>")
        .prepend($("<div>").addClass('msgTitle').text(title))
        .append($("<div>").attr('id', 'msgbuttons'));
    buttons.forEach(button => {
        $("#msgbuttons").append($("<button>")
            .addClass('msgbutton')
            .text(button.text)
            .click(() => {if (button.function) button.function(); $("#msgbox").hide(); if (unpause) unpause();})
            .attr("type", (buttons.length === 1 ? "submit" : "none"))
        )
    })
}

function saveGame() {

    $.ajax({
        method: "POST",
        url: '/save',
        data: {data: JSON.stringify({
            ...player,
            currentLocation: player.currentLocation.name,
            posse: player.posse.map(moke => {return {
                type: moke.type,
                name: moke.name,
                health: moke.health,
                conditions: moke.conditions
            }})
        })
        }
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
