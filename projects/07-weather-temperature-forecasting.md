# Project 07: Seasonal Temperature Curve Modeling with Polynomial Regression

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Polynomial Features & Ridge Regression |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Simulated Annual Daily Weather Temperatures |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Capture cyclical seasonal temperature swings across the 365 days of the year using polynomial basis expansions.

---

## 2. Theoretical Foundations
Polynomial Regression transforms the feature vector $[x]$ into $[1, x, x^2, ..., x^d]$. The model remains linear in parameters $\mathbf{w}$, allowing standard OLS closed-form estimation while learning curved decision surfaces.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Polynomial Features & Ridge Regression` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error, r2_score

np.random.seed(42)
days = np.arange(1, 731)
temp_seasonal = 15 + 12 * np.sin((2 * np.pi * days / 365) - 1.2)
daily_noise = np.random.normal(0, 3.2, 731)
temperatures = temp_seasonal + daily_noise

X = days.reshape(-1, 1)
y = temperatures

split_idx = 550
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

model = make_pipeline(PolynomialFeatures(degree=4), Ridge(alpha=1.0))
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"Polynomial R²: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}°C")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.80 - 0.88, RMSE ≈ 3.2°C - 3.5°C.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Test degree 1 through 10 to demonstrate underfitting vs overfitting.
- [ ] Compare polynomial regression against Fourier features (sine/cosine harmonics).

---

## Navigation
- **Previous Project**: [Apartment Rental Price Estimator with Decision Trees](./06-real-estate-rental-pricing.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Medical Insurance Cost Estimator with Gradient Boosting](./08-medical-insurance-cost-estimator.md)
