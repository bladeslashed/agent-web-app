# Project 36: Resume & Job Description Matcher with Cosine Similarity

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | TF-IDF Vectorization & Cosine Similarity |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Simulated Technical Candidate Resumes & Job Specs |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Calculate applicant-to-job semantic compatibility scores using vector space cosine similarity on skills and experience.

---

## 2. Theoretical Foundations
Text documents are vectorized into high-dimensional term space. The Cosine Similarity measures the angle $\theta$ between two document vectors:
$$\text{CosineSim}(A, B) = \frac{A \cdot B}{||A|| ||B||} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$
Ranging from 0 to 1, length-normalization ensures long resumes do not score artificially higher.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `TF-IDF Vectorization & Cosine Similarity` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

job_description = """
We are seeking a Senior Machine Learning Engineer with strong proficiency in Python, 
scikit-learn, PyTorch, and SQL. Experience in natural language processing, data pipelines, 
cloud deployment with Docker and AWS is required.
"""

resumes = {
    "Candidate_Alice (ML Specialist)": "Skilled Machine Learning Engineer with 5 years experience in Python, PyTorch, scikit-learn, SQL, Docker, AWS, and NLP model training.",
    "Candidate_Bob (Data Analyst)": "Data Analyst proficient in SQL, Excel, Tableau, business intelligence, basic Python, and reporting metrics.",
    "Candidate_Charlie (Web Dev)": "Full Stack Software Developer experienced in JavaScript, React, Node.js, CSS, HTML, MongoDB, and REST APIs."
}

# Combine texts for joint vectorization
all_texts = [job_description] + list(resumes.values())

vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(all_texts)

# Job description is row 0; candidates are rows 1..N
job_vec = tfidf_matrix[0:1]
candidate_vecs = tfidf_matrix[1:]

similarities = cosine_similarity(job_vec, candidate_vecs)[0]

results = pd.DataFrame({
    'Candidate': list(resumes.keys()),
    'MatchScore': np.round(similarities * 100, 2)
}).sort_values(by='MatchScore', ascending=False)

print("Job Candidate Matching Rankings:\n")
print(results.to_string(index=False))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Candidate Alice scores > 65% match; Bob and Charlie score < 20%.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Highlight matching keywords and missing prerequisites between candidate and job.
- [ ] Compare TF-IDF matching against pre-trained sentence transformer embeddings.

---

## Navigation
- **Previous Project**: [Natural Language Identification with Character n-grams](./35-language-identification.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [E-Commerce Review Star Rating Predictor with LinearSVC](./37-product-review-rating-predictor.md)
