from django.urls import path,re_path
from . import views

urlpatterns = [
    path('', views.movie, name="home"),
    path('userinfo', views.userinfo),
    path('listroom', views.list_rooms),
    path('roominfo', views.room_info),
    path('newuser', views.new_user),
    path('newroom', views.new_room),
    path('userchange', views.user_change),
]