# Generated by Django 5.1.1 on 2024-10-14 13:44

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('username', models.CharField(max_length=255, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('pong_ball', models.IntegerField(default=0)),
                ('pong_slider', models.IntegerField(default=0)),
                ('tic_tac_toe_sign', models.IntegerField(default=0)),
                ('tic_tac_toe_background', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('totp_secret', models.CharField(blank=True, max_length=16, null=True)),
                ('blocked_friends', models.ManyToManyField(blank=True, related_name='blocked_by', to=settings.AUTH_USER_MODEL)),
                ('friends', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Match_Record',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('game', models.CharField(max_length=20)),
                ('match_type', models.CharField(max_length=20)),
                ('player1_score', models.IntegerField(default=0)),
                ('player2_score', models.IntegerField(default=0)),
                ('player1_ball_touch', models.IntegerField(default=0)),
                ('player2_ball_touch', models.IntegerField(default=0)),
                ('player1_consec_touch', models.IntegerField(default=0)),
                ('player2_consec_touch', models.IntegerField(default=0)),
                ('fastest_ball_speed', models.IntegerField(default=0)),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(null=True)),
                ('player1', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='player1_matches', to=settings.AUTH_USER_MODEL)),
                ('player2', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='player2_matches', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
