from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MealLogViewSet, FoodItemDeleteView, DailySummaryView

router = DefaultRouter()
router.register(r'logs', MealLogViewSet, basename='meallog')

urlpatterns = [
    path('', include(router.urls)),
    path('items/<int:pk>/', FoodItemDeleteView.as_view(), name='fooditem_delete'),
    path('summary/', DailySummaryView.as_view(), name='daily_summary'),
]
