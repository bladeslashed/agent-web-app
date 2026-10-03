# Project 03: Student Exam Score Prediction (Multiple Linear Regression)

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Multiple Linear Regression |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Student Study Habits & Examination Records |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict final test scores from study hours, previous exam scores, attendance rate, and sleep duration.

---

## 2. Theoretical Foundations
Multiple linear regression assesses the partial effects of multiple educational factors simultaneously. Each coefficient $\beta_j$ represents the expected change in exam score per unit change in predictor $x_j$, holding all other factors constant.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Multiple Linear Regression` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# 1. Synthesize Student Performance Dataset
np.random.seed(42)
n = 300
study_hours = np.random.uniform(1, 12, n)
attendance_pct = np.random.uniform(60, 100, n)
prev_score = np.random.uniform(40, 95, n)
sleep_hours = np.random.uniform(5, 9, n)

exam_score = (
    study_hours * 2.8 + 
    attendance_pct * 0.25 + 
    prev_score * 0.45 + 
    sleep_hours * 1.2 + 
    np.random.normal(0, 3.5, n)
)
exam_score = np.clip(exam_score, 0, 100)

df = pd.DataFrame({
    'StudyHours': study_hours,
    'Attendance': attendance_pct,
    'PreviousScore': prev_score,
    'SleepHours': sleep_hours,
    'FinalScore': exam_score
})

X = df.drop(columns='FinalScore')
y = df['FinalScore']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

reg = LinearRegression()
reg.fit(X_train, y_train)

y_pred = reg.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f} marks")

for feature, coef in zip(X.columns, reg.coef_):
    print(f"Weight for {feature:15s}: {coef:+.3f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.88 - 0.94, RMSE ≈ 3.5 marks.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Check for multicollinearity using Variance Inflation Factor (VIF).
- [ ] Incorporate categorical features like extracurricular participation via one-hot encoding.

---

## Navigation
- **Previous Project**: [Salary vs Experience Prediction (Simple Linear Regression)](./02-salary-experience-regression.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Automobile Fuel Efficiency (MPG) with Random Forest Regressor](./04-car-fuel-efficiency-mpg.md)
