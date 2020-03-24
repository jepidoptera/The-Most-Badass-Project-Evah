let player = {};

function msgBox(title, text, buttons = [{text: "ok"}]) {
    if (pause) pause();
    if (!text) {
        text = title;
        title = "-------"
    }
    $("#msgbox").empty().show()
        .text(text)
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
                name: player.name,
                mokeballs: player.mokeballs,
                progress: player.progress,
                food: player.food,
                speed: player.speed,
                day: player.day,
                time: player.time,
                money: player.money,
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

function loadPlayer() {
    try {
        player = JSON.parse($("#playerInfo").text());
        player.currentLocation = trail.locationAt(player.progress);
        trail.loadFrom(player.progress);
    }
    catch{
        player.name = $("#playerName").text();
    }
    $("#playerName").remove();
    $("#playerInfo").remove();
    if (this._then) {
        this._then(player);
    }
}

