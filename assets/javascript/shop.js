
// $(document).ready(function(){ need to create a function to access

var shopper = {
    money:player.money,
    food:player.food,
    kibble:player.kibble,
    balls:player.pokeballs,
    // inventory: {
    //   'balls':{count:0}
    // }
  };

  console.log(money);
  var store = {
    inventory: {
      balls:{count:50,cost:5},
      food:{count:50,cost:10},
      kibble:{count:50,cost:10}
    }
  }
  
  function transaction(shopper,store,item,count){
    var cost = store.inventory[item].cost,
        vol = store.inventory[item].count;
    
    if (shopper.money < (cost * count)) {
      alert("Not enough money.");
      return;
    }
    if (store.inventory[item].count < count){
      alert("We don't have that many " + item);
      return;
    }
    
    shopper.money -= (cost * vol);
    // seller.money += (c * vol);
    shopper.inventory[item].count += count;   
    store.inventory[item].count -= count;
    updateUI();
  }
  
  function updateUI(){
    var map = {
      pMon: shopper,
      
      pBal: shopper.balls,
    //   'sMon': store.money,
      sBal:store.inventory.balls.count
    }
    for (var i in map){
      var e = document.getElementById(i)
      e.innerHTML = map[i];
    }
    return(map);
  }
  
  updateUI();
  console.log(pMon);
  console.log(pBal);
  
  function onPayDay(){
    var inc = 50;
    player.money += inc;
    updateUI();
  }
  

  function onBuyAPoke(){
      console.log('poke is working');
      transaction();
      updateUI();
      
    transaction(player,store,'balls',1);
  }
  
  function onBuyKibble(){
    
      console.log('kibble works');
      console.log(document.getElementById("pkib"));
      // $('#pkib').updateUI();
      console.log(updateUI());
  
      }
  onBuyKibble();

  function onBuyFood(){
    console.log('food works');
}
