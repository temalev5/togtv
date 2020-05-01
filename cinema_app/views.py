from django.http import JsonResponse
from django.shortcuts import render,redirect
from django.utils.crypto import get_random_string
from .models import MovieRoom, MovieUser
from django.core import serializers
import json
from threading import Timer
import time
import threading


def remove_users():
    while True:
        try:
            time.sleep(2)
            users = MovieUser.objects.all().values("id", "room", "time_real")
            for user in users:
                if user.get("room") == -1:
                    continue
                if (time.time()-user.get("time_real")) > 2:
                    user = MovieUser.objects.get(id=user.get("id"))
                    user.room = -1
                    user.time_stamp = -1
                    user.save()
        except:
            pass

# Create your views here.
def remove_room(movie_room_one):
    movie_room_one.delete()


def user_change(request):
    cookie = request.COOKIES.get('session')
    user = MovieUser.objects.get(token=cookie)
    if request.GET.get("name"):
        user.name = request.GET.get("name")
    if request.GET.get("room"):
        user.room = request.GET.get("room")
    if request.GET.get("time_stamp"):
        user.time_stamp = request.GET.get("time_stamp")
    user.save()
    return JsonResponse({"status": "succes"})


def new_room(request):
    name = request.POST.get('name')
    movie_id = request.POST.get('id')
    cookie = request.COOKIES.get('session')
    room = MovieRoom.objects.create(name=name, movie_id=movie_id)
    room.save()
    user = MovieUser.objects.get(token=cookie)
    user.room = room.id
    user.save()
    return JsonResponse({"id": room.id})


def new_user(request):
    name = request.POST.get('name')
    cookie = request.COOKIES.get('session')
    print(time.time())
    user = MovieUser.objects.create(name=name, token=cookie, time_real=time.time())
    user.save()
    return JsonResponse({"succes":"succes"})


def userinfo(request):
    cookie = request.COOKIES.get('session')
    user = MovieUser.objects.get(token=cookie)
    user = {
        "nickname": user.name,
        "room": user.room,
    }
    return JsonResponse(user)


def list_rooms(request):
    rooms = MovieRoom.objects.all().values('id', 'name', 'movie_id', 'time_stamp')
    list_rooms = {}
    for i in range(len(rooms)):
        users_all = MovieUser.objects.filter(room=rooms[i].get('id'))
        users_ready = len(users_all.exclude(time_stamp=-1))
        users_all = len(users_all)
        rooms[i].update({"members": str(users_ready) + "/" + str(users_all)})
        list_rooms.update({i: rooms[i]})
    return JsonResponse(list_rooms)


def room_info(request):
    cookie = request.COOKIES.get('session')
    user = MovieUser.objects.get(token=cookie)
    user.time_real = time.time()
    print(time.time())
    user.save()
    room_id = request.GET.get('id')
    room = MovieRoom.objects.get(id=room_id)
    users = []
    if room:
        users = MovieUser.objects.filter(room=room_id).exclude(token=cookie).values("name", "id", "time_stamp")
    room_info = {
        "name": room.name,
        "movie_id": room.movie_id,
        "users": {i: users[i] for i in range(0, len(users))}
    }
    return JsonResponse(room_info)


def movie(request):
    return render(request, 'index_login.html')


threading.Thread(target=remove_users, daemon=True).start()



#     if (request.method == "GET"):
#         movie_rooms = MovieRoom.objects.all()
#         info = {
#             'movie_rooms' : movie_rooms,
#         }
#         response = render(request,'index.html',info)
#         if (request.COOKIES.get('session') is None):
#             response.set_cookie(key='session', value=get_random_string(length=32), max_age=(365 * 24 * 60 * 60))
#             return response
#         else:
#             session = request.COOKIES.get('session')
#             try:
#                 user = MovieUser.objects.get(token=session)
#                 info = {
#                     'movie_rooms': movie_rooms,
#                     'user_name': user.user_name,
#                 }
#                 return render(request, 'index.html', info)
#             except:
#                 return response
#     else:
#         form = request.POST.get('kino_ID')
#         obj = MovieRoom.objects.create(MovieRoom_Name='movie room #1', Movie_ID=form, MovieRoom_playing = False, MovieRoom_timming = 0)
#         obj.MovieRoom_Name = 'movie room #'+str(obj.id)
#         obj.save()
#         return redirect('/room?id='+str(obj.id))
#
#
# def room(request):
#     if (request.method == "GET"):
#         if request.is_ajax():
#             user = MovieUser.objects.get(token=request.COOKIES.get('session'))
#             movie_room_one = MovieRoom.objects.get(id=request.GET.get('id'))
#             if (user.movie_room is None):
#                 user.movie_room = movie_room_one
#                 user.save()
#             data = MovieUser.objects.filter(movie_room=movie_room_one).values('user_name','token','user_status')
#             new_data={}
#             for i in range(len(data)):
#                 new_data[i] = data[i]
#             return JsonResponse({'room_title':movie_room_one.MovieRoom_Name,'result': new_data})
#         else:
#             try:
#                 movie_room_one = MovieRoom.objects.get(id=request.GET.get('id'))
#             except:
#                 return redirect('home')
#             if (request.COOKIES.get('session') is None):
#                 session = get_random_string(length=32)
#                 response = request.set_cookie(key='session', value=session, max_age=(365 * 24 * 60 * 60))
#                 user = MovieUser.objects.create(user_name='noname',token=session,user_status=False,movie_room=movie_room_one)
#                 user.save()
#                 print(str(user.user_name))
#             else:
#                 try:
#                     print('Я try GET')
#                     user = MovieUser.objects.get(token=request.COOKIES.get('session'))
#                     user.movie_room = movie_room_one
#                     user.save()
#                     print('Я GET')
#                 except:
#                     user = MovieUser.objects.create(user_name='noname',token=request.COOKIES.get('session'),user_status=False,movie_room=movie_room_one)
#                     user.movie_room = movie_room_one
#                     user.save()
#             room_users = MovieUser.objects.filter(movie_room=request.GET.get('id'))
#             info = {
#                'movie': movie_room_one,
#                'room_users': room_users,
#                 'user': user,
#             }
#             return render(request,'room.html',info)
#     else:
#         if request.is_ajax():
#             if (request.POST['type'] == "status"):
#                 session = request.POST['session']
#                 user_status = request.POST['user_status']
#                 print(user_status)
#                 user = MovieUser.objects.get(token=session)
#                 if (user_status== 'true'):
#                     user.user_status = True
#                 else:
#                     user.user_status = False
#                 user.save()
#                 return JsonResponse({'result':'success'})
#             elif (request.POST['type'] == "settings"):
#                 movie_room_one = MovieRoom.objects.get(id=request.GET.get('id'))
#                 server_title = request.POST['server_title']
#                 if (movie_room_one.MovieRoom_Name != server_title):
#                     movie_room_one.MovieRoom_Name = server_title
#                     movie_room_one.save()
#                 session = request.POST['token']
#                 user_name = request.POST['user_name']
#                 user = MovieUser.objects.get(token=session)
#                 if (user.user_name != user_name):
#                     user.user_name = user_name
#                     user.save()
#                 return JsonResponse({'result': 'success'})
#             elif (request.POST['type'] == "leave"):
#                 session = request.POST['session']
#                 movie_room_one = MovieRoom.objects.get(id=request.GET.get('id'))
#                 user = MovieUser.objects.get(token=session)
#                 if (user.movie_room == movie_room_one):
#                     user.movie_room = None
#                     user.user_status = False
#                     user.save()
#                     print('я POST')
#                 user = MovieUser.objects.filter(movie_room=movie_room_one).values('movie_room')
#                 if (len(user)==0):
#                     print('я поппал в таймер и че')
#                     Timer(300, remove_room,args=(movie_room_one,)).start()
#                 print(len(user))
#                 #if movie_roome_one
#                 return JsonResponse({'result': 'success'})

