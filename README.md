# 50 Simple Machine Learning Projects

A comprehensive curriculum of 50 self-contained, hands-on Machine Learning project guides, complete with mathematical intuition, implementation steps, copy-paste runnable Python code, and extension challenges.

---

## Quick Setup

Clone or navigate to this directory and install dependencies:

```bash
pip install -r requirements.txt
```

All projects are designed to execute on standard CPU environments using lightweight libraries (`scikit-learn`, `pandas`, `numpy`, `matplotlib`).

---

## Curriculum Overview

- **Projects 01 - 10**: Supervised Learning (Regression & Continuous Modeling)
- **Projects 11 - 20**: Supervised Learning (Binary & Multi-Class Classification)
- **Projects 21 - 30**: Unsupervised Learning (Clustering, Anomaly Detection & Association)
- **Projects 31 - 40**: Natural Language Processing & Text Analytics
- **Projects 41 - 50**: Vision, Recommender Systems, Time Series & Reinforcement Learning

---

## Complete Project Directory

### Supervised Learning - Regression

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `01` | [House Price Prediction with Linear & Ridge Regression](./01-house-price-prediction.md) | `Linear Regression, Ridge Regression` | Beginner | Scikit-Learn California Housing Dataset |
| `02` | [Salary vs Experience Prediction (Simple Linear Regression)](./02-salary-experience-regression.md) | `Simple Linear Regression (OLS)` | Beginner | Synthetic Professional Experience & Compensation Data |
| `03` | [Student Exam Score Prediction (Multiple Linear Regression)](./03-student-exam-score-prediction.md) | `Multiple Linear Regression` | Beginner | Student Study Habits & Examination Records |
| `04` | [Automobile Fuel Efficiency (MPG) with Random Forest Regressor](./04-car-fuel-efficiency-mpg.md) | `Random Forest Regressor` | Intermediate | Auto MPG Benchmark Dataset |
| `05` | [Stock Return Momentum with Lasso & ElasticNet](./05-stock-price-trend-regression.md) | `Lasso (L1) & ElasticNet Regression` | Intermediate | Simulated Financial Technical Indicators |
| `06` | [Apartment Rental Price Estimator with Decision Trees](./06-real-estate-rental-pricing.md) | `Decision Tree Regressor` | Beginner | Urban Real Estate Rental Listings |
| `07` | [Seasonal Temperature Curve Modeling with Polynomial Regression](./07-weather-temperature-forecasting.md) | `Polynomial Features & Ridge Regression` | Beginner | Simulated Annual Daily Weather Temperatures |
| `08` | [Medical Insurance Cost Estimator with Gradient Boosting](./08-medical-insurance-cost-estimator.md) | `Gradient Boosting Regressor` | Intermediate | Simulated Actuarial Health Insurance Dataset |
| `09` | [Bicycle Sharing Hourly Demand Forecasting](./09-bike-sharing-demand-forecast.md) | `Extra Trees Regressor (Extremely Randomized Trees)` | Intermediate | Urban Bike Share Rental Records |
| `10` | [Used Vehicle Valuation with Support Vector Regressor (SVR)](./10-used-car-valuation.md) | `Support Vector Regression (SVR - RBF Kernel)` | Intermediate | Used Automobile Resale Attributes |
### Supervised Learning - Classification

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `11` | [Iris Flower Species Classification with Decision Trees](./11-iris-species-classification.md) | `Decision Tree Classifier` | Beginner | Scikit-Learn Iris Benchmark Dataset |
| `12` | [Titanic Survival Prediction with Logistic Regression](./12-titanic-survival-prediction.md) | `Logistic Regression with Feature Engineering` | Beginner | Titanic Passenger Manifest Attributes |
| `13` | [Breast Cancer Malignancy Detection with Support Vector Machines](./13-breast-cancer-diagnosis.md) | `Support Vector Classifier (SVC - Linear & RBF)` | Intermediate | Scikit-Learn Breast Cancer Wisconsin Diagnostic Dataset |
| `14` | [Cardiovascular Disease Risk Prediction with Random Forest](./14-heart-disease-risk-prediction.md) | `Random Forest Classifier` | Intermediate | Cardiovascular Clinical Vitals Dataset |
| `15` | [Wine Quality Classification with K-Nearest Neighbors (KNN)](./15-wine-quality-grading.md) | `K-Nearest Neighbors Classifier (KNN)` | Beginner | Scikit-Learn Wine Chemical Dataset |
| `16` | [Telecom Customer Churn Prediction with Gradient Boosting](./16-customer-churn-prediction.md) | `Gradient Boosting Classifier` | Intermediate | Telecom Subscriber Usage & Churn Records |
| `17` | [Loan Credit Approval Scoring with Gaussian Naive Bayes](./17-loan-credit-approval.md) | `Gaussian Naive Bayes (GaussianNB)` | Beginner | Consumer Credit Bureau Applicant Records |
| `18` | [Imbalanced Credit Card Fraud Detection with Cost-Sensitive Modeling](./18-credit-card-fraud-detection.md) | `Balanced Random Forest & PR-AUC Evaluation` | Intermediate | Imbalanced Electronic Transaction Stream |
| `19` | [Diabetes Diagnostic Model with GridSearchCV Tuning](./19-diabetes-onset-classification.md) | `Logistic Regression with GridSearchCV` | Intermediate | Pima Indians Diabetes Diagnostic Biomarkers |
| `20` | [Mushroom Edibility Identification with Rule-Based Decision Trees](./20-mushroom-edibility-classification.md) | `Decision Tree Classifier with Rule Extraction` | Beginner | Botanical Mushroom Morphological Attributes |
### Unsupervised Learning - Clustering

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `21` | [Customer Segmentation with K-Means & The Elbow Method](./21-customer-segmentation-kmeans.md) | `K-Means Clustering, Inertia & Silhouette Analysis` | Beginner | E-Commerce Customer Annual Spending & Visit Frequency |
| `22` | [Hierarchical Consumer Profiling with Agglomerative Clustering](./22-mall-customer-hierarchical-clustering.md) | `Agglomerative Hierarchical Clustering (Ward Linkage)` | Intermediate | Mall Retail Customer Purchasing Records |
| `24` | [Spatial Density Clustering of GPS Coordinates with DBSCAN](./24-urban-traffic-density-dbscan.md) | `DBSCAN (Density-Based Spatial Clustering of Applications with Noise)` | Intermediate | Simulated Urban Taxi Pickup Coordinates & Hotspots |
| `25` | [Image Color Palette Quantization with K-Means](./25-image-color-quantization.md) | `K-Means Clustering on Pixel RGB Color Vectors` | Intermediate | Simulated Synthetic High-Color Photographic Image |
### Unsupervised Learning - Dimensionality Reduction

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `23` | [High-Dimensional Data Visualization with PCA](./23-pca-dimension-reduction-visualization.md) | `Principal Component Analysis (PCA)` | Beginner | Scikit-Learn Digits 64-Dimensional Image Dataset |
### Unsupervised Learning - Anomaly Detection

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `26` | [Unsupervised Banking Fraud Spotting with Isolation Forest](./26-banking-outlier-detection-isolation-forest.md) | `Isolation Forest (iForest)` | Intermediate | Simulated Banking Financial Ledger Transactions |
| `27` | [Network Intrusion & Zero-Day Detection with One-Class SVM](./27-network-intrusion-anomaly-one-class-svm.md) | `One-Class Support Vector Machine (OneClassSVM)` | Intermediate | Simulated Server TCP Packet & Telemetry Streams |
| `30` | [Industrial Sensor Drift Anomaly Detection with Local Outlier Factor](./30-sensor-drift-detection-lof.md) | `Local Outlier Factor (LOF)` | Intermediate | Manufacturing Turbine Temperature & Vibration Telemetry |
### Unsupervised Learning - Association Rules

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `28` | [Supermarket Basket Association Mining with Apriori Affinity](./28-market-basket-apriori-affinity.md) | `Frequent Itemsets, Support, Confidence, and Lift` | Beginner | Simulated Point-of-Sale Grocery Transactions |
### Unsupervised Learning - Topic Modeling

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `29` | [Text Topic Discovery with Latent Dirichlet Allocation (LDA)](./29-document-topic-modeling-lda.md) | `Latent Dirichlet Allocation (LDA) & CountVectorizer` | Intermediate | Simulated Research Paper Abstracts |
### Natural Language Processing (NLP)

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `31` | [SMS Spam Filter with TF-IDF and Multinomial Naive Bayes](./31-sms-spam-ham-classifier.md) | `Multinomial Naive Bayes (MultinomialNB) & TfidfVectorizer` | Beginner | SMS Mobile Text Messages Benchmark Collection |
| `32` | [Movie Review Sentiment Analysis with Logistic Regression](./32-movie-review-sentiment-analysis.md) | `Logistic Regression on Word n-grams` | Beginner | IMDb Film Critic Review Snippets |
| `33` | [News Article Topic Categorization with SGDClassifier](./33-news-category-text-classifier.md) | `Stochastic Gradient Descent (Linear SVM via SGDClassifier)` | Intermediate | Scikit-Learn 20 Newsgroups Benchmark Subset |
| `34` | [Online Misinformation & Fake News Detector](./34-fake-news-detector.md) | `PassiveAggressiveClassifier & TfidfVectorizer` | Intermediate | Curated True vs Fabricated News Reports |
| `35` | [Natural Language Identification with Character n-grams](./35-language-identification.md) | `Multinomial Naive Bayes on Subword Character n-grams` | Beginner | Multi-Lingual Parallel Sentence Corpus (English, Spanish, French, German) |
| `36` | [Resume & Job Description Matcher with Cosine Similarity](./36-resume-job-description-matcher.md) | `TF-IDF Vectorization & Cosine Similarity` | Beginner | Simulated Technical Candidate Resumes & Job Specs |
| `37` | [E-Commerce Review Star Rating Predictor with LinearSVC](./37-product-review-rating-predictor.md) | `Linear Support Vector Classifier (LinearSVC)` | Intermediate | Customer E-Commerce Review Texts & Star Ratings (1-5) |
| `38` | [Unsupervised Keyword & Keyphrase Extraction with TF-IDF](./38-keyword-keyphrase-extraction.md) | `N-gram TF-IDF Salience Scoring` | Beginner | Scientific AI Research Abstracts |
| `39` | [Toxic Online Comment Flagger with Cost-Sensitive Modeling](./39-toxic-comment-flagger.md) | `Logistic Regression with Balanced Class Weights` | Intermediate | Simulated Public Forum User Comments |
| `40` | [FAQ Query Intent Matcher with Cosine Similarity](./40-faq-intent-matching-engine.md) | `TF-IDF Vector Space Intent Matching` | Beginner | Customer Service Knowledgebase FAQ Database |
### Computer Vision & Neural Networks

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `41` | [Handwritten Digit Recognition with Multi-Layer Perceptron (MLP)](./41-mnist-handwritten-digit-recognition.md) | `Multi-Layer Perceptron (MLPClassifier) with Adam Optimizer` | Intermediate | Scikit-Learn Digits 8x8 Pixel Dataset |
| `42` | [Fashion Apparel Item Classification with Neural Networks](./42-fashion-mnist-clothing-classifier.md) | `MLPClassifier with L2 Regularization` | Intermediate | Simulated Fashion Grayscale Feature Arrays (T-shirt, Trouser, Sneaker, Bag) |
### Computer Vision & Classification

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `43` | [Rock-Paper-Scissors Gesture Recognition with SVM](./43-rock-paper-scissors-move-classifier.md) | `Support Vector Classifier (SVC - RBF Kernel)` | Intermediate | Simulated Hand Silhouette Geometric Properties |
| `44` | [Facial Feature Recognition with HOG & Linear Classifiers](./44-face-detection-hog-classifier.md) | `Histogram of Oriented Gradients (HOG) & Linear Classifier` | Intermediate | Simulated Facial Gradient Orientation Histograms |
| `45` | [Road Traffic Sign Recognition with Color Moments & KNN](./45-traffic-sign-recognition.md) | `K-Nearest Neighbors (KNN) & Color Distribution Moments` | Beginner | Simulated Road Signs (Stop, Yield, Speed Limit) |
### Recommender Systems

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `46` | [Movie Recommendation with Item-Based Collaborative Filtering](./46-movie-recommender-collaborative-filtering.md) | `Item-Based Collaborative Filtering (Pearson Correlation)` | Intermediate | User-Movie Rating Matrix |
| `47` | [Content-Based Book Recommender with Metadata Profiles](./47-book-recommender-content-based.md) | `Content-Based Filtering & Cosine Similarity` | Beginner | Curated Literary Book Metadata (Genre, Author, Synopsis) |
### Time Series & Forecasting

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `48` | [Air Quality (PM2.5) Forecasting with Lagged Feature Regression](./48-air-quality-time-series-forecasting.md) | `Auto-Regressive Lagged Features & Ridge Regression` | Intermediate | Hourly Urban Particulate Matter (PM2.5) Telemetry |
| `49` | [Retail Store Sales Forecasting with Rolling Statistics](./49-store-sales-forecasting-ridge.md) | `Rolling Windows, Calendar Features & Linear Regression` | Intermediate | Daily Supermarket Revenue Records |
### Reinforcement Learning

| # | Project Title | Key Algorithm | Level | Dataset |
|---|---|---|---|---|
| `50` | [Multi-Armed Bandit Exploration with Epsilon-Greedy RL](./50-multi-armed-bandit-rl.md) | `Epsilon-Greedy Multi-Armed Bandit` | Intermediate | Simulated Stochastic Slot Machines (Arms with True Win Rates) |


---

## Contributing & License
Released under the MIT License. Feel free to use these projects for academic study, portfolio development, or teaching.
