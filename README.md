# Calorie tracker - AI powered

A modern, high-contrast **black-and-white minimalist** full-stack calorie tracker powered by **Django REST Framework**, **React (Vite)**, and **Google Gemini Multimodal AI**.

---

## Key Features

1. **AI Vision Food Scanning**:
   - Snap a food photo or upload an image file.
   - Detects individual food items on the plate and estimates portion size in grams, calories, and macronutrients (Protein, Carbs, Fat).
   - **Review & Edit Modal**: Verify and edit detected ingredients, weights, and calories before committing to your log.
   - Powered by Google Gemini Flash via server-side configuration with intelligent fallback analyzer.

2. **Categorized Daily Logging**:
   - Meals organized into **Breakfast**, **Lunch**, **Dinner**, and **Snacks**.
   - Live circular progress ring comparing consumed calories vs. daily target.
   - Macro progress indicators for Protein, Carbohydrates, and Fats.
   - Full date navigator with `< Prev Day`, `Next Day >`, and date picker.

3. **Historical Analytics (Daily / Monthly / Yearly)**:
   - **14 Days**: Daily calorie trend line against targets and macro breakdown.
   - **30 Days**: Monthly daily averages and intake trends.
   - **Yearly**: 12-month calendar aggregation showing monthly averages and active tracking days.

4. **Authentication, Health Onboarding & Account Management**:
   - Secure JWT Authentication (Sign In & Register).
   - Biometric profile setup: Gender, Age, Height (cm), Weight (kg), and Activity Multiplier.
   - Auto-computes **BMR & TDEE** via the **Mifflin-St Jeor equation** with manual goal overrides.
   - **Delete Account Permanently**: Full self-service account and data deletion in the Profile section.

---

## How to Run

### 1. Start the Django Backend
```bash
cd backend
python manage.py runserver 127.0.0.1:8000
```
*(Or double-click `run_backend.bat`)*

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
*(Or double-click `run_frontend.bat`)*

Open your browser at `http://localhost:5173`.
