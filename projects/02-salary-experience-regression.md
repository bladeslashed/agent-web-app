# Project 02: Salary vs Experience Prediction (Simple Linear Regression)

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Simple Linear Regression (OLS) |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Synthetic Professional Experience & Compensation Data |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Model compensation growth as a function of years on the job with intuitive slope and intercept interpretation.

---

## 2. Theoretical Foundations
Simple Linear Regression finds the line of best fit $y = mx + b$ minimizing the Sum of Squared Residuals (SSR):
$$\text{SSR} = \sum_{i=1}^N (y_i - (mx_i + b))^2$$
The slope $m$ indicates the marginal salary increase for each additional year of experience.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Simple Linear Regression (OLS)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

# 1. Generate Realistic Synthetic Data
np.random.seed(42)
experience = np.random.uniform(1, 15, size=150)
base_salary = 35000
growth_per_year = 6800
noise = np.random.normal(0, 4500, size=150)
salary = base_salary + (growth_per_year * experience) + noise

df = pd.DataFrame({'YearsExperience': experience, 'Salary': salary})

# 2. Split
X = df[['YearsExperience']]
y = df['Salary']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# 3. Train Model
model = LinearRegression()
model.fit(X_train, y_train)

# 4. Predict
y_pred = model.predict(X_test)

# 5. Interpretation & Metrics
slope = model.coef_[0]
intercept = model.intercept_
print(f"Regression Equation: Salary = ${intercept:.2f} + (${slope:.2f} * YearsExperience)")
print(f"MAE: ${mean_absolute_error(y_test, y_pred):.2f}")
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")

# Predict for candidate with 7.5 years
cand_exp = np.array([[7.5]])
pred_sal = model.predict(cand_exp)[0]
print(f"Predicted salary for 7.5 years of experience: ${pred_sal:.2f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score > 0.95, MAE ≈ $3,500 - $4,000.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot the regression scatter and line of best fit using Matplotlib.
- [ ] Introduce career tiers / non-linear diminishing returns using log transform.

---

## Navigation
- **Previous Project**: [House Price Prediction with Linear & Ridge Regression](./01-house-price-prediction.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Student Exam Score Prediction (Multiple Linear Regression)](./03-student-exam-score-prediction.md)
