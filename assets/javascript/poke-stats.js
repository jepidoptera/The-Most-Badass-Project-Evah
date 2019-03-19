// jshint esversion: 6


$(document).ready(function(){
var pokegifs = $('#poke-gifs-go-here');
// 

  var display = function() {
    pokegifs.empty(); 
  }
      
 $("button").on("click", function() {
    var poke = $(this).attr("data-poke");
    var queryURL = "https://api.giphy.com/v1/gifs/search?q=" +
      poke + "&api_key=8rWTYSGMgDTrwqndYxIEjk7QT2CSpo0D&limit=1";
    
    var pokeAPI = "http://pokeapi.co/api/v2/pokemon/" + poke + "/";

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
        var results = response.data;
        for (var i = 0; i < results.length; i++) {
            var gifDiv = $("<div>");
            var pokeImage = $("<img>");
            pokeImage.attr("src", results[i].images.fixed_height.url);
            gifDiv.append(pokeImage);
             display();
            $("#poke-gifs-go-here").prepend(gifDiv); 
          }
    })
    
      $('#abilityTable').empty()
      $.ajax({
        url: pokeAPI,
        method: "GET"
      }).then(function(response){
        console.log(response)
        var apiResults = response.abilities;
        console.log(apiResults[0].ability.name)
        for (var i = 0; i < apiResults.length; i++) {
          var tr = $('<tr></tr>');
          var abilityName = $('<th>' + apiResults[i].ability.name + '</th>')
          // var desc = $('<td><a href = ' + apiResults[i].ability.url + '>' + apiResults[i].ability.url + '</a></td>')
          $(abilityName).appendTo(tr);
          // $(desc).appendTo(tr);
          $(tr).appendTo('#abilityTable')
          // document.getElementById('abilityTable').append(tr);
          // abilities[""0""].ability.name
          console.log(tr);
        }
      })

        $('#movesTable').empty()
        $.ajax({
        url: pokeAPI,
        method: "GET"
      }).then(function(response){
        console.log(response)
        var Results = response.moves;
        console.log(Results[0].move.name)
        for (var i = 0; i < Results.length; i++) {
          var tr = $('<tr></tr>');
          var movesNames = $('<th>' + Results[i].move.name + '</th>')
          // var moveDesc = $('<td><a href = ' + Results[i].moves.move + '>' + Results[i].moves.move + '</a></td>')
          $(movesNames).appendTo(tr);
          // $(moveDesc).appendTo(tr);
          $(tr).appendTo('#movesTable')
          document.getElementById('#movesTable').append(tr);
          console.log(tr);
        }
    })

  })
});
