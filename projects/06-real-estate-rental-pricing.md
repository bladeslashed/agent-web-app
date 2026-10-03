# Project 06: Apartment Rental Price Estimator with Decision Trees

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Regression |
| **Algorithm** | Decision Tree Regressor |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Urban Real Estate Rental Listings |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Model apartment rental values using tree-based recursive partitioning based on square footage, bedrooms, and distance to transit.

---

## 2. Theoretical Foundations
Decision Tree Regression recursively splits feature space into rectangular regions $\{R_m\}$, choosing cutpoints that maximize reduction in variance. Each leaf predicts the local mean of training instances inside that region.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Decision Tree Regressor` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)
n = 500
sqft = np.random.uniform(400, 2200, n)
bedrooms = np.random.choice([1, 2, 3, 4], n, p=[0.35, 0.40, 0.20, 0.05])
distance_transit_km = np.random.uniform(0.1, 8.0, n)
has_gym = np.random.choice([0, 1], n, p=[0.6, 0.4])

rent = (
    800 + 
    sqft * 1.35 + 
    bedrooms * 250 + 
    (8.0 - distance_transit_km) * 60 + 
    has_gym * 150 + 
    np.random.normal(0, 120, n)
)

X = pd.DataFrame({'SqFt': sqft, 'Bedrooms': bedrooms, 'DistanceTransitKm': distance_transit_km, 'HasGym': has_gym})
y = rent

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

dt = DecisionTreeRegressor(max_depth=5, min_samples_leaf=10, random_state=42)
dt.fit(X_train, y_train)

y_pred = dt.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"MAE: ${mean_absolute_error(y_test, y_pred):.2f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: R² Score ≈ 0.92 - 0.96, MAE ≈ $100 - $140.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Visualize the decision rules using sklearn.tree.export_text.
- [ ] Plot pruning paths using cost_complexity_pruning_path.

---

## Navigation
- **Previous Project**: [Stock Return Momentum with Lasso & ElasticNet](./05-stock-price-trend-regression.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Seasonal Temperature Curve Modeling with Polynomial Regression](./07-weather-temperature-forecasting.md)
