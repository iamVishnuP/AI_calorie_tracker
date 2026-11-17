from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class MealLog(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_logs')
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES, default='breakfast')
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['date', 'created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_meal_type_display()} on {self.date}"

    @property
    def total_calories(self):
        return sum(item.calories for item in self.items.all())

    @property
    def total_protein(self):
        return sum(item.protein for item in self.items.all())

    @property
    def total_carbs(self):
        return sum(item.carbs for item in self.items.all())

    @property
    def total_fat(self):
        return sum(item.fat for item in self.items.all())


class FoodItem(models.Model):
    meal_log = models.ForeignKey(MealLog, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    serving_size = models.CharField(max_length=100, default='1 serving')
    grams = models.FloatField(null=True, blank=True)
    calories = models.FloatField(default=0.0)
    protein = models.FloatField(default=0.0)
    carbs = models.FloatField(default=0.0)
    fat = models.FloatField(default=0.0)
    is_ai_scanned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.calories} kcal)"
