from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.db.models import F
from django.core.exceptions import ValidationError

def validate_no_spaces(value):
    if ' ' in value:
        raise ValidationError('Username should not contain spaces')

def validate_length(value):
    if len(value) < 3 or len(value) > 12:
        raise ValidationError('Username should be between 3 and 12 characters long')

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
    username = models.CharField(max_length=12, unique=True, validators=[
            validate_length,
            validate_no_spaces
        ])
    email = models.EmailField(unique=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', default="profile_pics/default_user.jpg")
    friends = models.ManyToManyField('self', blank=True)
    invitations_received = models.ManyToManyField('self', blank=True)
    invitations_sent = models.ManyToManyField('self', blank=True)
    blocked_friends = models.ManyToManyField('self', blank=True, related_name='blocked_by')
    pong_ball = models.IntegerField(default=0)
    pong_slider = models.IntegerField(default=0)
    tic_tac_toe_sign = models.IntegerField(default=0)
    tic_tac_toe_background = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=16, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    @property
    def wins(self):
        return (
            self.player1_matches.filter(player1_score__gt=F('player2_score'), end_time__isnull=False).count() +
            self.player2_matches.filter(player2_score__gt=F('player1_score'), end_time__isnull=False).count()
        )

    @property
    def losses(self):
        return (
            self.player1_matches.filter(player1_score__lt=F('player2_score'), end_time__isnull=False).count() +
            self.player2_matches.filter(player2_score__lt=F('player1_score'), end_time__isnull=False).count()
        )

class FriendInvitation(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, related_name='sent_invitations', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_invitations', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending') # pending accepted refused

    def __str__(self):
        return f"Invitation from {self.sender} to {self.receiver} ({self.status})"

class Match_Record(models.Model):
	id = models.AutoField(primary_key=True)
	game = models.CharField(max_length=20) # pong tic_tac_toe
	player1 = models.ForeignKey(User, related_name='player1_matches', on_delete=models.PROTECT, null=True, blank=True)
	player2 = models.ForeignKey(User, related_name='player2_matches', on_delete=models.PROTECT, null=True, blank=True)
	match_type = models.CharField(max_length=20) # singleplayer local_multiplayer online_multiplayer
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	player1_ball_touch = models.IntegerField(default=0)
	player2_ball_touch = models.IntegerField(default=0)
	player1_consec_touch = models.IntegerField(default=0)
	player2_consec_touch = models.IntegerField(default=0)
	fastest_ball_speed = models.IntegerField(default=0)
	ball_speed = models.IntegerField(default=20)
	ball_acc = models.BooleanField(default=False)
	powers = models.BooleanField(default=False)
	ai = models.CharField(max_length=20, null=True)
	start_time = models.DateTimeField(null=True)
	end_time = models.DateTimeField(null=True)

	def __str__(self):
		return self.game

class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
# Assign unique related_name for each player
    player1 = models.ForeignKey(User, related_name='tournaments_as_player1', on_delete=models.PROTECT)
    player2 = models.ForeignKey(User, related_name='tournaments_as_player2', on_delete=models.PROTECT, null=True, blank=True)
    player3 = models.ForeignKey(User, related_name='tournaments_as_player3', on_delete=models.PROTECT, null=True, blank=True)
    player4 = models.ForeignKey(User, related_name='tournaments_as_player4', on_delete=models.PROTECT, null=True, blank=True)

    # Assign unique related_name for each match
    match1 = models.ForeignKey(Match_Record, related_name='tournament_match1', on_delete=models.PROTECT, null=True, blank=True)
    match2 = models.ForeignKey(Match_Record, related_name='tournament_match2', on_delete=models.PROTECT, null=True, blank=True)
    playoff = models.ForeignKey(Match_Record, related_name='tournament_playoff', on_delete=models.PROTECT, null=True, blank=True)
    final_match = models.ForeignKey(Match_Record, related_name='tournament_final', on_delete=models.PROTECT, null=True, blank=True)

    first_place = models.ForeignKey(User, related_name='tournaments_won', on_delete=models.PROTECT, null=True, blank=True)
    second_place = models.ForeignKey(User, related_name='tournaments_second', on_delete=models.PROTECT, null=True, blank=True)
    third_place = models.ForeignKey(User, related_name='tournaments_third', on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f"Tournament {self.id}"