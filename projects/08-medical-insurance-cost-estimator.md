# Project 08: Medical Insurance Cost Estimator with Gradient Boosting

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Gradient Boosting Regressor |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Actuarial Health Insurance Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict individual healthcare expenditures considering age, BMI, smoking status, and region using boosting.

---

## 2. Theoretical Foundations
Gradient Boosting builds trees sequentially. Each new tree is trained to predict the negative gradient (pseudo-residuals) of the loss function with respect to current ensemble predictions, continuously refining weak spots.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Gradient Boosting Regressor` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)
n = 1000
age = np.random.randint(18, 65, n)
bmi = np.random.normal(30, 6, n)
smoker = np.random.choice([0, 1], n, p=[0.8, 0.2])
children = np.random.choice([0, 1, 2, 3], n, p=[0.45, 0.25, 0.20, 0.10])

charges = 2500 + (age * 260) + (bmi * 320) + (smoker * 18000) + (smoker * (bmi > 30) * 8000) + (children * 500)
charges += np.random.normal(0, 1200, n)
charges = np.maximum(charges, 1000)

X = pd.DataFrame({'Age': age, 'BMI': bmi, 'Smoker': smoker, 'Children': children})
y = charges

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

gbr = GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=4, random_state=42)
gbr.fit(X_train, y_train)

y_pred = gbr.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"MAE: ${mean_absolute_error(y_test, y_pred):.2f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score > 0.95, MAE ≈ $900 - $1,300.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot learning rate versus test loss to illustrate gradient boosting convergence.
- [ ] Compare GradientBoostingRegressor with HistGradientBoostingRegressor for large-scale datasets.

---

## Navigation
- **Previous Project**: [Seasonal Temperature Curve Modeling with Polynomial Regression](./07-weather-temperature-forecasting.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Bicycle Sharing Hourly Demand Forecasting](./09-bike-sharing-demand-forecast.md)
