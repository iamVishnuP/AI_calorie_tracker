from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime
from .models import MealLog, FoodItem
from .serializers import MealLogSerializer, FoodItemSerializer

class MealLogViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MealLogSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = MealLog.objects.filter(user=user)
        date_str = self.request.query_params.get('date', None)
        if date_str:
            try:
                date_val = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_val)
            except ValueError:
                pass
        return queryset.prefetch_related('items')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FoodItemDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = FoodItem.objects.get(pk=pk, meal_log__user=request.user)
            item.delete()
            return Response({'message': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except FoodItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)


class DailySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        date_str = request.query_params.get('date', None)
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = timezone.now().date()
        else:
            target_date = timezone.now().date()

        meal_logs = MealLog.objects.filter(user=user, date=target_date).prefetch_related('items')

        # Structure by meal types
        meal_categories = {
            'breakfast': {'label': 'Breakfast', 'items': [], 'calories': 0.0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0},
            'lunch': {'label': 'Lunch', 'items': [], 'calories': 0.0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0},
            'dinner': {'label': 'Dinner', 'items': [], 'calories': 0.0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0},
            'snack': {'label': 'Snack', 'items': [], 'calories': 0.0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0},
        }

        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fat = 0.0

        for meal in meal_logs:
            m_type = meal.meal_type
            if m_type not in meal_categories:
                m_type = 'snack'

            for item in meal.items.all():
                meal_categories[m_type]['items'].append(FoodItemSerializer(item).data)
                meal_categories[m_type]['calories'] += item.calories
                meal_categories[m_type]['protein'] += item.protein
                meal_categories[m_type]['carbs'] += item.carbs
                meal_categories[m_type]['fat'] += item.fat

                total_calories += item.calories
                total_protein += item.protein
                total_carbs += item.carbs
                total_fat += item.fat

        # Target numbers from profile
        profile = getattr(user, 'profile', None)
        target_calories = profile.daily_calorie_target if profile else 2000
        target_protein = profile.daily_protein_target if profile else 150
        target_carbs = profile.daily_carbs_target if profile else 220
        target_fat = profile.daily_fat_target if profile else 65

        remaining_calories = max(0.0, target_calories - total_calories)

        return Response({
            'date': str(target_date),
            'totals': {
                'calories': round(total_calories, 1),
                'protein': round(total_protein, 1),
                'carbs': round(total_carbs, 1),
                'fat': round(total_fat, 1),
            },
            'targets': {
                'calories': target_calories,
                'protein': target_protein,
                'carbs': target_carbs,
                'fat': target_fat,
            },
            'remaining_calories': round(remaining_calories, 1),
            'progress_percent': min(100.0, round((total_calories / target_calories * 100) if target_calories > 0 else 0, 1)),
            'meals': meal_categories
        })
