from django.db import models

# Create your models here.
class User(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=50)
	email = models.EmailField()
	password = models.CharField(max_length=100)
	friends = models.ManyToManyField('self', blank=True)

	def __str__(self):
		return self.name

class Match_Record(models.Model):
	id = models.AutoField(primary_key=True)
	game = models.CharField(max_length=20)
	player1 = models.ForeignKey(User, related_name='player1_matches', on_delete=models.PROTECT)
    player2 = models.ForeignKey(User, related_name='player2_matches', on_delete=models.PROTECT)
	match_type = models.CharField(max_length=20)
	player1_score = models.IntegerField()
	player2_score = models.IntegerField()
	end_time = models.DateTimeField()

	def __str__(self):
		return self.game