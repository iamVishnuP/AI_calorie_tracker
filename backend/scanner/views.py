import json
import base64
import os
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from PIL import Image
import io

class AnalyzeFoodImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image', None)
        base64_data = request.data.get('image_base64', None)
        user_api_key = request.headers.get('X-Gemini-Key') or request.data.get('api_key') or getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')

        image_bytes = None
        mime_type = 'image/jpeg'

        if image_file:
            image_bytes = image_file.read()
            mime_type = image_file.content_type or 'image/jpeg'
        elif base64_data:
            try:
                if ',' in base64_data:
                    header, base64_data = base64_data.split(',', 1)
                    if 'image/png' in header:
                        mime_type = 'image/png'
                    elif 'image/webp' in header:
                        mime_type = 'image/webp'
                image_bytes = base64.b64decode(base64_data)
            except Exception as e:
                return Response({'error': f'Invalid base64 image data: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Please provide an image file or base64 image data.'}, status=status.HTTP_400_BAD_REQUEST)

        # Call Gemini if key exists
        if user_api_key and user_api_key.strip():
            result = self._call_gemini_vision(image_bytes, mime_type, user_api_key.strip())
            if result.get('success'):
                return Response(result['data'])
            else:
                # If Gemini failed with an error, fall back to mock analysis but let user know
                fallback = self._get_fallback_analysis(image_bytes)
                fallback['notice'] = f"Gemini API attempt had an issue ({result.get('error')}). Using simulated nutrition analysis."
                return Response(fallback)
        else:
            # Informative fallback when no key is set yet
            fallback = self._get_fallback_analysis(image_bytes)
            fallback['notice'] = "Running in Demo Mode. To use live Google Gemini Vision AI, provide your free API key in Settings or the Scan modal."
            return Response(fallback)

    def _call_gemini_vision(self, image_bytes, mime_type, api_key):
        prompt = """
You are an expert nutritionist and visual food analyst AI.
Analyze this food image accurately. Identify all distinct food items present on the plate or in the image.
Estimate the portion size in grams, calories, and macronutrients (protein, carbs, fat in grams).

Return STRICTLY a JSON object with this exact structure, with no markdown code fences and no extraneous text:
{
  "dish_name": "Descriptive name of overall meal",
  "detected_items": [
    {
      "name": "Food item name",
      "serving_size": "e.g., 1 cup, 150g, 1 slice",
      "grams": 150,
      "calories": 250,
      "protein": 20,
      "carbs": 15,
      "fat": 8,
      "confidence": "high"
    }
  ],
  "total_calories": 500,
  "total_protein": 30,
  "total_carbs": 45,
  "total_fat": 18,
  "health_insights": "Brief 1-2 sentence nutritional insight about this meal."
}
"""
        # Try google.generativeai first
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            # Using models like gemini-2.5-flash or gemini-1.5-flash
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            image = Image.open(io.BytesIO(image_bytes))
            response = model.generate_content([prompt, image])
            text = response.text.strip()
            
            # Clean JSON if markdown fenced
            if text.startswith('```'):
                lines = text.split('\n')
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].startswith('```'):
                    lines = lines[:-1]
                text = '\n'.join(lines).strip()
                
            data = json.loads(text)
            data['provider'] = 'google-gemini-vision'
            return {'success': True, 'data': data}
        except Exception as e:
            # Try new google.genai client if needed
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[
                        genai.types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        prompt
                    ]
                )
                text = response.text.strip()
                if text.startswith('```'):
                    lines = text.split('\n')
                    if lines[0].startswith('```'):
                        lines = lines[1:]
                    if lines and lines[-1].startswith('```'):
                        lines = lines[:-1]
                    text = '\n'.join(lines).strip()
                data = json.loads(text)
                data['provider'] = 'google-genai-sdk'
                return {'success': True, 'data': data}
            except Exception as e2:
                return {'success': False, 'error': f"{str(e)} / {str(e2)}"}

    def _get_fallback_analysis(self, image_bytes):
        """Intelligent fallback for testing when API key is pending."""
        return {
            "dish_name": "Mixed Nourish Bowl",
            "detected_items": [
                {
                    "name": "Grilled Chicken Breast / Lean Protein",
                    "serving_size": "150g",
                    "grams": 150,
                    "calories": 240,
                    "protein": 42.0,
                    "carbs": 0.0,
                    "fat": 5.0,
                    "confidence": "high"
                },
                {
                    "name": "Steamed Brown Rice / Quinoa",
                    "serving_size": "1 cup (180g)",
                    "grams": 180,
                    "calories": 215,
                    "protein": 5.0,
                    "carbs": 45.0,
                    "fat": 1.8,
                    "confidence": "high"
                },
                {
                    "name": "Roasted Mixed Veggies (Broccoli, Carrots)",
                    "serving_size": "100g",
                    "grams": 100,
                    "calories": 65,
                    "protein": 2.8,
                    "carbs": 11.0,
                    "fat": 1.5,
                    "confidence": "medium"
                },
                {
                    "name": "Avocado Slices / Healthy Fats",
                    "serving_size": "50g",
                    "grams": 50,
                    "calories": 80,
                    "protein": 1.0,
                    "carbs": 4.0,
                    "fat": 7.5,
                    "confidence": "medium"
                }
            ],
            "total_calories": 600,
            "total_protein": 50.8,
            "total_carbs": 60.0,
            "total_fat": 15.8,
            "health_insights": "Well-balanced macro distribution with high lean protein, complex carbohydrates, and essential healthy fats.",
            "provider": "smart-preview-analyzer"
        }
