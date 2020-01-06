/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/


 const speechOutput1 = "this is speech Output";   //PB needs to be corrected
 const reprompt1 = "this is reprompt";
 const welcomeOutput = [
	 "Hi, Welcome to Wendys. What can I get for you today",
	 "Hi Welcome to Wendys, What would you like to have today",
	 "Welcome to Wendys. May i take your order",
	 "Hello and welcome to Wendys, What could i make for you"
	 ];
 const welcomeReprompt = [
     "Hello , Are you there? Please order whenever you are ready",
	 "Please take your time. let me know when you are ready",
	 "You can start your order whenever your ready."
	 ];
 const finalIntro = [
   "OK. Great Choice. ",
   "Thats my favorite One. ",
   "Oh, I like that one. "
     ];
const mcprompt = [
	 '<amazon:effect name="whispered"> hmmm, <break time="300ms"/> looks like some body does not want to have fresh food </amazon:effect>',
	 '<amazon:effect name="whispered"> Sorry, <break time="300ms"/> we cannot help if you do not want fresh food </amazon:effect>'
	 ];
const stopprompt = [
	 "Good Bye",
	 "No Problem, Have a good day"
	 ];
const helpprompt = [
	 "Don't You Worry. please pull forward",
	 "sure. please pull forward"
	 ];
const cancelprompt = [
	 "sure No problem, You can start the order again when you are ready or please pull forward",
	 "sure. see you again",
	 "No problem. Request cancelled."
	 ];
const choosereply = [
	" what XXXX would you like to have, we have YYYY",
	" for XXXX we have YYYY which one would you like to have",
	" we have YYYY , what do you prefer",
	" for XXXX you got a choice we have YYYY which one would you like to have "
	 ];
const didnotget = [
	 "hmm, I am sorry i didnot get that, can you please repeat it",
	 "I am not sure what you mean, can you please come again",
	 "I have trouble hearing you, can you please repeat that",
	 "sorry didnot get that , can you please repeat it"
	 ];
const nelse = [
     "Anything else for today ",
	 "I like your choice, anything else",
	 "do you want to add add anything else",
	 "Is that all or can i get you anything else"
];	 
const finalcomment = [
     "thanks for choosing wendys, please pull forward ",
	 "Thank you, Please pull forward "
];	


 // 2. Skill Code =======================================================================================================

'use strict';
var Alexa = require('alexa-sdk');
const APP_ID = undefined; // 'amzn1.ask.skill.82e9becf-9c40-4a3c-bebe-b4a16a6ee1b5';  // TODO replace with your app ID (OPTIONAL).

const AWS = require('aws-sdk');
const AWSregion = 'us-east-1'; 
AWS.config.update({
    region: AWSregion
});

const handlers = {
    'LaunchRequest': function () {
		
		var welcomespeech = randomPhrase(welcomeOutput);
		var welcomerespeech = randomPhrase(welcomeReprompt);
		
      this.response.speak(welcomespeech).listen(welcomerespeech);
      this.emit(':responseReady');
	  
    },
	 'mcd':function(){
	 	console.log("in mcd--JSON data: "+ JSON.stringify(this.event.request.intent));
	var mcspeech = randomPhrase(mcprompt);
		
      this.response.speak(mcspeech)
      this.emit(':responseReady');
	}, 
	'AMAZON.HelpIntent':function(){
	var helpspeech = randomPhrase(helpprompt);
		
      this.response.speak(helpspeech)
      this.emit(':responseReady');
	}, 
	'AMAZON.StopIntent':function(){
	var stopspeech = randomPhrase(stopprompt);
		
      this.response.speak(stopspeech)
      this.emit(':responseReady');
	}, 
    'AMAZON.CancelIntent':function(){
	var cancelspeech = randomPhrase(cancelprompt);
		
      this.response.speak(cancelspeech)
      this.emit(':responseReady');
	}, 
	'Unhandled': function() {
	this.emit(':ask', 'in Unhandled function');
	},	
    'directorder': function () {
        //delegate to Alexa to collect all the required slot values
       console.log("JSON data: "+ JSON.stringify(this.event.request.intent));
       console.log("In direct order");
	   
	    var nthingelse;
	    var mslotcount;
		var mcheckSuccess;
		var mid;
		
		var bslotcount;
		var bcheckSuccess;
		var bid;
		var bitem;
		
		var mitem = isSlotValid(this.event.request, "mitem");
		var msauce = isSlotValid(this.event.request, "msauce");
		
		var bvalue = isSlotValid(this.event.request, "bno");
		  mslotcount = getcount(this.event.request, "mitem");
		  mcheckSuccess = getstatus(this.event.request, "mitem"); 
		  mid = getid(this.event.request, "mitem");  
		  if (bvalue == 9999) {
			  bslotcount = 0;
		  }else{
			  bslotcount = getcount(this.event.request, "bno");
		  }
		  
		  bcheckSuccess = getstatus(this.event.request, "bno"); 
		  bid = getid(this.event.request, "bno"); 
		  
		  console.log(" bid - "+bid +" bvalue - "+bvalue+ "  bslotcount - "+bslotcount +"  bcheckSuccess  - "+ bcheckSuccess);
		  
		 if(bslotcount == 1 && bcheckSuccess === 'ER_SUCCESS_MATCH'){
			 
					 if (bid == 401 ){
						 bitem = 'Daves Single';
					 }else if(bid == 402 ){
						 bitem = 'Daves Double';
					 }else if(bid == 403 ){
						 bitem = 'Daves Triple';
					 }else if(bid == 404 ){
						 bitem = 'Baconator';
					 }else if(bid == 405 ){
						 bitem = 'Son of Baconator';
					 }else if(bid == 406 ){
						 bitem = 'Spicy Chicken Sandwich';
					 }else if(bid == 407 ){
						 bitem = 'Home Style Chicken Sandwich';
					 }else if(bid == 408 ){
						 bitem = 'Asiago Ranch Chicken Club';
					 }else if(bid == 409 ){
						 bitem = 'Grilled Chicken Sandwich';
					 }else if(bid == 410 ){
						 bitem = '10 piece chicken nuggets';
					 }else{
						 bitem = 'unknown';			 		
					 }
				console.log(" bitem - "+bitem);	 
				
				if (bitem === 'unknown') {
					 console.log("in unknown ");
					const slotToElicit = 'bno'
					const pbspeechOutput = 'cannot find that one, Can you please select the number from menu displayed'
					const repromptSpeech = 'please let me know what would you like to have '
					return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
				 } else if(bitem === '10 piece chicken nuggets' && !msauce){
					 console.log("in msauce ");
					// updatedIntent.slots.bcombo.value = 'y';
					const slotToElicit = 'msauce'
					const pbspeechOutput = 'what sauce would you like for your Chicken Nuggets'
					const repromptSpeech = 'we have Honey Mustard, Ranch, Sriracha and Barbecue'
					return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
				 } else if(bitem === '10 piece chicken nuggets' && msauce) {
					 this.attributes['text1'] =  mitem+ " with "+ msauce;
				 }
			
			console.log("bslotcount  "+bslotcount+ "  bcheckSuccess  "+bcheckSuccess+"  bid "+bid);	
			
			console.log("In BNO JSON data: "+ JSON.stringify(this.event.request.intent));
			
            mitem = bitem;		
			mslotcount = bslotcount;
			mcheckSuccess = bcheckSuccess;
			mid = bid;
			
			if( !isSlotValid(this.event.request, "mitem") && !isSlotValid(this.event.request, "mdrink")) {
				   console.log("in bno  -- calling drink ");
					var updatedIntent = this.event.request.intent;
					updatedIntent.slots.mitem.value = 'bno';	
					const slotToElicit = 'mdrink'
					const pbspeechOutput = 'What drink would you like to have with your '+ mitem;
					const repromptSpeech = 'please take your time let me know when you are ready '
					return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech,updatedIntent)
				
			}
			
		 } else  if(bslotcount == 1 && bcheckSuccess === 'ER_SUCCESS_NO_MATCH') {
			 
			if( !isSlotValid(this.event.request, "mitem") && !isSlotValid(this.event.request, "mdrink")) {
				   console.log("in bno  -- calling drink ");
					const slotToElicit = 'mitem'
					const pbspeechOutput = 'I am sorry i didnot get that what would you like to have today ';
					const repromptSpeech = 'please take your time let me know when you are ready '
					return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
				
			}
		 }
			 

		  
		  
		if (mitem) {	

		if(mitem === 'skip' && !isSlotValid(this.event.request, "nthingelse")){
				
				  // Pavan  to remove
				var updatedIntent = this.event.request.intent;
			    updatedIntent.slots.mitem.value = 'skip';	
				updatedIntent.slots.mdrink.value = 'No';	
				updatedIntent.slots.mdrinksize.value = 'no';	
				updatedIntent.slots.mdressing.value = 'No';	
			    updatedIntent.slots.combo.value = 'n';	
				const slotToElicit = 'nthingelse'
				const pbspeechOutput = randomPhrase(nelse);
				const repromptSpeech = 'didnot get that, anything else for today  '
				return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech,updatedIntent)
			} else{
									
			console.log("mslotcount  "+mslotcount+ "  mcheckSuccess  "+mcheckSuccess+"  mid "+mid);			
			if (mslotcount > 1 && mcheckSuccess === 'ER_SUCCESS_MATCH'){
				console.log("1		In mitem mslotcount " + mslotcount);	
                if(mitem === 'baconator') {
					var updatedIntent = this.event.request.intent;
					updatedIntent.slots.mitem.value = 'Baconator';	
					const slotToElicit = 'mdrink'
					const pbspeechOutput = 'What drink would you like to have with your '+mitem;
					const repromptSpeech = 'please take your time let me know when you are ready '
					return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech,updatedIntent)
				}  else {
					var gettext = getResValues(this.event.request, "mitem");
					const slotToElicit = 'mitem'
					const repromptSpeech = 'If any difficulty you can order from the menu board '
					return this.emit(':elicitSlot', slotToElicit, gettext, repromptSpeech)
				}
			} else if (mcheckSuccess == 'ER_SUCCESS_NO_MATCH') {
				console.log("1		In mitem NOMATCH ");	
				const slotToElicit = 'mitem'
				const pbspeechOutput = randomPhrase(didnotget);
				const repromptSpeech = 'If any difficulty you can order from the menu board '
				return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
			}
			
			if ( mslotcount = 1 && mcheckSuccess === 'ER_SUCCESS_MATCH' ) {
				
				
				var drink = isSlotValid(this.event.request, "mdrink");
				if( mid > 100 && mid < 106 ) {
					
					var saladsize = isSlotValid(this.event.request, "msldsize");
					
					if (!saladsize) {
							console.log("1		In mitem NOMATCH ");	
							const slotToElicit = 'msldsize'
							const pbspeechOutput = 'what size would you like to have for your '+mitem
							const repromptSpeech = 'We have Half size and Full size '
							return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
					}
		
					 console.log("1		In mitem SALAD DRESSING ");
				     var dressing;	
					if(mid == 101){
						dressing = 'NULL' ;
					}else if(mid == 102){
						dressing = 'Pomegranate Vinaigrette';
					} else if(mid == 103){
						dressing = 'NULL';
					} else if(mid == 104){
						dressing = 'Balsamic Vinaigrette';
					}else if(mid == 105){
						dressing = 'Lemon Garlic Caesar';
					}else if(mid == 106){
						dressing = 'NULL';
					}else{
						dressing = 'NULL';
					}
				var dressingslot = isSlotValid(this.event.request, "mdressing");
				console.log("1		dressing slot value "+dressingslot);
				if(!dressingslot){
					if(dressing === 'NULL'){
						const slotToElicit = 'mdressing'
						const pbspeechOutput = 'What dressing would you like to have for your '+mitem
						const repromptSpeech = 'please take your time, let me know when you are ready '
						return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
					}else{
						const slotToElicit = 'mdressing'
						const pbspeechOutput = 'your '+ mitem+ ' comes with '+dressing+' , would you like to have any other dresing ?'
						const repromptSpeech = 'please take your time, let me know when you are ready '
						return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
					}
				}
				else if(dressingslot){
                    					
					  var drsslotcount;
					  var drscheckSuccess;
					  var drsid;  //todo remove if and add try catch
					//  if (dressingslot === 'No') {
					//	   drsslotcount = 1;
					//	   drscheckSuccess  = 'ER_SUCCESS_MATCH';
					//	   drsid = 129;
					//  } else {
						 drsslotcount = getcount(this.event.request, "mdressing");
						 drscheckSuccess = getstatus(this.event.request, "mdressing"); //this.event.request.intent.slots["mdressing"].resolutions.resolutionsPerAuthority[0].status.code;
						 drsid = getid(this.event.request, "mdressing");// this.event.request.intent.slots["mdressing"].resolutions.resolutionsPerAuthority[0].values[0].value.id;	
					//  }
					
					console.log("drsslotcount  "+drsslotcount+ "  drscheckSuccess  "+drscheckSuccess+"  drsid "+drsid);
					if (drsslotcount > 1 && drscheckSuccess === 'ER_SUCCESS_MATCH'){
						console.log("In sucsess but more count");
						var gettext = getResValues(this.event.request, "mdressing");
						const slotToElicit = 'mdressing'
						const repromptSpeech = 'please take your time, let me know when you are ready '
						return this.emit(':elicitSlot', slotToElicit, gettext, repromptSpeech)
					} else if (drscheckSuccess === 'ER_SUCCESS_NO_MATCH') {
						console.log("In no match");
						const slotToElicit = 'mdressing'
						const pbspeechOutput = randomPhrase(didnotget);
						const repromptSpeech = 'please take your time, let me know when you are ready '
						return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
					} else if (drscheckSuccess === 'ER_SUCCESS_MATCH' && drsid == 130 ) {
						const slotToElicit = 'mdressing'
						const pbspeechOutput = 'What dressing would you like to have for your '+mitem
						const repromptSpeech = 'please take your time, let me know when you are ready '
						return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
					}
	
				}
					
					this.attributes['mdressing'] = dressingslot;	
					this.attributes['mitemsize'] = saladsize;
                    this.attributes['text2'] = saladsize+ mitem+ " with "+ dressingslot;					
			  } 
			  else if (!drink) {		
					
				  	var updatedIntent = this.event.request.intent;
					updatedIntent.slots.mdressing.value = 'No';	
					updatedIntent.slots.bno.value = '9999';	
					const slotToElicit = 'mdrink'
					const pbspeechOutput = 'What drink would you like with your '+mitem;
					const repromptSpeech = 'please take your time let me know when you are ready '
					return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech,updatedIntent)
			  } 
			  
			  	this.attributes['mitem'] = mitem;	
			    this.attributes['mid'] = mid;
                this.attributes['text3'] = mitem;
			}
				
			}
		} 
			
		var drink = isSlotValid(this.event.request, "mdrink");
		if(drink){							
		      var drnkslotcount;
			  var drnkcheckSuccess;
		      var drnkgetid;
			  
			  drnkslotcount = getcount(this.event.request, "mdrink");
		      drnkcheckSuccess = getstatus(this.event.request, "mdrink"); 
		      drnkgetid = getid(this.event.request, "mdrink"); 
			  
			  var drinksize = isSlotValid(this.event.request, "mdrinksize");	
			  var drnksizecheck = getstatus(this.event.request, "mdrinksize"); 

			console.log("  drnkslotcount  " +drnkslotcount +"  drnkcheckSuccess  "+drnkcheckSuccess+"  drnkgetid  "+drnkgetid);	
			
			if (drnkslotcount > 1 && drnkcheckSuccess === 'ER_SUCCESS_MATCH'){
				var gettext = getResValues(this.event.request, "mdrink");
				const slotToElicit = 'mdrink'
				//const pbspeechOutput = '....'
				const repromptSpeech = randomPhrase(didnotget);
				return this.emit(':elicitSlot', slotToElicit, gettext, repromptSpeech)
			} else if (drnkcheckSuccess === 'ER_SUCCESS_NO_MATCH') {
				const slotToElicit = 'mdrink'
				const pbspeechOutput = randomPhrase(didnotget);
				const repromptSpeech = 'we have coffee, Lemonade and all coke products '
				return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
			}
			
				if (drnkslotcount = 1 && drnkcheckSuccess === 'ER_SUCCESS_MATCH') {
					
					if (drnkgetid == 399) {
						const slotToElicit = 'mdrink'
						const pbspeechOutput = 'What drink would you like to have, we have coffee, Lemonade and all coke products '
						const repromptSpeech = 'please take your time, let me know when you are ready '
						return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
					} else if ( drnkgetid == 398 && !isSlotValid(this.event.request, "nthingelse")) {
						   var updatedIntent = this.event.request.intent;	
						   updatedIntent.slots.mdrinksize.value = 'no';
	                       updatedIntent.slots.combo.value = 'n';	
                           	const slotToElicit = 'nthingelse'
							const pbspeechOutput = randomPhrase(nelse);
							const repromptSpeech = 'didnot get that, anything else for today  '
							return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech,updatedIntent)
					} else if (drnksizecheck === 'ER_SUCCESS_NO_MATCH') {
						console.log("  --INSIDE DRINK Recheck");	
						console.log(" drinksize  "+drinksize+"  drink.toLowerCase()  "+drink.toLowerCase()+" drnkgetid "+ drnkgetid);	
						if(drnkgetid != 398){
							console.log("  --INSIDE DRINKsize 398");	
							const slotToElicit = 'mdrinksize'
							const pbspeechOutput = 'What size would you like for your ' + drink;
							const repromptSpeech = 'we have small, medium and large '
							return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
						}

					} 
						
					if (drinksize && drnksizecheck === 'ER_SUCCESS_MATCH' ) {
						
						var combocheck = isSlotValid(this.event.request, "combo");
						var updatedIntent = this.event.request.intent;	
					    var frsize = isSlotValid(this.event.request, "mfrsize");
						
						if (!combocheck && !frsize){
							console.log("  --check combo");	
							const slotToElicit = 'combo'
							const pbspeechOutput = 'Would you like to make it a combo'
							const repromptSpeech = 'You can say yes if you would like to make it a combo'
							return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech) 
						}
					}
					
					var combo = isSlotValid(this.event.request, "combo");
					this.attributes['combo'] = combo;
					if (combo) {	
							var updatedIntent = this.event.request.intent;	
							var fries = isSlotValid(this.event.request, "mfries");	
                            var comboid = getid(this.event.request, "combo"); 	
							this.attributes['comboid'] = comboid;							
						if (!fries && comboid == 1029) {	
							  console.log("  --if combo yes");				
							updatedIntent.slots.mfries.value = 'French Fries';	
						const slotToElicit = 'mfrsize'
						const pbspeechOutput = 'what size fries would you like to have for your combo'
						const repromptSpeech = 'we have small medium and large'
						return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech,updatedIntent) 
						}
						
					} 
					this.attributes['drink'] = drink;	
			        this.attributes['drnkid'] = drnkgetid;
					this.attributes['drinksize'] = drinksize;	
					this.attributes['text4'] = drinksize + ' ' +drink;
				} 

		
		}

		var mnthingelse = isSlotValid(this.event.request, "nthingelse");		
		if (mnthingelse) {	
		     nthingelse = anythingelse.call(this);
		}
		
		console.log(" Before Final IF");		
		if (this.event.request.dialogState != "COMPLETED"){
			  console.log("  --CALLING DELEGATE");	
			  this.emit(":delegate");
		}
		else{	
            var dummy = printattributes.call(this);
            var finaltext  =  wenfinaloutput.call(this);		
			var sample = 'good bye' ;
			//say the results
			console.log("  --if final Else -- STATE "+this.event.request.dialogState);	
			console.log("finaltext "+finaltext);
			//this.response.speak(finaltext);
			//this.emit(":responseReady");
			
          //  this.emit(":tellWithCard", finaltext);

		}	


    },
    'SessionEndedRequest': function () {
        var speechOutput1 = "Sorry Cannot complete request, Please try again";
        this.response.speak(speechOutput1);
        this.emit(':responseReady');
    },
};

exports.handler = (event, context) => {

    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
	console.log("In exports handler");
    alexa.registerHandlers(handlers);
    alexa.execute();
	console.log("after execute ");
};

function printattributes () {
	console.log(" In function printattributes");

	console.log("	in attributes - length " + Object.keys(this.attributes).length);			
	console.log("	this.attributes['mitem'] " + this.attributes['mitem']);
	console.log("	this.attributes['mid'] " + this.attributes['mid']);
	console.log("	this.attributes['mitemsize'] " + this.attributes['mitemsize']);
	console.log("	this.attributes['mdressing'] " + this.attributes['mdressing']);	
	console.log("	this.attributes['comboid'] " + this.attributes['comboid']);
	console.log("	this.attributes['combo'] " + this.attributes['combo']);
	console.log("	this.attributes['drink'] " + this.attributes['drink']);
	console.log("	this.attributes['drnkid'] " + this.attributes['drnkid']);
	console.log("	this.attributes['drinksize'] " + this.attributes['drinksize']);	
	console.log("	this.attributes['text1'] " + this.attributes['text1']);	
	console.log("	this.attributes['text2'] " + this.attributes['text2']);	
	console.log("	this.attributes['text3'] " + this.attributes['text3']);	
	console.log("	this.attributes['text4'] " + this.attributes['text4']);	
	console.log("	this.attributes['sideitem1'] " + this.attributes['sideitem1']);	
	console.log("	this.attributes['sideitem2'] " + this.attributes['sideitem2']);	
	console.log("	this.attributes['sideitem3'] " + this.attributes['sideitem3']);	
	console.log("	this.attributes['sideitem1_price'] " + this.attributes['sideitem1_price']);	
	console.log("	this.attributes['sideitem2_price'] " + this.attributes['sideitem2_price']);	
	console.log("	this.attributes['sideitem3_price'] " + this.attributes['sideitem3_price']);	
	
	
}

function wenfinaloutput() {
	
	    var textoutput; 
		var price;
		console.log(" In function wenfinaloutput");
        console.log("JSON request data with attributes: "+ JSON.stringify(this.event));
		console.log("JSON request data with attributes: "+ JSON.stringify(this.attributes));
		if(Object.keys(this.attributes).length === 0) {
           textoutput = "";
        } else {
		let text1 = (this.attributes['mitemsize'] === undefined) ?  " Your order is, One " + this.attributes['mitem'] : " Your order is " + this.attributes['mitemsize'] + " size " + this.attributes['mitem'] +" with " + this.attributes['mdressing'] ;
		let text2 = (this.attributes['drink'] === undefined) ?  " " : this.attributes['drinksize'] + " " + this.attributes['drink'] ;

		var mfries = isSlotValid(this.event.request, "mfries"); 
	    var mfrsize = isSlotValid(this.event.request, "mfrsize"); 
			  
		let text3 = (this.attributes['comboid'] == 1028) ? " " : mfrsize + " " + mfries  ;
		
		//side item
		let sitem1 = (this.attributes['sideitem1'] === undefined) ? " " : this.attributes['sideitem1'] ;
		let sitem2 = (this.attributes['sideitem2'] === undefined) ? " " : this.attributes['sideitem2']  ;
		let sitem3 = (this.attributes['sideitem3'] === undefined) ? " " : this.attributes['sideitem3'] ;
		
		var spitem1 = (this.attributes['sideitem1_price'] === undefined) ? 0 : this.attributes['sideitem1_price'] ;
		var spitem2 = (this.attributes['sideitem2_price'] === undefined) ? 0 : this.attributes['sideitem2_price']  ;
		var spitem3 = (this.attributes['sideitem3_price'] === undefined) ? 0 : this.attributes['sideitem3_price'] ;
		
		console.log("text123 -- "+ text1 + " -- " + text2 + " -- " + text3);
	   // textoutput = "  "+text1 + "   " + text2 + "   " + text3 + "   " + sitem1 + "   " + sitem2+ "   " +sitem3;
		textoutput = '<break time="30ms"/>'+text1 + '<break time="30ms"/>' + text2 + '<break time="30ms"/>' + text3 + '<break time="30ms"/>' + sitem1 + '<break time="30ms"/>' + sitem2+ '<break time="30ms"/>' +sitem3;
		
		
		// pricing
		
		if (this.attributes['comboid'] == 1028) {
			
			price = 6.49;
			
		} else {
			
			price = 8.49;
			
		}
		}
		
	price = Number(price + spitem1 + spitem2 + spitem3)	;
		
	var decimal = price - Math.floor(price);	
	decimal = decimal.toFixed(2)*100;
	var wprice = Math.floor(price);	
	
	var outputSpeech = textoutput+'. with Order total '+'<say-as interpret-as=\"cardinal\">'+wprice+'</say-as> dollars and <say-as interpret-as=\"cardinal\">'+decimal+'</say-as> ' +' cents .'+ randomPhrase(finalcomment);
	console.log("xxoutput : "+ outputSpeech);
	    //    this.response.speak(outputSpeech);
      // return this.emit(':tell','<say-as interpret-as="interjection">Oh boy</say-as><break time="1s"/> this is just an example.');
	    return this.emit(':tell',outputSpeech);
}	

function anythingelse() {
	//console.log(" In function anythingelse");
	var nytngelse = isSlotValid(this.event.request, "nthingelse");
	
	//console.log("In Anything else: "+ JSON.stringify(this.event.request.intent));
	
	if (nytngelse) {
		 	//console.log(" In function anythingelse -- value "+nytngelse);
		
		var nlslotcount;
		var nlcheckSuccess;
		var nlgetid;

	    nlslotcount = getcount(this.event.request, "nthingelse");
		nlcheckSuccess = getstatus(this.event.request, "nthingelse"); 
		nlgetid = getid(this.event.request, "nthingelse"); 
		
		if (this.attributes['sideitemcounter'] === undefined ) {
				this.attributes['sideitemcounter'] = 0;
		}


		//console.log(" In Anything Else -----  nlslotcount  " +nlslotcount +"  nlcheckSuccess  "+nlcheckSuccess+"  nlgetid  "+nlgetid);	
		
		if (nlslotcount == 1 && nlcheckSuccess === 'ER_SUCCESS_MATCH'){
            

			if (nlgetid > 607 && nlgetid < 613) {
				
				var nthingelsesize = isSlotValid(this.event.request, "nthingelsesize");				
				if (nthingelsesize) {
					
				//var keyinput = nlgetid.toString() +nthingelsesize;
				//	console.log(" keyinput "+keyinput);
				/*		const params = {
						TableName: 'wenprtable',
						Key:{ "key": keyinput ,
                  			  "itemno" : nlgetid	}
					}; */
					
					this.attributes['sideitemcounter'] += 1;
					var index = 'sideitem'+ this.attributes['sideitemcounter'].toString() ;
					var priceindex = 'sideitem'+ this.attributes['sideitemcounter'].toString()+'_price' ;
					console.log(" index "+index+" priceindex "+priceindex);
					//this.attributes[index] = readDynamoItemdesc(params); 
				//	this.attributes[priceindex] = readDynamoItemprice(params,'direct');
				//	console.log(" readDynamoItemdesc(params) "+readDynamoItemdesc(params)+" readDynamoItemprice(params,'direct') "+readDynamoItemprice(params,'direct'));
		  				
						 if (nlgetid == 608 ){
								 this.attributes[index] = nthingelsesize +' Vanilla Frosty';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 609 ){
								 this.attributes[index] = nthingelsesize +' Choclate Frosty';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 610 ){
								 this.attributes[index] = nthingelsesize +' french fries';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 611 ){
								 this.attributes[index] = nthingelsesize +' baconator fries';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 612 ){
								 this.attributes[index] = nthingelsesize +' Chilli';
								 this.attributes[priceindex] = 2.19;
							 }
				
				
				}
				
			} else {
				if (nlgetid != 701) {
					
										
					var keyinput = nlgetid.toString() +'NA';
					 console.log(" keyinput else "+keyinput);
				/*	const params = {
						TableName: 'wenprtable',
						Key:{ "key": keyinput ,
                  			  "itemno" : Number(nlgetid)	}
					};  */
					
					this.attributes['sideitemcounter'] += 1;
					var index = 'sideitem'+ this.attributes['sideitemcounter'].toString() ;
					var priceindex = 'sideitem'+ this.attributes['sideitemcounter'].toString()+'_price' ;
					console.log(" index "+index+" priceindex "+priceindex);
					/* readDynamoItemdesc(params , myResult=>{
												var say = '';	
												say = myResult;
												this.attributes['sideitem1'] = myResult;   //to change
									console.log("result "+ say);
											}); 
					this.attributes[priceindex] = readDynamoItemprice(params,'direct');
					console.log(" readDynamoItemdesc(params) "+this.attributes['sideitem1']+" readDynamoItemprice(params,'direct') "+readDynamoItemprice(params,'direct'));
					*/
					
						if (nlgetid == 613 ){
								 this.attributes[index] = 'Side Salad';
								 this.attributes[priceindex] = 0.99;
							 }else if(nlgetid == 614 ){
								 this.attributes[index] = 'four piece chicken nuggets';
								 this.attributes[priceindex] = 0.99;
							 }else if(nlgetid == 615 ){
								 this.attributes[index] = 'six piece chicken nuggets';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 616 ){
								 this.attributes[index] = 'Apple bites';
								 this.attributes[priceindex] = 0.99;
							 }else if(nlgetid == 602 ){
								 this.attributes[index] = 'plain baked potato';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 603 ){
								 this.attributes[index] = 'chilli cheese baked potato';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 604 ){
								 this.attributes[index] = 'bacon cheese baked potato';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 606 ){
								 this.attributes[index] = 'sour cream and chive baked potato';
								 this.attributes[priceindex] = 2.19;
							 }else if(nlgetid == 607 ){
								 this.attributes[index] = 'cheese baked potato';
								 this.attributes[priceindex] = 2.19;
							 }	
					
				}
			}
		
			
			if(nlgetid == 701){
				// complete
				//console.log(" In function anythingelse -- 701 complete");
			}else if ((nlgetid > 607 && nlgetid < 613) && !isSlotValid(this.event.request, "nthingelsesize")) {
				
				const slotToElicit = 'nthingelsesize'
				const pbspeechOutput = 'what size would you like for your '+nytngelse+'. .we have small and large';
				const repromptSpeech = 'didnot get that, can you please repeat it  '
				return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
			}else if ((nlgetid == 614 || nlgetid == 615) && !isSlotValid(this.event.request, "msidsauce") ) {
				const slotToElicit = 'msidsauce'
				const pbspeechOutput = 'What sauce would you like for your chicken nuggets';
				const repromptSpeech = randomPhrase(didnotget);
				return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
			} else {
				const slotToElicit = 'nthingelse'
				const pbspeechOutput = randomPhrase(nelse);
				const repromptSpeech = randomPhrase(didnotget);
				return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
			}
		
		} else if (nlslotcount > 1 && nlcheckSuccess === 'ER_SUCCESS_MATCH'){
				var gettext = getResValues(this.event.request, "nthingelse");
				const slotToElicit = 'nthingelse'
				//const pbspeechOutput = '....'
				const repromptSpeech = randomPhrase(didnotget);
				return this.emit(':elicitSlot', slotToElicit, gettext, repromptSpeech)
		}
		else if (nlcheckSuccess === 'ER_SUCCESS_NO_MATCH') {
			const slotToElicit = 'nthingelse'
			const pbspeechOutput = randomPhrase(didnotget);
			const repromptSpeech = randomPhrase(didnotget);
			return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
		}
		
	} else {			
        //console.log(" In function anythingelse  -- NOVALUE");	
		const slotToElicit = 'nthingelse'
		const pbspeechOutput = randomPhrase(nelse);
		const repromptSpeech = randomPhrase(didnotget);
		return this.emit(':elicitSlot', slotToElicit, pbspeechOutput, repromptSpeech)
	}
	
}

function readDynamoItemprice(params, type) {

    var AWS = require('aws-sdk');
    AWS.config.update({region: AWSregion});

    var docClient = new AWS.DynamoDB.DocumentClient();

    //console.log('reading item from DynamoDB table');

    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (type == 'combo'){
				//console.log("returning data.Item.ComboPrice "+ data.Item.ComboPrice);
				return(data.Item.ComboPrice); 
			} else {
				//console.log("returning data.Item.Price "+data.Item.Price);
				return(data.Item.Price);
			}
        }
    });
}

function readDynamoItemdesc(params, callback) {

    var AWS = require('aws-sdk');
    AWS.config.update({region: AWSregion});

    var docClient = new AWS.DynamoDB.DocumentClient();

/*const params1 = {
			TableName: 'wenprtable',
		//	Key:{ "id":'1007', "ItemNumber": '105'}
			Key:{ "key":'606NA', "itemno":606}
			//,Limit: 3
};	*/
	
    console.log('xxreading item from DynamoDB table');
	console.log('params :'+JSON.stringify(params));

    docClient.get(params, (err, data) => {
        if (err) {
            console.log("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
				callback(data.Item.Description); 
        }
    });
}

function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}


function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        ////console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

function  getcount (request, slotName) {
	var slot = request.intent.slots[slotName];
	 //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
	var count = 0;
	var res = 1;
		 //console.log("In Getcount for "+slotName);
	var result;
	let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
	
	//console.log("getstatusresolution = "+JSON.stringify(resolution));
	
	if( resolution && resolution.status.code == 'ER_SUCCESS_MATCH' ) {
		//console.log("in 1 ");
		var svalues = resolution.values;		
		//console.log("	in get count - length" + svalues.length);		
		for (var i= 0; i<svalues.length; i++) {
				//console.log("		in get count - print name" + svalues[i].value.name);
		}
		count += svalues.length;		
		//console.log("	total count" + count);
		
	}else if (!resolution && slot.value) {
		//console.log("in 2 ");
		count = 1;
	}else {
		//console.log("in 3 ");
		count = 0;
	}
	//console.log("	total count" + count);
	return count;
}

function getstatus(request, slotName) {
	var slot = request.intent.slots[slotName];
	 //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
	 //console.log("In GetStatus for "+slotName);
	var result;
	let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
	
	//console.log("getstatusresolution = "+JSON.stringify(resolution));	
	if( resolution && resolution.status.code == 'ER_SUCCESS_MATCH' ) {
		//console.log("in 1 ");
		result = resolution.status.code;
	}else if (!resolution && slot.value) {
		//console.log("in 2 ");
		result = 'ER_SUCCESS_MATCH';
	} else {
		//console.log("in else ");
		result = 'ER_SUCCESS_NO_MATCH';
	}
	//console.log("In GetStatus result "+result);	
	return(result);	
	//slot.resolutions.resolutionsPerAuthority[0].status.code
	//&& slot.resolutions.resolutionsPerAuthority[0].values[0].value.id
}


function getid(request, slotName) {
	var slot = request.intent.slots[slotName];
	 //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
	 //console.log("In GETid for "+slotName);
	var result;
	
	let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
	
	//console.log("getIDresolution = "+JSON.stringify(resolution));
	
	if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH' ) {
		//console.log("in 1 ");
		result = resolution.values[0].value.id;
	}else if (!resolution && slot.value) {
		//console.log("in 2 ");
		result = 9999;
	} else {
		//console.log("in else ");
		result = 0;
	}
	//console.log("In Getid result "+result);	
	return(result);	
	//slot.resolutions.resolutionsPerAuthority[0].status.code
	//&& slot.resolutions.resolutionsPerAuthority[0].values[0].value.id
	//this.event.request.intent.slots["mitem"].resolutions.resolutionsPerAuthority[0].values[0].value.id;	
}

function  getResValues (request, slotName) {
	var slot = request.intent.slots[slotName];
	var slotvalue = request.intent.slots[slotName].value;
	var Result;
	
	//console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
	
	if (slotName == 'mitem' &&  slotvalue.toLowerCase() == 'chicken') {
		
		Result = ' In '+ slotvalue + ' We have both sandwichs AND salads, what would you like to have ';
	    var svalues = slot.resolutions.resolutionsPerAuthority[0].values;
	
		for (var i= 0; i<svalues.length; i++) {
		if (i == svalues.length-1) {
					Result +=  'and ' +svalues[i].value.name + ' which one would you like to have ?';
		} else {
			  		Result +=  svalues[i].value.name + ' ,';
			}

		}
		
	} else if (slotName == 'mitem' &&  (slotvalue.toLowerCase() == 'spicy' || slotvalue.toLowerCase() == 'spicy chicken' ) ) {
		
		Result = ' for '+ slotvalue + '  we have ';
	    var svalues = slot.resolutions.resolutionsPerAuthority[0].values;
	
		for (var i= 0; i<svalues.length; i++) {
				var svalue;		
		if(svalues[i].value.id > 100 && svalues[i].value.id < 110){
			 svalue =  svalues[i].value.name + ' Salad';
		}else if(svalues[i].value.id > 200 && svalues[i].value.id < 215){
			 svalue =  svalues[i].value.name + ' Sandwich';
		}else{
			svalue =  svalues[i].value.name;
		}		
		if (i == svalues.length-1) {
					Result +=  'and ' + svalue + ' which one would you like to have ?';
		} else {
			  		Result +=  svalue + ' ,';
			}
		}		
	} 
	else{

	    var svalues = slot.resolutions.resolutionsPerAuthority[0].values;
	    var Eres = '  ' ;
		for (var i= 0; i<svalues.length; i++) {
		if (i == svalues.length-1) {
					Eres +=  'and ' +svalues[i].value.name ;
		} else {
			  		Eres +=  svalues[i].value.name + ' ,';
					//console.log(svalues[i].value.name);
			}
		}
		
		var i = 0;
		var result;
		var fres
		i = Math.floor(Math.random() * choosereply.length);
		//console.log("Eres" + Eres);
		fres = choosereply[i].replace("XXXX",slotvalue);
		//console.log("fres" + fres);
		Result = fres.replace("YYYY",Eres);

	}
	

	//console.log("Result" + Result);
	return Result;
	
}