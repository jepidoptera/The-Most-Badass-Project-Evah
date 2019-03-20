var player = {
    money:'',
    inventory: {
      'balls':{count:0}
    }
  }
  
  var store = {
    // money:0,
    inventory: {
      'balls':{count:50,cost:5}
    }
  }
  
  function transaction(buyer,seller,item,count){
    var c = seller.inventory[item].cost,
        vol = seller.inventory[item].count;
    
    if (buyer.money < (c * count) {
      alert("Not enough money.");
      return;
    }
    if (seller.inventory[item].count < count){
      alert("We don't have that many " + item);
      return;
    }
    
    buyer.money -= (c * vol);
    seller.money += (c * vol);
    buyer.inventory[item].count += count;   
    seller.inventory[item].count -= count;
    updateUI();
  }
  
  function updateUI(){
    var map = {
      'pmon': player.money,
      'pBal': player.inventory.balls.count,
    //   'sMon': store.money,
      'sBal':store.inventory.balls.count
    }
    for (var i in map){
      var e = document.getElementById(i)
      e.innerHTML = map[i];
    }
  }
  
  function onPayDay(){
    var inc = 50;
    player.money += inc;
    updateUI();
  }
  
  function onBuyATurtle(){
    transaction(player,store,'balls',1);
  }
  
  function onInventory(){
    document.getElementById('modal').style.display = "flex"
  }
  
  updateUI();