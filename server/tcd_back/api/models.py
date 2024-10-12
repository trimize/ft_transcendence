from django.db import models

# Create your models here.
class User(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=50)
	email = models.EmailField()
	password = models.CharField(max_length=100)
	friends = models.ManyToManyField('self', blank=True)
	blocked_friends = models.ManyToManyField('self', blank=True)
	pong_ball = models.IntegerField(default=9)
	pong_slider = models.IntegerField(default=9)
	tic_tac_toe_sign = models.IntegerField(default=9)
	tic_tac_toe_background = models.IntegerField(default=9)

	def __str__(self):
		return self.name

class Match_Record(models.Model):
	id = models.AutoField(primary_key=True)
	game = models.CharField(max_length=20)
	player1 = models.ForeignKey(User, related_name='player1_matches', on_delete=models.PROTECT, null=True, blank=True)
	player2 = models.ForeignKey(User, related_name='player2_matches', on_delete=models.PROTECT, null=True, blank=True)
	match_type = models.CharField(max_length=20)
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	player1_ball_touch = models.IntegerField(default=0)
	player2_ball_touch = models.IntegerField(default=0)
	player1_consec_touch = models.IntegerField(default=0)
	player2_consec_touch = models.IntegerField(default=0)
	fastest_ball_speed = models.IntegerField(default=0)
	end_time = models.DateTimeField(null=True)

	def __str__(self):
		return self.game