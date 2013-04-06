(function(win, $, undefined){
"use strict";

/* What needs to be addressed,

--> Currently shuffling at end of every round, needs to be only at 50-75% of deck.

--> if the dealer is beating the player, he should not hit(Currently hits below 17).
--> dealer should hit on a "soft 17"(an Ace and a 6), and stand on a "hard 17"(an Ace and a 10 value card).

--> Split doubles functionality

--> localStorage save settings(money, name).

--> Change player name
*/
/* Create a fallback if console is not defined*/
var console = win.console || { log : function(){} };

var init = {

	bdeck:[],
	infoString:"",
	player:{
		name:"Player",
		money:100,
		hand:[],
		bet:0,
		string:""
	},
	dealerHand:[],
	dealerString:"",
	minimumBet:5,
	
	initPlayer:function(){
		//get name of player
	},
	getBet:function(minBet,maxBet){
			/* Check if you have a valid bet*/

			var bet = parseInt($(".bet").val());

			if(maxBet===0){init.outputString("Game Over!<hr>", "status");return false;}

			if (bet < minBet) {
				init.outputString("The minimum bet is " + minBet, "status");
				return false;
			}
				
			if (bet > maxBet) {
				init.outputString("You have bet more than you currently have", "status");
				return false;
			}
		
		return bet;
	},
	dealHand:function(){
		/* deal two cards to each player*/
		init.player.hand.push(init.getNewCard());
		init.player.hand.push(init.getNewCard());

		init.dealerHand.push(init.getNewCard());
		init.dealerHand.push(init.getNewCard());

	},
	shuffle:function(){
		
		for (var i=0; i<init.bdeck.length; i++)
			init.bdeck[i] = false;
	
	},
	getCardValue:function(n){
		/*Get value of cards, Jack/Queen/King = 10*/
		var value;
		n = n % 13 + 1;   
		if (n >= 10) 
			value = 10;
		else
			value = n;
		return value;
	},
	getCardString:function(n){
		/*Visual Representation of Cards*/
		var suit, suitString, rank;
		switch (n % 4)
		{
			case 0: suit = "\u2665"; suitString = "heart"; break;
			case 1: suit = "\u2660"; suitString = "spade"; break;
			case 2: suit = "\u2663"; suitString = "club"; break;
			case 3: suit = "\u2666"; suitString = "diamond"; break;
		}
		switch(n % 13)
		{
			case 0: rank = "A";  break;
			case 10: rank = "J"; break;
			case 11: rank = "Q"; break;
			case 12: rank = "K"; break;
			default: rank = (n%13 + 1) + "";
		}
		return "<div class='card "+suitString+"' cardVal='"+rank + "'cardSuit='" + suit + "' ></div>";
	        cardObject.cardObjects.push(card);
	},
	displayCard:function(n, user){
		init.outputString(init.getCardString(n), user);
	},
	getNewCard:function(){
		/* Get random value between 0 and 51
		Check to see if the card has been dealt
		return the number
		*/

		var n;
		do {
			n = Math.round(Math.random() * 51);
		}  while (init.bdeck[n]);  // loop while card is already used
		init.bdeck[n] = true;  // set it to "used"
		return n;
	},
	getHandValue:function(hand){
		/* Get sum of all cards in hand,
		use favorable value for Ace.
		*/
		var handValue=0;
		var aceCount=0;
		for (var i=0; i<hand.length; i++)
		{
			var n = init.getCardValue(hand[i]);
			if (n==1) aceCount++;
			handValue += n;
		}
		while (aceCount > 0 && (handValue +10) <= 21)
		{
			handValue+= 10;
			aceCount--;
		}
		return handValue;
	},
	displayHand:function(hand, showFirstOnly, endRound){
		/*If dealer && not end of round, only display first card*/

		if (showFirstOnly== true){
			init.displayCard(hand[0],"dealer");
			return;
		}
		
		if(endRound === true){
			for (var i=0; i<hand.length; i++)
			init.displayCard(hand[i],"dealer");
		}

		for (var i=0; i<hand.length; i++)
			init.displayCard(hand[i],"player");
	},
	interactivePlay:function(stand){
		/* User initiated play, 
		if sum of cards is less than 21, user can either add a card or end their turn.
			*/
		if(init.getHandValue(init.player.hand) < 21 && stand === false){
			$(".hit").bind("click", function(){
				var card = init.getNewCard();
				init.player.hand.push(card);
				
				init.outputString("Your hand value is: " + init.getHandValue(init.player.hand), "status");
				init.outputString(init.getCardString(card), "player");
				
				$(".bJackBtn").unbind("click");
				init.interactivePlay(false);
			});
			$(".stand").bind("click", function(){
				$(".bJackBtn").unbind("click");
				init.interactivePlay(true);
			});

			$(".bJackOutput .player").append(init.player.string);
			init.player.string = "";

		}else{
			
			$(".bJackBtn").unbind("click");
			$(".bJackOutput .dealer, .bJackOutput .player").html("");
			init.player.string = "";
			init.displayHand(init.player.hand);
			$(".bJackOutput .player").html(init.player.string);
			init.outputString("Your final hand value is: " + init.getHandValue(init.player.hand), "status");

			init.dealerString = "";
			init.dealerPlay();
			$(".bJackOutput .dealer").html(init.dealerString);
			init.outputString("Dealer's final hand value is: " + init.getHandValue(init.dealerHand), "status");
			init.payBets();
			init.resetHand();
			
		}
	},
	dealerPlay:function(){
		/*If the sum of the dealer's hand is lower than 16 he must hit.
		*/
		while (init.getHandValue(init.dealerHand) < 17)
			init.dealerHand.push (init.getNewCard());
				
		//Dealer's final hand is
		init.displayHand(init.dealerHand, false, true);
	
	},
	whoWins:function(){
		
		var win;
		var dval = init.getHandValue(init.dealerHand);
		var pval = init.getHandValue(init.player.hand);
		
		if (pval > 21) win="dealer";
		else if (dval > 21) win = "player";
		else if (pval > dval) win = "player";
		else if (pval == dval) 
		{
			if (init.hasBlackJack(init.dealerHand)) win = "dealer";
			else win = "tie";
		}
		else  win = "dealer";
		return win;
	},
	hasBlackJack:function(hand){
		return init.getHandValue(hand) == 21 && hand.length == 2;
	},
	payBets:function(){
		/* Determine who wins and pay out bets accordingly,
		If the player has black jack he gets paid out 150% instead of the regular 100%.
		*/
		switch(init.whoWins())
		{
			case "player":
				init.player.money += 2 * init.player.bet;
				if (init.hasBlackJack(init.player.hand))
					init.player.money += Math.round(init.player.bet * .5);
				init.outputString("<b>You win!</b>", "status");
				break;
			case "dealer": 
				init.outputString("<b>You lose!</b>", "status");
				break;
			case "tie":
				init.outputString("Tie", "status");
				init.player.money += init.player.bet;
				break;
			default:break;
		}
		$(".funds").html("Funds Remaining: $"+init.player.money);
		init.outputString("<hr><i>You have " + "</i>$"+init.player.money + " <i>remaining</i><br>", "status");
		
	},
	resetHand:function(){

		$(".deal").css("display","block");
		$(".hit, .stand").css("display","none");

		init.player.hand = [];
		init.player.string = "";
		init.dealerHand = [];
		init.dealerString = "";

		$(".deal").bind("click",function(e){init.play(e)});
	},
	outputString:function(string,status){
		switch(status){
			case "dealer":
				init.dealerString += string+"";
			break;
			case "player":
				init.player.string += string+"";
			break;
			case "status":
				$(".info").append(string+"<br>");
				$(".info").scrollTop($(".info")[0].scrollHeight);
			break;
			default:break;	
		}
		
		return;
	},
	play:function(e){
		/* Initiated on "Deal" select,
		Shuffle the deck, deal the hand, display the hand,
		then allow the user to drive.
		*/
		$(".bJackOutput .player, .bJackOutput .dealer").html("");
		init.player.bet = init.getBet(init.minimumBet, init.player.money);
		
		if(init.player.bet){
			init.player.money -= init.player.bet;
			$(".funds").html("Funds Remaining: $"+init.player.money);
			
			e.currentTarget.style.display = "none";
			$(".hit, .stand").css("display","block");

			init.shuffle();
			init.outputString("<hr>", "status");
			init.dealHand();
			
			//Dealer's first card
			init.displayHand(init.dealerHand, true);
			$(".bJackOutput .dealer").html(init.dealerString);
			init.outputString("Dealer's hand value is: " + init.getCardValue(init.dealerHand[0]), "status");
			//Player1 Hand
			init.displayHand(init.player.hand);
			init.outputString("Your hand value is: " + init.getHandValue(init.player.hand), "status");
				
			init.interactivePlay(false);	
		}
	}
}

$(".deal").bind("click",function(e){init.play(e)});
	win.init = init;
})(window,jQuery);
