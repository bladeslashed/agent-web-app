# Project 46: Movie Recommendation with Item-Based Collaborative Filtering

| Attribute | Specification |
|---|---|
| **Category** | Recommender Systems |
| **Algorithm** | Item-Based Collaborative Filtering (Pearson Correlation) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | User-Movie Rating Matrix |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Recommend movies to users based on similarity correlations between items rated by peers who exhibited matching taste.

---

## 2. Theoretical Foundations
Item-Based Collaborative Filtering measures the similarity between two items $i$ and $j$ across all co-rating users using Pearson correlation:
$$r_{ij} = \frac{\sum_{u \in U} (R_{u,i} - \bar{R}_i)(R_{u,j} - \bar{R}_j)}{\sqrt{\sum_{u \in U} (R_{u,i} - \bar{R}_i)^2} \sqrt{\sum_{u \in U} (R_{u,j} - \bar{R}_j)^2}}$$
Unlike content matching, this system discovers unexpected cross-genre affinities purely from human behavioral patterns.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Item-Based Collaborative Filtering (Pearson Correlation)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd

# 1. Synthesize User-Movie Ratings Matrix (Scale 1 to 5)
ratings_data = {
    'User': ['Alice', 'Alice', 'Alice', 'Bob', 'Bob', 'Bob', 'Charlie', 'Charlie', 'Dave', 'Dave', 'Eve', 'Eve'],
    'Movie': ['Inception', 'Interstellar', 'The Dark Knight', 'Inception', 'Toy Story', 'Finding Nemo', 
              'Interstellar', 'The Dark Knight', 'Toy Story', 'Finding Nemo', 'Inception', 'Interstellar'],
    'Rating': [5, 5, 4, 4, 2, 1, 5, 5, 5, 4, 4, 5]
}

df_ratings = pd.DataFrame(ratings_data)
user_movie_matrix = df_ratings.pivot_table(index='User', columns='Movie', values='Rating')

print("User-Movie Pivot Matrix:")
print(user_movie_matrix.fillna('-'))

# 2. Compute Item-Item Correlation Matrix
item_corr = user_movie_matrix.corr(method='pearson', min_periods=2)
print("\nMovie-to-Movie Pearson Correlation Matrix:")
print(item_corr.round(2))

# 3. Recommend Similar Movies for Inception
target_movie = 'Inception'
similar_movies = item_corr[target_movie].dropna().sort_values(ascending=False)
similar_movies = similar_movies[similar_movies.index != target_movie]

print(f"\nRecommendations for viewers of '{target_movie}':")
for movie, score in similar_movies.items():
    print(f"-> {movie:18s} (Similarity: {score:+.2f})")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Strong correlation between sci-fi epics ('Inception' & 'Interstellar') vs animated films.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Implement Matrix Factorization with Singular Value Decomposition (SVD).
- [ ] Handle cold-start problem using popularity baselines.

---

## Navigation
- **Previous Project**: [Road Traffic Sign Recognition with Color Moments & KNN](./45-traffic-sign-recognition.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Content-Based Book Recommender with Metadata Profiles](./47-book-recommender-content-based.md)
