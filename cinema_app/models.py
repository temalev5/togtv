from django.db import models

# Create your models here.


class MovieRoom(models.Model):
    name = models.TextField(max_length=28)
    movie_id = models.IntegerField()
    time_stamp = models.IntegerField(default=-1)


class MovieUser(models.Model):
    name = models.TextField(max_length=16)
    token = models.TextField(max_length=32)
    room = models.IntegerField(default=-1)
    time_stamp = models.IntegerField(default=-1)
    time_real = models.FloatField()
