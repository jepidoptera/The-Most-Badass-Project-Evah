
// function transaction(shopper,store,item,count){
//     var cost = store.inventory[item].cost,
//         vol = store.inventory[item].count;
    
//     if (shopper.money < (cost * count)) {
//       alert("Not enough money.");
//       return;
//     }
//     if (store.inventory[item].count < count){
//       alert("We don't have that many " + item);
//       return;
//     }
    
//     shopper.money -= (cost * vol);
//     // seller.money += (c * vol);
//     shopper.inventory[item].count += count;   
//     store.inventory[item].count -= count;
    
//   }

var store = {
    inventory: {
      balls:{count:50,cost:5},
      food:{count:50,cost:10},
      kibble:{count:50,cost:10}
    },

    
}


function onBuyAPoke() {
  console.log('pokebtnworks');
  // $('#pBal').append(shopper.balls);
  
}

function onBuyKibble(){
    console.log('kibble works');
    // $('#pKib').append(shopper.kibble);
    }

 function onBuyFood(){
      console.log('food works');
      // $('#pFoo').append(shopper.food);
  }





function firebaseReady(){
  var shopper = {
    money:player.money,
    food:player.food,
    kibble:player.kibble,
    balls:player.pokeballs
}

onBuyAPoke();
$('#pBal').append(shopper.balls);
$('#sBal').append(store.inventory.balls.count);

   onBuyKibble();
$('#pKib').append(shopper.kibble);
$('#sKib').append(store.inventory.kibble.count);
 onBuyFood();
 $('#pFoo').append(shopper.food);
 $('#sFoo').append(store.inventory.food.count);

 $('#pMon').append(shopper.money);
 
 transaction();
 };



 


 
 

 

  // updateUI();

 





    // inventory: {
    //   'balls':{count:0}
    // }
    // console.log(shopper.money);
    // console.log(shopper.food);
    
  
  
  // function transaction(shopper,store,item,count){
  //   var cost = store.inventory[item].cost,
  //       vol = store.inventory[item].count;
    
  //   if (shopper.money < (cost * count)) {
  //     alert("Not enough money.");
  //     return;
  //   }
  //   if (store.inventory[item].count < count){
  //     alert("We don't have that many " + item);
  //     return;
  //   }
    
  //   shopper.money -= (cost * vol);
  //   // seller.money += (c * vol);
  //   shopper.inventory[item].count += count;   
  //   store.inventory[item].count -= count;
  //   updateUI();
  // }
 
 
 // function updateUI(){
//   var map = {
//     pMon: shopper.money,
    
//     pBal: shopper.balls,
//   //   'sMon': store.money,
//     sBal:store.inventory.balls.count
//   }
  
//   for (var i in map){
//     var e = document.getElementById(i)
//     e.innerHTML = map[i];
//   }
//   return(map);
// }