# Project 01: House Price Prediction with Linear & Ridge Regression

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Linear Regression, Ridge Regression |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Scikit-Learn California Housing Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict median house values across districts using multi-variable linear regression and regularized Ridge regression.

---

## 2. Theoretical Foundations
Linear Regression models the relationship between dependent target variable $y$ and independent explanatory features $X$ as:
$$y = w_0 + w_1 x_1 + w_2 x_2 + ... + w_n x_n + \epsilon$$
When multicollinearity is present or features have varying scales, ordinary least squares may overfit. **Ridge Regression** adds an $L_2$ penalty to the cost function:
$$J(w) = \text{MSE}(w) + \alpha \sum_{i=1}^n w_i^2$$
This shrinks regression coefficients, lowering model variance and boosting generalization.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Linear Regression, Ridge Regression` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, r2_score

# 1. Load Dataset
data = fetch_california_housing(as_frame=True)
X = data.data
y = data.target # Median house value in $100,000s

print(f"Dataset shape: {X.shape}")
print("Features:", list(X.columns))

# 2. Train-Test Split (80/20)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Standardization
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. Fit Ordinary Linear Regression
lr = LinearRegression()
lr.fit(X_train_scaled, y_train)
y_pred_lr = lr.predict(X_test_scaled)

# 5. Fit Ridge Regression (alpha=1.0)
ridge = Ridge(alpha=1.0)
ridge.fit(X_train_scaled, y_train)
y_pred_ridge = ridge.predict(X_test_scaled)

# 6. Evaluation
print("\n--- Linear Regression Performance ---")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred_lr)):.4f}")
print(f"R² Score: {r2_score(y_test, y_pred_lr):.4f}")

print("\n--- Ridge Regression Performance ---")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred_ridge)):.4f}")
print(f"R² Score: {r2_score(y_test, y_pred_ridge):.4f}")

# Feature Importance (Weights)
weights = pd.Series(ridge.coef_, index=X.columns).sort_values(ascending=False)
print("\nRidge Feature Coefficients:")
print(weights)
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: RMSE ≈ 0.70 - 0.75 ($70k-$75k error), R² Score ≈ 0.58 - 0.61.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Test different alpha regularization strengths using RidgeCV.
- [ ] Add polynomial feature interaction terms using PolynomialFeatures(degree=2).
- [ ] Compare results against Lasso (L1) regression for automatic feature selection.

---

## Navigation
- **Previous Project**: None (First Project)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Salary vs Experience Prediction (Simple Linear Regression)](./02-salary-experience-regression.md)
