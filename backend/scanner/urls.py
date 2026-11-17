from django.urls import path
from .views import AnalyzeFoodImageView

urlpatterns = [
    path('analyze-image/', AnalyzeFoodImageView.as_view(), name='analyze_food_image'),
]
