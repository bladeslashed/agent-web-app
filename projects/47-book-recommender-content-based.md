# Project 47: Content-Based Book Recommender with Metadata Profiles

| Attribute | Specification |
|---|---|
| **Category** | Recommender Systems |
| **Algorithm** | Content-Based Filtering & Cosine Similarity |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Curated Literary Book Metadata (Genre, Author, Synopsis) |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Recommend novels sharing thematic content, authorial style, and genre tags using vector cosine distance.

---

## 2. Theoretical Foundations
Content-Based Filtering builds an item profile $p_i$ from descriptive tags. Computing Cosine Similarity between item vectors enables high-quality recommendations immediately upon publication without waiting for user reviews (solving item cold-start).

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Content-Based Filtering & Cosine Similarity` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

books = [
    {"Title": "Dune", "Metadata": "Frank Herbert science fiction space empire desert planet epic sandworms politics"},
    {"Title": "Foundation", "Metadata": "Isaac Asimov science fiction galactic empire mathematics psychohistory space epic"},
    {"Title": "Neuromancer", "Metadata": "William Gibson cyberpunk science fiction artificial intelligence hacker dystopian future"},
    {"Title": "The Hobbit", "Metadata": "JRR Tolkien high fantasy adventure middle earth ring dragon elves dwarfs"},
    {"Title": "The Fellowship of the Ring", "Metadata": "JRR Tolkien high fantasy quest dark lord ring elves middle earth magic"},
    {"Title": "1984", "Metadata": "George Orwell dystopian political fiction surveillance totalitarian big brother society"}
]

df_books = pd.DataFrame(books)

# Extract TF-IDF
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df_books['Metadata'])

# Compute pairwise cosine similarities
sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

def recommend_books(title, top_n=2):
    idx = df_books[df_books['Title'] == title].index[0]
    sim_scores = list(enumerate(sim_matrix[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = [s for s in sim_scores if s[0] != idx][:top_n]
    
    print(f"Books Recommended for Readers of '{title}':")
    for rec_idx, score in sim_scores:
        print(f"-> {df_books.iloc[rec_idx]['Title']:28s} (Match: {score*100:.1f}%)")

recommend_books("Dune")
print()
recommend_books("The Hobbit")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Dune recommends Foundation; The Hobbit recommends The Fellowship of the Ring.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Weight author names higher than general synopsis words.
- [ ] Combine content-based similarity with collaborative user ratings into a hybrid recommender.

---

## Navigation
- **Previous Project**: [Movie Recommendation with Item-Based Collaborative Filtering](./46-movie-recommender-collaborative-filtering.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Air Quality (PM2.5) Forecasting with Lagged Feature Regression](./48-air-quality-time-series-forecasting.md)
