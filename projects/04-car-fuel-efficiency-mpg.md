# Project 04: Automobile Fuel Efficiency (MPG) with Random Forest Regressor

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Random Forest Regressor |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Auto MPG Benchmark Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict automobile miles per gallon (MPG) based on engine cylinders, displacement, horsepower, and weight using an ensemble of decision trees.

---

## 2. Theoretical Foundations
Random Forest Regressor constructs an ensemble of de-correlated decision trees through bagging and random feature subsets. The final prediction averages predictions from all trees:
$$\hat{y} = \frac{1}{B} \sum_{b=1}^B T_b(x)$$
This reduces variance without increasing bias, capturing complex non-linear relationships.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Random Forest Regressor` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

np.random.seed(42)
n_samples = 400
cylinders = np.random.choice([4, 6, 8], n_samples, p=[0.5, 0.3, 0.2])
displacement = cylinders * 45 + np.random.normal(0, 20, n_samples)
horsepower = cylinders * 22 + np.random.normal(0, 15, n_samples)
weight = cylinders * 500 + displacement * 3.5 + np.random.normal(0, 100, n_samples)
acceleration = 25 - (horsepower / 15) + np.random.normal(0, 1.5, n_samples)
year = np.random.randint(70, 82, n_samples)

mpg = (55 - (weight * 0.006) - (horsepower * 0.08) + (year - 70) * 0.6 + np.random.normal(0, 2.5, n_samples))
mpg = np.clip(mpg, 9, 46)

X = pd.DataFrame({
    'Cylinders': cylinders,
    'Displacement': displacement,
    'Horsepower': horsepower,
    'Weight': weight,
    'Acceleration': acceleration,
    'ModelYear': year
})
y = mpg

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f} MPG")

importances = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
print("\nFeature Importances:\n", importances)
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.85 - 0.90, RMSE ≈ 2.5 - 3.0 MPG.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Tune n_estimators and min_samples_split using RandomizedSearchCV.
- [ ] Compare against an individual DecisionTreeRegressor to quantify ensemble gain.

---

## Navigation
- **Previous Project**: [Student Exam Score Prediction (Multiple Linear Regression)](./03-student-exam-score-prediction.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Stock Return Momentum with Lasso & ElasticNet](./05-stock-price-trend-regression.md)
