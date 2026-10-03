# Project 10: Used Vehicle Valuation with Support Vector Regressor (SVR)

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Support Vector Regression (SVR - RBF Kernel) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Used Automobile Resale Attributes |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Estimate used vehicle resale price using non-linear Support Vector Regression with an epsilon-tube loss function.

---

## 2. Theoretical Foundations
SVR finds a function $f(x)$ that deviates at most $\epsilon$ from actual targets $y_i$ for all training points, penalizing only errors greater than $\epsilon$. The RBF kernel maps features into high-dimensional space to capture non-linear depreciation.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Support Vector Regression (SVR - RBF Kernel)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)
n = 600
car_age = np.random.uniform(1, 15, n)
mileage = car_age * 12000 + np.random.normal(0, 10000, n)
engine_cc = np.random.choice([1400, 1800, 2500, 3200], n)

resale_price = 32000 * np.exp(-0.12 * car_age) + (engine_cc * 1.5) - (mileage * 0.03) + np.random.normal(0, 1200, n)
resale_price = np.clip(resale_price, 1500, 45000)

X = pd.DataFrame({'Age': car_age, 'Mileage': mileage, 'EngineCC': engine_cc})
y = resale_price

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler_X = StandardScaler()
scaler_y = StandardScaler()

X_train_s = scaler_X.fit_transform(X_train)
X_test_s = scaler_X.transform(X_test)
y_train_s = scaler_y.fit_transform(y_train.values.reshape(-1, 1)).ravel()

svr = SVR(kernel='rbf', C=10.0, epsilon=0.1)
svr.fit(X_train_s, y_train_s)

y_pred_s = svr.predict(X_test_s)
y_pred = scaler_y.inverse_transform(y_pred_s.reshape(-1, 1)).ravel()

print(f"SVR R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"MAE: ${mean_absolute_error(y_test, y_pred):.2f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.90 - 0.95, MAE ≈ $800 - $1,100.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Perform a 2D grid search over parameters C and epsilon.
- [ ] Compare SVR against Kernel Ridge Regression.

---

## Navigation
- **Previous Project**: [Bicycle Sharing Hourly Demand Forecasting](./09-bike-sharing-demand-forecast.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Iris Flower Species Classification with Decision Trees](./11-iris-species-classification.md)
