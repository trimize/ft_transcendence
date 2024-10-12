from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser):
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    friends = models.ManyToManyField('self', blank=True)
    blocked_friends = models.ManyToManyField('self', blank=True, related_name='blocked_by')
    pong_ball = models.IntegerField(default=0)
    pong_slider = models.IntegerField(default=0)
    tic_tac_toe_sign = models.IntegerField(default=0)
    tic_tac_toe_background = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

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