# Project 48: Air Quality (PM2.5) Forecasting with Lagged Feature Regression

| Attribute | Specification |
|---|---|
| **Category** | Time Series & Forecasting |
| **Algorithm** | Auto-Regressive Lagged Features & Ridge Regression |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Hourly Urban Particulate Matter (PM2.5) Telemetry |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Forecast next-hour atmospheric pollution levels using auto-regressive lagged observation windows and Ridge regression.

---

## 2. Theoretical Foundations
Time series data possesses temporal autocorrelation. Supervised machine learning algorithms can model temporal dynamics by reshaping the series into lagged input features:
$$\hat{y}_{t} = w_0 + w_1 y_{t-1} + w_2 y_{t-2} + ... + w_p y_{t-p}$$
This formulation captures momentum and diurnal decay patterns.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Auto-Regressive Lagged Features & Ridge Regression` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score

# 1. Synthesize 500 Hours of PM2.5 Telemetry (Autoregressive AR(2) process + diurnal cycle)
np.random.seed(42)
n_hours = 500
t = np.arange(n_hours)
diurnal = 15 * np.sin(2 * np.pi * t / 24)

pm25 = [35.0, 38.0]
for i in range(2, n_hours):
    # AR(2) autoregressive step
    val = 0.65 * pm25[i-1] + 0.25 * pm25[i-2] + diurnal[i] * 0.15 + np.random.normal(0, 3.0)
    pm25.append(max(5.0, val))

df = pd.DataFrame({'PM25': pm25})

# 2. Create Lagged Features (Lags t-1, t-2, t-3)
df['Lag_1'] = df['PM25'].shift(1)
df['Lag_2'] = df['PM25'].shift(2)
df['Lag_3'] = df['PM25'].shift(3)
df.dropna(inplace=True)

X = df[['Lag_1', 'Lag_2', 'Lag_3']]
y = df['PM25']

# Chronological Train-Test Split (Last 100 hours as test set)
split_idx = len(df) - 100
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

model = Ridge(alpha=1.0)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"Forecasting R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f} µg/m³")

for col, coef in zip(X.columns, model.coef_):
    print(f"Autoregressive Weight for {col}: {coef:+.3f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score > 0.82, RMSE ≈ 3.5 - 4.5 µg/m³.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Incorporate rolling mean and rolling standard deviation features.
- [ ] Compare with statsmodels ARIMA / SARIMAX.

---

## Navigation
- **Previous Project**: [Content-Based Book Recommender with Metadata Profiles](./47-book-recommender-content-based.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Retail Store Sales Forecasting with Rolling Statistics](./49-store-sales-forecasting-ridge.md)
