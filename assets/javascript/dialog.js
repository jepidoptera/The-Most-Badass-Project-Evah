// dialog box with arbitrary number of buttons and custom function for each
var msgDiv;
var keyDownFunction, keyUpFunction;

// example usage:
// msgBox('title', 'message', dialogButtons([{
//     text: 'text',
//     function: function () {}
// }, {
//     text: 'text',
//     function: function () {}
// }
// ]));

function deactivateKeyPresses(){
    // store whatever key functions are being used, reactivate them after dialog closes
    keyUpFunction = document.onkeyup;
    keyDownFunction = document.onkeydown;
    document.onkeydown = null;
    document.onkeyup  = null;
}

function activateKeyPresses(){
    // restore key functions
    document.onkeydown = keyDownFunction;
    document.onkeyup = keyUpFunction;
}

// javascript doesn't do type hinting, unfortunately.
function msgBox(/*string*/title, /*string*/message, /*dialogButtons*/buttons, hasInput) {
    // no keypress events while dialog is open
    // all buttons will have been set to reactivate keypresses on click
    deactivateKeyPresses();

    // use this for keypresses instead (navigate between buttons using arrow keys)
    document.onkeyup =
        function(e)
        {    
            if (e.keyCode == 39 || e.keyCode == 40) {      
                $(".button:focus").next().focus();
    
            }
            if (e.keyCode == 37 || e.keyCode == 38) {      
                $(".button:focus").prev().focus();
    
            }
        };

    buttons[0].text = (buttons[0].text == undefined) ? "Ok" : buttons[0].text;
    title = (title == undefined) ? "The page says:" : title;

    msgDiv = $('<div class="msgBox">');
    if (hasInput) msgDiv.append($('<input id="formInput">'))
    msgDiv.html(message);
    msgDiv.attr('title', title);
    msgDiv.dialog({
        autoOpen: true,
        modal: true,
        closeOnEscape: false,
        // no close option (have to click one of the buttons)
        open: function(event, ui) {
            $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
        },
        draggable: true,
        resizable: true,
        buttons: buttons,
        dialogClass: "dialogBox"
    });
}

// make a list of button objects which can be passed to openDialog function
// adding $(this).dialog("close") msgDiv.remove(), and activateKeyPresses()
// which should happen no matter what else

function dialogButtons (buttons){
    // function expects an array of button objects:
    // [{text: "", function: function()}, ...]
    return buttons.map (function(button) {
        // for each button, return a new button which is the same,
        // except its function has been wrapped in another function
        // which includes these required actions
        // and adds a button class
        return {
            text: button.text,
            class: "button msgButton",
            click: function() {
                // close dialog box, remove div
                $(this).dialog("close");
                msgDiv.remove();
                // user-defined custom function
                if (button.function != null) button.function();
                // return keypress control to document
                activateKeyPresses();
            }
        };
    });
}

