# Generated by Django 2.2.2 on 2019-08-27 10:55

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MovieRoom',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(max_length=28)),
                ('movie_id', models.IntegerField()),
                ('time_stamp', models.IntegerField(default=-1)),
            ],
        ),
        migrations.CreateModel(
            name='MovieUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(max_length=16)),
                ('token', models.TextField(max_length=32)),
                ('room', models.IntegerField(default=-1)),
                ('time_stamp', models.IntegerField(default=-1)),
                ('time_real', models.FloatField()),
            ],
        ),
    ]
