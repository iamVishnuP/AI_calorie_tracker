from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta, date, datetime
from meals.models import MealLog, FoodItem
import calendar

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'daily').lower()
        today = timezone.now().date()

        profile = getattr(user, 'profile', None)
        target_calories = profile.daily_calorie_target if profile else 2000

        if period == 'monthly':
            # Last 30 days or months breakdown
            return self._get_monthly_analytics(user, today, target_calories)
        elif period == 'yearly':
            # 12 months of current year or last 12 months
            return self._get_yearly_analytics(user, today, target_calories)
        else:
            # Default: Daily view (last 14 days)
            return self._get_daily_analytics(user, today, target_calories)

    def _get_daily_analytics(self, user, today, target_calories):
        days_count = 14
        start_date = today - timedelta(days=days_count - 1)
        
        # Query all items in this date range
        logs = MealLog.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=today
        ).prefetch_related('items')

        # Aggregate per date
        daily_map = {}
        curr = start_date
        while curr <= today:
            daily_map[curr] = {
                'date': curr.strftime('%Y-%m-%d'),
                'label': curr.strftime('%b %d'),
                'day_name': curr.strftime('%a'),
                'calories': 0.0,
                'protein': 0.0,
                'carbs': 0.0,
                'fat': 0.0,
                'target': target_calories
            }
            curr += timedelta(days=1)

        for log in logs:
            d = log.date
            if d in daily_map:
                for item in log.items.all():
                    daily_map[d]['calories'] += item.calories
                    daily_map[d]['protein'] += item.protein
                    daily_map[d]['carbs'] += item.carbs
                    daily_map[d]['fat'] += item.fat

        chart_data = list(daily_map.values())
        for pt in chart_data:
            pt['calories'] = round(pt['calories'], 1)
            pt['protein'] = round(pt['protein'], 1)
            pt['carbs'] = round(pt['carbs'], 1)
            pt['fat'] = round(pt['fat'], 1)

        # Calculate KPIs
        calories_list = [pt['calories'] for pt in chart_data if pt['calories'] > 0]
        avg_calories = round(sum(calories_list) / len(calories_list), 1) if calories_list else 0.0
        total_calories = round(sum(pt['calories'] for pt in chart_data), 1)
        total_protein = round(sum(pt['protein'] for pt in chart_data), 1)
        total_carbs = round(sum(pt['carbs'] for pt in chart_data), 1)
        total_fat = round(sum(pt['fat'] for pt in chart_data), 1)

        days_target_met = sum(1 for pt in chart_data if pt['calories'] > 0 and abs(pt['calories'] - target_calories) <= 250)

        return Response({
            'period': 'daily',
            'chart_data': chart_data,
            'summary': {
                'avg_daily_calories': avg_calories,
                'total_calories': total_calories,
                'target_calories': target_calories,
                'days_tracked': len(calories_list),
                'days_target_met': days_target_met,
                'total_macros': {
                    'protein': total_protein,
                    'carbs': total_carbs,
                    'fat': total_fat,
                }
            }
        })

    def _get_monthly_analytics(self, user, today, target_calories):
        # 30 days breakdown
        start_date = today - timedelta(days=29)
        logs = MealLog.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=today
        ).prefetch_related('items')

        daily_map = {}
        curr = start_date
        while curr <= today:
            daily_map[curr] = {
                'date': curr.strftime('%Y-%m-%d'),
                'label': curr.strftime('%d %b'),
                'calories': 0.0,
                'protein': 0.0,
                'carbs': 0.0,
                'fat': 0.0,
                'target': target_calories
            }
            curr += timedelta(days=1)

        for log in logs:
            d = log.date
            if d in daily_map:
                for item in log.items.all():
                    daily_map[d]['calories'] += item.calories
                    daily_map[d]['protein'] += item.protein
                    daily_map[d]['carbs'] += item.carbs
                    daily_map[d]['fat'] += item.fat

        chart_data = list(daily_map.values())
        for pt in chart_data:
            pt['calories'] = round(pt['calories'], 1)
            pt['protein'] = round(pt['protein'], 1)
            pt['carbs'] = round(pt['carbs'], 1)
            pt['fat'] = round(pt['fat'], 1)

        calories_list = [pt['calories'] for pt in chart_data if pt['calories'] > 0]
        avg_calories = round(sum(calories_list) / len(calories_list), 1) if calories_list else 0.0
        total_calories = round(sum(pt['calories'] for pt in chart_data), 1)

        return Response({
            'period': 'monthly',
            'chart_data': chart_data,
            'summary': {
                'avg_daily_calories': avg_calories,
                'total_calories': total_calories,
                'target_calories': target_calories,
                'days_tracked': len(calories_list),
                'total_macros': {
                    'protein': round(sum(pt['protein'] for pt in chart_data), 1),
                    'carbs': round(sum(pt['carbs'] for pt in chart_data), 1),
                    'fat': round(sum(pt['fat'] for pt in chart_data), 1),
                }
            }
        })

    def _get_yearly_analytics(self, user, today, target_calories):
        # 12 calendar months of current year
        year = today.year
        months_data = []

        for m in range(1, 13):
            month_start = date(year, m, 1)
            _, last_day = calendar.monthrange(year, m)
            month_end = date(year, m, last_day)

            logs = MealLog.objects.filter(
                user=user, 
                date__gte=month_start, 
                date__lte=month_end
            ).prefetch_related('items')

            m_cal = 0.0
            m_prot = 0.0
            m_carbs = 0.0
            m_fat = 0.0
            days_active = set()

            for log in logs:
                days_active.add(log.date)
                for item in log.items.all():
                    m_cal += item.calories
                    m_prot += item.protein
                    m_carbs += item.carbs
                    m_fat += item.fat

            daily_avg = round(m_cal / len(days_active), 1) if days_active else 0.0

            months_data.append({
                'month': calendar.month_abbr[m],
                'label': calendar.month_abbr[m],
                'total_calories': round(m_cal, 1),
                'avg_daily_calories': daily_avg,
                'target': target_calories,
                'days_active': len(days_active),
                'protein': round(m_prot, 1),
                'carbs': round(m_carbs, 1),
                'fat': round(m_fat, 1),
            })

        active_months = [m for m in months_data if m['days_active'] > 0]
        year_avg = round(sum(m['avg_daily_calories'] for m in active_months) / len(active_months), 1) if active_months else 0.0
        total_yearly_calories = round(sum(m['total_calories'] for m in months_data), 1)

        return Response({
            'period': 'yearly',
            'year': year,
            'chart_data': months_data,
            'summary': {
                'avg_daily_calories': year_avg,
                'total_calories': total_yearly_calories,
                'target_calories': target_calories,
                'active_months': len(active_months),
                'total_macros': {
                    'protein': round(sum(m['protein'] for m in months_data), 1),
                    'carbs': round(sum(m['carbs'] for m in months_data), 1),
                    'fat': round(sum(m['fat'] for m in months_data), 1),
                }
            }
        })
