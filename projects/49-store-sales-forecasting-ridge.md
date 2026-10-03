# Project 49: Retail Store Sales Forecasting with Rolling Statistics

| Attribute | Specification |
|---|---|
| **Category** | Time Series & Forecasting |
| **Algorithm** | Rolling Windows, Calendar Features & Linear Regression |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Daily Supermarket Revenue Records |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Forecast supermarket daily revenue using 7-day rolling statistics, weekday indicators, and linear regression.

---

## 2. Theoretical Foundations
Demand forecasting benefits from feature engineering:
- **Rolling Means**: $\frac{1}{7} \sum_{i=1}^7 y_{t-i}$ smooths out high-frequency noise.
- **Calendar Encodings**: Days of the week isolate weekend shopping surges.
Combining rolling statistical windows with regularized regression yields stable demand predictions.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Rolling Windows, Calendar Features & Linear Regression` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)
n_days = 365
days = np.arange(n_days)
weekday = days % 7

# Weekend bump (days 5, 6)
weekend_boost = np.where((weekday == 5) | (weekday == 6), 1800, 0)
trend = days * 4.5
base_sales = 4000 + trend + weekend_boost + np.random.normal(0, 300, n_days)

df = pd.DataFrame({'Sales': base_sales, 'DayOfWeek': weekday})

# Rolling 7-day statistics
df['RollingMean7'] = df['Sales'].shift(1).rolling(7).mean()
df['RollingStd7'] = df['Sales'].shift(1).rolling(7).std()
df.dropna(inplace=True)

# One-hot encode DayOfWeek
X = pd.get_dummies(df[['DayOfWeek', 'RollingMean7', 'RollingStd7']], columns=['DayOfWeek'], drop_first=True)
y = df['Sales']

split = len(df) - 60
X_train, X_test = X.iloc[:split], X.iloc[split:]
y_train, y_test = y.iloc[:split], y.iloc[split:]

model = Ridge(alpha=10.0)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"MAE: ${mean_absolute_error(y_test, y_pred):.2f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score > 0.88, MAE ≈ $220 - $280.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Add holiday calendar flags and promotion indicators.
- [ ] Evaluate multi-step recursive forecasting over 14-day horizons.

---

## Navigation
- **Previous Project**: [Air Quality (PM2.5) Forecasting with Lagged Feature Regression](./48-air-quality-time-series-forecasting.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Multi-Armed Bandit Exploration with Epsilon-Greedy RL](./50-multi-armed-bandit-rl.md)
