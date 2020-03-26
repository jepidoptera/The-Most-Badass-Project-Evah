let player = {};

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
        data: {
            player: JSON.stringify({
                ...player,
                posse: player.posse.map(moke => {return {
                    type: moke.type,
                    name: moke.name,
                    health: moke.health,
                    conditions: moke.conditions
                }})
            })
        }
    }).then((result) => {
        this._then(result);
    });

    return this;
}

function loadPlayer(callback) {
    let urlParams = new URLSearchParams(location.search)
    let authtoken = urlParams.get('authtoken')

    $.ajax({
        method: "GET",
        url: "/load/" + $("#playerName").text() + "/" + authtoken
    }).done(data => callback({...data, authtoken: authtoken}));
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

