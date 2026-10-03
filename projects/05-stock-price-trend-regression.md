# Project 05: Stock Return Momentum with Lasso & ElasticNet

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Lasso (L1) & ElasticNet Regression |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Financial Technical Indicators |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Forecast next-period asset price returns using momentum indicators and L1/L2 regularization for feature selection.

---

## 2. Theoretical Foundations
Lasso introduces an $L_1$ penalty:
$$J(w) = \text{MSE}(w) + \lambda \sum_{i=1}^n |w_i|$$
Because the $L_1$ ball has sharp vertices, it drives uninformative feature weights strictly to zero, yielding sparse interpretable models.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Lasso (L1) & ElasticNet Regression` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import Lasso, ElasticNet
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score

np.random.seed(42)
n_days = 600
f1 = np.random.normal(0, 1, n_days)
f2 = np.random.normal(0, 1, n_days)
f3 = np.random.normal(0, 1, n_days)
noise = np.random.normal(0, 1, (n_days, 10))

next_return = 0.45 * f1 + 0.30 * f2 - 0.15 * f3 + np.random.normal(0, 0.8, n_days)
col_names = ['Mom_5d', 'Mom_20d', 'RSI'] + [f'Noise_{i}' for i in range(1, 11)]

X = pd.DataFrame(np.column_stack([f1, f2, f3, noise]), columns=col_names)
y = next_return

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

lasso = Lasso(alpha=0.08, random_state=42)
lasso.fit(X_train_s, y_train)

elastic = ElasticNet(alpha=0.08, l1_ratio=0.5, random_state=42)
elastic.fit(X_train_s, y_train)

print(f"Lasso R²: {r2_score(y_test, lasso.predict(X_test_s)):.4f}")
print(f"ElasticNet R²: {r2_score(y_test, elastic.predict(X_test_s)):.4f}")

coef_df = pd.DataFrame({'Feature': col_names, 'Lasso_Coef': lasso.coef_})
print("\nLasso Non-Zero Features:\n", coef_df[coef_df['Lasso_Coef'] != 0])
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.20 - 0.35 with non-informative noise coefficients zeroed out.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Implement a rolling time-series cross validation with TimeSeriesSplit.
- [ ] Formulate a trading signal based on sign of predicted return and compute Sharpe ratio.

---

## Navigation
- **Previous Project**: [Automobile Fuel Efficiency (MPG) with Random Forest Regressor](./04-car-fuel-efficiency-mpg.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Apartment Rental Price Estimator with Decision Trees](./06-real-estate-rental-pricing.md)
