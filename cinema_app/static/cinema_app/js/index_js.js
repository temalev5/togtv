var update = null;
var place = null;
var user_status = 0;
var iframe = null;
$(function(){

  if (window.addEventListener) {
    window.addEventListener('message', mwPlayerMessageReceive);
  } else {
    window.attachEvent('onmessage', mwPlayerMessageReceive);
  }

  /* LOGIN */
  if ($.cookie("session") == null){
    login_page();
  }
  /* ALREADY */
  else{
    $(".unlogin").html(" ");
    $.get("userinfo", function(data){
      $(".user_icon").text(data.nickname[0].toUpperCase());
      $(".user_nickname").text(data.nickname);
      if (data.room>-1){
        clearInterval(update);
        only_room(data.room);
        update = setInterval(only_room, 500, data.room);
        place = 2;
      }
      else{
        list_room();
        update = setInterval(list_room, 10000);
        place = 1;
      }
      /* console.log(data); */
    });
  }

  
  $(".bottom_button").on("click",function(){
    if (place==0){return;}
    else{
      if (place==1){
        create_room();
        place=3;
      }
      else{
        if (place==2){
          if ($(".bottom_button").text()=="PREPARE"){
            user_status = 0;
            $.get("userchange",{"time_stamp":-1});
            $(".bottom_button").text("READY");
          }
          else{
            user_status = 1;
            $.get("userchange",{"time_stamp":0});
            $(".bottom_button").text("PREPARE");
          }
          $("#me").toggleClass("user_ready");
        }
      }
    }
  });
  $(".top_left_side").on("click",function(){
    clearInterval(update);
    $.get("userchange",{"room":-1,"time_stamp":-1});
    list_room();
    update = setInterval(list_room, 10000);
    $(".main").css("justify-content","unset");
    $(".main").css("align-items","unset");
    $(".user_status").css("display","none");
    $(".users").css("display","none");
    user_status = 0;
  });
});


function login_page(){
  place = 0;
  $(".unlogin").css("display","flex");
  $(".input_style_img").on("click",function(){
    name = $(".input_style").val();
    if (name != ""){
      cookie = $.cookie("session",randomString(32),{ expires: 365});
      csrf_token = $.cookie("csrftoken");
      $.post("newuser",{"name":name,"csrfmiddlewaretoken":csrf_token}, function(data){
        if (data.succes == "succes"){
          $(".input_style_img").off();
          list_room();
          update = setInterval(list_room, 10000);
          $(".user_icon").text(name[0].toUpperCase());
          $(".user_nickname").text(name);
          $(".unlogin").css("display","none");
          $(".unlogin").html(" ");
          place = 1;
        }
        else{
          $.cookie("session", null, { path: '/' });
        }
      });
    }
  });
}

function create_room(){
  clearInterval(update);
  $(".main").html('<div class="table_top">\
                    <span>CREATE ROOM</span>\
                  </div>\
                  <hr noshade  style="margin: 0; background: #4a4d53;"></hr>\
                  <div id="up" class="create_room">\
                    <div class="create_room_item">\
                      <div class="room_name">Имя</div>\
                      <input id="name"></input>\
                    </div>\
                    <div class="create_room_item">\
                      <div class="room_id">ID Кинопоиск</div>\
                      <input id="ID" style="width: 0;font-size: 36px;"></input>\
                    </div>\
                  </div>\
                  <hr noshade style="max-width: 595px;margin: 0; margin-top: 30px; background: #4a4d53;"></hr>\
                  <div class="create_room">\
                    <div class="create_buttons">\
                      <div class="cancel">Отмена</div>\
                      <div class="save green button">Принять</div>\
                    </div>\
                  </div>');
  $(".cancel").on("click", function(){
    list_room();
    update = setInterval(list_room, 10000);
    place = 1;
  });
  $(".save").on("click", function(){
    name = $("#name").val();
    id = $("#ID").val();
    error = null;
    var error_field = null;
    if (!parseInt(id)){
      error = "* ID должно быть целым числом"
      error_field = 2;
    }
    if ((name != "") && (id != "")){
      $.post("newroom",{"name":name,"id":id,"csrfmiddlewaretoken":csrf_token}, function(data){
        clearInterval(update);
        only_room(data.id);
        update = setInterval(only_room,500,id);
      });
    }
    else{
      error = "* Заполните все поля !!!"
      if ((name=="") && (id=="")){
        error_field = 0;
      }
      else{
        if (name==""){
          error_field = 1;
        }
        else{
          error_field = 2;
        }
      }
    }
    if (error != null){
      if ($("#error").html() == null){
        $("#up").append('<div class="create_room_item" style="justify-content: center;">\
                          <div style="color: #ff000099;font-size: 20px;" id="error"></div>\
                        </div>');
      }
      $(".create_room input").css("border-color","#202020");
      if (error_field > 0){
        $(".create_room_item:nth-child("+error_field+") input").css("border-color","#ff000099");
      }
      else{
        $(".create_room input").css("border-color","#ff000099");
      }
      $("#error").text(error);
    }
  });
}

function list_room(){
  $.get("listroom", function(data){
    $(".main").html('<div class="table_top">\
                      <span>Name</span>\
                      <span>MEMBERS</span>\
                      <span>STATUS</span>\
                    </div>\
                    <hr noshade  style="margin: 0; background: #4a4d53;"></hr>');
    $(".main").html($(".main").html()+'<div class="list_rooms"></div>');
    for (var i in data){
      status = null;
      if (data[i].time_stamp =="-1"){status="PREPARE"}
      if (data[i].time_stamp =="0"){status="LAUNCING"}
      if (data[i].time_stamp > "0"){status="WATCHING"}
      $(".list_rooms").html($(".list_rooms").html()+'<div class="room_item">\
                                                      <span>'+data[i].name+'</span>\
                                                      <span>'+data[i].members+'</span>\
                                                      <span>'+status+'</span>\
                                                      <span class="join_room" id="'+data[i].id+'">'+"+"+'</span>\
                                                     </div>')
      console.log(data[i])
    }
    $(".join_room").off();
    $(".join_room").on("click", function(e){
      id = $(e.target).attr('id');
      clearInterval(update);
      $.get("userchange",{"room":id});
      /* only_room(id); */
      update = setInterval(only_room, 500 ,id);
      place = 2;
    });
  });
}

function only_room(id){
  $.get("roominfo",{"id":id}, function(data){
    if ($(".room_name") != data.name){
      $(".room_name").text(data.name);
    }
    if (($("#yohoho").attr("data-kinopoisk") != data.movie_id) || ($("#yohoho").attr("data-kinopoisk") == null)){
      $(".right_side").css("width","auto");
      $(".main").html('<div style="width: 956px;height: 494px;" class="kino-player">\
                        <div id="yohoho" data-kinopoisk="'+data.movie_id+'" data-player="moonwalk" data-autoplay="1"></div>\
                      </div>');
      ahoy_yo();
      iframe = $('iframe')[0].contentWindow;
      $(".main").css("justify-content","center");
      $(".main").css("align-items","center");
      $(".user_status").css("display","block");
      $(".users").css("display","flex");
      $(".bottom_button").text("READY");
    }
    var status = 0 + user_status;
    var length = 1;
    for (var i in data.users){
      if (data.users[i].time_stamp >= 0){
        status += 1;
      }
    length += 1;
    }
/*     if ($(".user_status").html()==null){
      $(".left_side").html($(".left_side").html()+'<div class="user_status">\
                                                    <span>Готовы:</span>\
                                                    <span class="ready"></span>/\<span class="count"></span>\
                                                  </div>');
    } */
    if (($(".ready").text()!=status.toString) || ($(".ready").text()==null)){
      $(".ready").text(status);
    }
    if (($(".count").text()!=status.toString) || ($(".count").text()==null)){
      $(".count").text(length);
    }
/*     if ($(".users").html()==null){
      $(".left_side").html($(".left_side").html()+'<div class="users"></div>');
    } */
    $(".users").html('<div id="256" class="user_icon user_ready"></div><div id="147" class="user_icon"></div>');
    for (var i in data.users){
      if ($("#"+data.users[i].id).html() != null){
        $("#"+data.users[i].id).text(data.users[i].name[0]);
      }
      else{
        $(".users").append('<div id="'+data.users[i].id+'" class="user_icon">'+data.users[i].name[0].toUpperCase()+'</div>');
      }
      if (($("#"+data.users[i].id).hasClass("user_ready")) && (data.users[i].time_stamp==-1)){
        $("#"+data.users[i].id).toggleClass("user_ready");
      }
      if (!($("#"+data.users[i].id).hasClass("user_ready"))&&(data.users[i].time_stamp>=0)){
        $("#"+data.users[i].id).toggleClass("user_ready");
      }
    }
    outer:for (let i = 1; i<=$(".users .user_icon").length;i++){
      for (var j in data.users){
        if ($(".users .user_icon:nth-child("+i+")").attr("id") == data.users[j].id){
          continue outer;
        }
      }
      $(".users .user_icon:nth-child("+i+")").remove();
      i--;
    }
    if (status == length){
      iframe.postMessage({ method: 'play' }, '*');
      user_status = 0
      /* clearInterval(update); */
    }
  });
}



function mwPlayerMessageReceive(event) {
  console.log(event.data);
  if (event.data && event.data.event == "started"){
    iframe.postMessage({ method: 'pause' }, '*');
    iframe.postMessage({ method: 'seek', time: 0 }, '*');
  }
  if (event.data && event.data.message == 'MW_PLAYER_TIME_UPDATE') {
    /* $.get("userchange",{"time_stamp":Math.round(event.data.value)}); */
    /* console.log('onPlayerTimeUpdate', event.data.value); */
  }
}

function randomString(i) {
  var rnd = '';
  while (rnd.length < i) 
      rnd += Math.random().toString(36).substring(2);
  return rnd.substring(0, i);
};



/* console.log(randomString(32)); */