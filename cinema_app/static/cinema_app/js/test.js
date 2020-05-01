$(function(){
$("#whichkey").on( "keydown", function( event ) {
	if (event.which==40){
		event.preventDefault();
	$(".1").focus();
	}
  $( "#log" ).html( event.type + ": " +  event.which );
}); 	
});
