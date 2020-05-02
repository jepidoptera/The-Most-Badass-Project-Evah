// custom jquery form components
function mokePortrait (moke) {
    let healthColor = `rgb(${768 - moke.health / (moke.maxHealth || 10) * 768}, ${(moke.health / (moke.maxHealth || 10) - 1/3) * 768}, 0)`
    let portrait = $("<div>").addClass('thumbnailContainer').append(
        $("<div>")
            .addClass('mokeIcon')
            .append(
                $(moke.img).css({
                    width: `${(moke.width > moke.height ? 1 : moke.width / moke.height) * 4.5}vmin`, 
                    height: `${(moke.height > moke.width ? 1 : moke.height / moke.width) * 4.5}vmin`,
                    display: "block",
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }))
            .click((event) => {
                $("#mokeStats").empty();
                if (!$(event.currentTarget).hasClass("selected")){
                    $("#mokeStats").append(mokeStats(moke));
                    $(".mokeIcon").removeClass("selected");
                    $(event.currentTarget).addClass("selected");
                }
                else {
                    $(".mokeIcon").removeClass("selected");
                }
            })
            .hover(() => {
                    // mouseenter
                        $("#mokeStats").empty().append(mokeStats(moke));
                        if (!$(event.currentTarget).hasClass("selected")) $(".mokeIcon").removeClass("selected");
                    }, (event) => {
                    // mouseleave
                        if (!$(event.currentTarget).hasClass("selected")) $("#mokeStats").empty();
                }),
        $("<div>").css({
            width: `${moke.health / (moke.maxHealth || 10) * 4.5}vmin`,
            height: "5px",
            position: "relative",
            bottom: 0,
            "background-color": healthColor,
        }))
    return portrait;
}

function mokeStats (moke) {
    return [
        $("<p>").text(moke.name),
        $("<p>").text(`Health: ${Math.floor(moke.health * 10) / 10}/${moke.maxHealth}`),
        ...moke.conditions.map(condition => $("<p>").html("<span style='color:red'> has " + condition.name + "</span>")),
        $("<p>").text(moke.description)
    ]
}

function numberInput(inputParams) {
    inputParams.change = (changeValue) => {
        if (inputParams.changeRate === -1) {
            inputParams.changeRate = 0;
            return;
        }
        inputParams.number += changeValue;
        $(`#${inputParams.name}Input`)
            .val(inputParams.number)
            .change()
        if (inputParams.changeRate) inputParams.changeTimeout = setTimeout(() => {
            inputParams.changeRate = Math.min(inputParams.changeRate, inputParams.changeRate * .20 + 16);
            inputParams.change(changeValue)
        }, inputParams.changeRate);
    }
    inputParams.changeRate = 0;
    inputParams.changeTimeout = null;
    return $("<div>").html(`${inputParams.text}: `)
    .addClass("numberInputLine")
    .append($("<span>")
        .attr('id', inputParams.name)
        .addClass("numberInput")
        .append($("<input>")
            .attr("id", `${inputParams.name}Input`)
            .addClass("numberInput_text")
            .val(inputParams.value || inputParams.initialValue || inputParams.quantity || 0))
            .change(() => {
                let self = $(`#${inputParams.name}Input`)
                if (self.val() > inputParams.max) {
                    if (inputParams.onRejectChange) inputParams.onRejectChange();
                    self.val(inputParams.max);
                }
                else if (self.val() < inputParams.min) {
                    if (inputParams.onRejectChange) inputParams.onRejectChange();
                    self.val(inputParams.min);
                }
                inputParams.number = parseInt(self.val());
                if (inputParams.onChange) inputParams.onChange();
            })
        .append($("<span>")
            .addClass("numberInput_buttonContainer")
            .append(
                incrementButton(inputParams, 1),
                incrementButton(inputParams, -1)
            )
        )
    )
}

function incrementButton(inputParams, sign) {
    return $("<div>")
        .attr("id", `${inputParams.name}${sign === 1 ? 'Up' : 'Down'}`)
        .addClass("numberInput_button")
        .append($("<span>").addClass("numberInput_button_text").text(sign === 1 ? "▲" : "▼"))
        .click(() => {
            if (inputParams.changeRate === 0) inputParams.change(inputParams.increment * sign || sign)
        })
        .mousedown(() => {
            clearTimeout(inputParams.changeTimeout);
            inputParams.changeRate = 500;
            inputParams.change(inputParams.increment * sign || sign)
        })
        .mouseup(() => {
            if (inputParams.changeRate > 0) inputParams.changeRate = -1;
        })
        .mouseleave(() => {
            if (inputParams.changeRate > 0) inputParams.changeRate = -1;
        })
}