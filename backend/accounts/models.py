from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary (Little or no exercise)'),
        ('light', 'Lightly Active (1-3 days/week)'),
        ('moderate', 'Moderately Active (3-5 days/week)'),
        ('very_active', 'Very Active (6-7 days/week)'),
        ('extra_active', 'Extra Active (Physical job or 2x training)'),
    ]

    GOAL_CHOICES = [
        ('lose', 'Weight Loss (-500 kcal)'),
        ('maintain', 'Maintain Weight'),
        ('gain', 'Weight Gain (+500 kcal)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    age = models.PositiveIntegerField(default=25)
    height_cm = models.FloatField(default=175.0)
    weight_kg = models.FloatField(default=70.0)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='moderate')
    goal_type = models.CharField(max_length=20, choices=GOAL_CHOICES, default='maintain')

    daily_calorie_target = models.PositiveIntegerField(default=2000)
    daily_protein_target = models.PositiveIntegerField(default=150)
    daily_carbs_target = models.PositiveIntegerField(default=220)
    daily_fat_target = models.PositiveIntegerField(default=65)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_bmr_tdee(self):
        """Calculates BMR and TDEE using Mifflin-St Jeor equation."""
        w = float(self.weight_kg)
        h = float(self.height_cm)
        a = float(self.age)

        if self.gender == 'M':
            bmr = (10 * w) + (6.25 * h) - (5 * a) + 5
        elif self.gender == 'F':
            bmr = (10 * w) + (6.25 * h) - (5 * a) - 161
        else:
            bmr = (10 * w) + (6.25 * h) - (5 * a) - 78

        multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9,
        }
        multiplier = multipliers.get(self.activity_level, 1.55)
        tdee = bmr * multiplier

        # Adjust for goal
        if self.goal_type == 'lose':
            calories = max(1200, int(tdee - 500))
        elif self.goal_type == 'gain':
            calories = int(tdee + 500)
        else:
            calories = int(tdee)

        # Macro split: 30% Protein (4 kcal/g), 45% Carbs (4 kcal/g), 25% Fat (9 kcal/g)
        protein = int((calories * 0.30) / 4)
        carbs = int((calories * 0.45) / 4)
        fat = int((calories * 0.25) / 9)

        return {
            'calories': calories,
            'protein': protein,
            'carbs': carbs,
            'fat': fat,
        }

    def update_targets_from_profile(self):
        calculated = self.calculate_bmr_tdee()
        self.daily_calorie_target = calculated['calories']
        self.daily_protein_target = calculated['protein']
        self.daily_carbs_target = calculated['carbs']
        self.daily_fat_target = calculated['fat']

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        profile = UserProfile.objects.create(user=instance)
        profile.update_targets_from_profile()
        profile.save()
