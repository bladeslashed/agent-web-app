# Project 09: Bicycle Sharing Hourly Demand Forecasting

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Extra Trees Regressor (Extremely Randomized Trees) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Urban Bike Share Rental Records |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Model hourly bike fleet utilization based on weather condition, temperature, humidity, rush hour status, and day of week.

---

## 2. Theoretical Foundations
Extra Trees selects random thresholds for each candidate feature rather than finding optimal cutpoints. This adds extra variance reduction and significantly accelerates training.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Extra Trees Regressor (Extremely Randomized Trees)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

np.random.seed(42)
n_hours = 1200
hour = np.tile(np.arange(24), n_hours // 24)
is_weekend = np.random.choice([0, 1], n_hours, p=[0.71, 0.29])
temp = 18 + 8 * np.sin(np.linspace(0, 50, n_hours)) + np.random.normal(0, 2, n_hours)
humidity = np.clip(np.random.normal(60, 15, n_hours), 20, 100)

commute_peak = ((hour == 8) | (hour == 17) | (hour == 18)) & (is_weekend == 0)
demand = 80 + commute_peak * 240 + (temp - 10) * 8 + (100 - humidity) * 1.5 + np.random.normal(0, 25, n_hours)
demand = np.clip(demand, 5, 600)

X = pd.DataFrame({'Hour': hour, 'IsWeekend': is_weekend, 'Temp': temp, 'Humidity': humidity})
y = demand

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

et = ExtraTreesRegressor(n_estimators=120, max_depth=10, random_state=42)
et.fit(X_train, y_train)

y_pred = et.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f} bikes/hour")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.88 - 0.93, RMSE ≈ 25 - 32 bikes/hour.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Engineer cyclical hour features using sin(2*pi*hour/24) and cos(2*pi*hour/24).
- [ ] Calculate Poisson loss for count data modeling.

---

## Navigation
- **Previous Project**: [Medical Insurance Cost Estimator with Gradient Boosting](./08-medical-insurance-cost-estimator.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Used Vehicle Valuation with Support Vector Regressor (SVR)](./10-used-car-valuation.md)
