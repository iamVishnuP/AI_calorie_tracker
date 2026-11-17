from rest_framework import serializers
from .models import MealLog, FoodItem

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'meal_log', 'name', 'serving_size', 'grams', 'calories', 'protein', 'carbs', 'fat', 'is_ai_scanned', 'created_at']
        read_only_fields = ['id', 'meal_log', 'created_at']

class MealLogSerializer(serializers.ModelSerializer):
    items = FoodItemSerializer(many=True, required=False)
    total_calories = serializers.FloatField(read_only=True)
    total_protein = serializers.FloatField(read_only=True)
    total_carbs = serializers.FloatField(read_only=True)
    total_fat = serializers.FloatField(read_only=True)

    class Meta:
        model = MealLog
        fields = [
            'id', 'user', 'meal_type', 'date', 'notes', 
            'created_at', 'items', 'total_calories', 
            'total_protein', 'total_carbs', 'total_fat'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'total_calories', 'total_protein', 'total_carbs', 'total_fat']

    def create(self, validated_data):
        items_data = validated_data.pop('items', None)
        if items_data is None and 'request' in self.context:
            items_data = self.context['request'].data.get('items', [])
        elif items_data is None:
            items_data = []

        meal_log = MealLog.objects.create(**validated_data)
        for item_data in items_data:
            FoodItem.objects.create(
                meal_log=meal_log,
                name=item_data.get('name', 'Food Item'),
                serving_size=item_data.get('serving_size', '1 serving'),
                grams=item_data.get('grams'),
                calories=float(item_data.get('calories', 0)),
                protein=float(item_data.get('protein', 0)),
                carbs=float(item_data.get('carbs', 0)),
                fat=float(item_data.get('fat', 0)),
                is_ai_scanned=item_data.get('is_ai_scanned', False)
            )
        return meal_log
