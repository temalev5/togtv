$(function(){

  function onPlayerTimeUpdate(player_time) {
    console.log('onPlayerTimeUpdate', player_time);
  }

  function mwPlayerMessageReceive(event) {
    if (event.data && event.data.message == 'MW_PLAYER_TIME_UPDATE') {
      onPlayerTimeUpdate(event.data.value);
    }
  }

  $(function() {
    if (window.addEventListener) {
      window.addEventListener('message', mwPlayerMessageReceive);
    } else {
      window.attachEvent('onmessage', mwPlayerMessageReceive);
    }

var list_users;
var setintrva_litem;

  setInterval(function(){
    get = $.ajax({
    type:'GET',
    url: window.location.href,
    dataType: 'json',

    success: function(obj){
      $('.room_users').html(function(){
              $('#title').text(obj.room_title);
              obj = obj.result;
              list_users = obj;
              var text = '';
              for (var user in obj){
                if (obj[user].user_status===true) {
                  var readyvar = ' ready';
                } else {
                  var readyvar = '';
                }
                if (obj[user].token === ($.cookie('session'))){
                  if (obj[user].user_status===false){
                    if ($('.readybutton').hasClass('ready')){
                      $('.readybutton').removeClass('ready').text('READY');
                    }                 
                  }
                  else{
                    if (!$('.readybutton').hasClass('ready')){
                      $('.readybutton').addClass('ready').text('PREPARE');
                    }
                  }
                }
                text += '<div class="room_user">'+obj[user].user_name+'<div class="preparedness'+ readyvar +'"></div></div>';
              }
              return text;
      });
      }
});
  },500);

  $('.readybutton').click(function(){
    $('.readybutton').toggleClass('ready');
    if ($(this).text()==="READY"){
      $(this).text("PREPARE")
    }
    else{
      $(this).text("READY")
    }
    for (var user in list_users){
      if (list_users[user].token === ($.cookie('session'))){ 
        /* $('.preparedness:eq('+user+')').toggleClass('ready'); */
          $.post( window.location.href, {'type':'status','session': list_users[user].token,'user_status': !list_users[user].user_status,'csrfmiddlewaretoken':csrf_token}, function( data ) {
            console.log(data); // John
          }, "json");
    }
  }
});

 $('.button_settings').click(function(){
  $('.room_info').css('display','none');
  $('.room_settings').css('display','block');
});
$('.button_settings_back').click(function(){
  $('.room_settings').css('display','none');
  $('.room_info').css('display','block');
});
  $('.settings_submit').click(function(){
    $('.settings_submit').html('<div class="circle"></div><div class="circle"></div><div class="circle"></div>');
    var circles = function(){
      $('.circle').toggleClass('fill');
    }
    circles();
    var circles = setInterval(circles,600);
    var title = $('.rom_title.settings:eq(0)').text();
    var user_name = $('.rom_title.settings:eq(1)').text();
    var token = $.cookie('session');
    $.post( window.location.href, {'type':'settings','server_title':title,'token':token,'user_name':user_name,'csrfmiddlewaretoken':csrf_token}, function( data ) {
      setTimeout(function(){
        clearInterval(circles);
        $('.room_settings').css('display','none');
        $('.room_info').css('display','block');
        $('.settings_submit').html('SAVE');
      }, 1000); // John
    }, "json");
  });

/*   if (!localStorage.getItem('name')) {
    localStorage.setItem('name','noname');
  };
  $('.room_users').html($('.room_users').html()+'<div class="room_user">'+localStorage.getItem('name')+'<div class="preparedness"></div></div>');
  $('.name').on('input',function(){
      localStorage.setItem('name',$('.name').val());
  });
  $('.readybutton').click(function(){
    $('.readybutton').toggleClass('ready');
    var button = $(this);
    button.text(button.text() == "PREPARE" ? "READY" : "PREPARE")   
    $('.room_user:contains('+localStorage.getItem('name')+')').children().toggleClass('ready');
  });
 */
  $( ".arrow-icon" ).click(function() {
    $(this).toggleClass("open");
    $('.room_info').toggleClass('hide');
  });

  $(window).on('unload',function() {
    $.post({
      url:window.location.href,
      async: false,
      data: {'type':'leave','session': $.cookie('session'), 'csrfmiddlewaretoken':csrf_token}, 
      success: function( data ) {
      console.log(data);}, 
      dataType: 'json',
      });
    });
  $('.movie').css({'display':'flex','align-items':'center'});
});
