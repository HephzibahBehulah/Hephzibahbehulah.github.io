from __future__ import annotations

import io
from typing import Literal

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.cluster import KMeans

app = FastAPI(title="Hephzibah ML Service", version="0.1.0")
MAX_BYTES = 25 * 1024 * 1024


def read_dataset(raw: bytes, filename: str) -> pd.DataFrame:
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "Dataset exceeds the 25 MB service limit.")
    name = filename.lower()
    try:
        if name.endswith(".json"):
            data = pd.read_json(io.BytesIO(raw))
        else:
            data = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(400, f"Could not parse dataset: {exc}") from exc
    if data.empty:
        raise HTTPException(400, "Dataset is empty.")
    if data.shape[1] > 500:
        raise HTTPException(400, "Dataset has too many columns.")
    return data


def profile(df: pd.DataFrame) -> dict:
    numeric = df.select_dtypes(include=np.number).columns.tolist()
    categorical = [c for c in df.columns if c not in numeric]
    columns = []
    for c in df.columns:
        s = df[c]
        columns.append(
            {
                "name": str(c),
                "dtype": str(s.dtype),
                "missing": int(s.isna().sum()),
                "unique": int(s.nunique(dropna=True)),
                "numeric": bool(c in numeric),
                "mean": float(s.mean()) if c in numeric and s.notna().any() else None,
            }
        )
    return {
        "rows": int(len(df)),
        "columns": int(df.shape[1]),
        "missing_cells": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "numeric_columns": numeric,
        "categorical_columns": categorical,
        "columns_detail": columns,
    }


def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    numeric = X.select_dtypes(include=np.number).columns.tolist()
    categorical = [c for c in X.columns if c not in numeric]
    return ColumnTransformer(
        [
            ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
            ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
        ],
        remainder="drop",
    )


def train_supervised(df: pd.DataFrame, target: str, task: Literal["classification", "regression"]) -> dict:
    if target not in df.columns:
        raise HTTPException(400, "Target column not found.")
    data = df.dropna(subset=[target]).copy()
    if len(data) < 20:
        raise HTTPException(400, "At least 20 labelled rows are required.")
    X = data.drop(columns=[target])
    y = data[target]
    if X.shape[1] == 0:
        raise HTTPException(400, "No feature columns remain after selecting the target.")
    stratify = y if task == "classification" and y.nunique() > 1 else None
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=stratify
        )
    except ValueError as exc:
        raise HTTPException(400, f"Could not split data: {exc}") from exc
    pre = build_preprocessor(X)
    if task == "classification":
        models = {
            "logistic_regression": LogisticRegression(max_iter=1000),
            "random_forest": RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1),
        }
    else:
        models = {
            "ridge": Ridge(),
            "random_forest": RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1),
        }
    results = []
    for name, model in models.items():
        pipe = Pipeline([("preprocess", pre), ("model", model)])
        pipe.fit(X_train, y_train)
        pred = pipe.predict(X_test)
        if task == "classification":
            results.append(
                {
                    "model": name,
                    "accuracy": float(accuracy_score(y_test, pred)),
                    "precision_weighted": float(precision_score(y_test, pred, average="weighted", zero_division=0)),
                    "recall_weighted": float(recall_score(y_test, pred, average="weighted", zero_division=0)),
                    "f1_weighted": float(f1_score(y_test, pred, average="weighted", zero_division=0)),
                }
            )
        else:
            results.append(
                {
                    "model": name,
                    "mae": float(mean_absolute_error(y_test, pred)),
                    "rmse": float(np.sqrt(mean_squared_error(y_test, pred))),
                    "r2": float(r2_score(y_test, pred)),
                }
            )
    return {"task": task, "target": target, "rows_used": len(data), "models": results}


def train_unsupervised(df: pd.DataFrame, task: Literal["clustering", "anomaly"]) -> dict:
    X = df.select_dtypes(include=np.number).copy()
    if X.shape[1] < 1:
        raise HTTPException(400, "At least one numeric feature is required.")
    X = X.replace([np.inf, -np.inf], np.nan).fillna(X.median(numeric_only=True)).fillna(0)
    Xs = StandardScaler().fit_transform(X)
    if task == "clustering":
        k = min(4, max(2, int(np.sqrt(len(X) / 10))))
        labels = KMeans(n_clusters=k, random_state=42, n_init=10).fit_predict(Xs)
        counts = np.bincount(labels).tolist()
        return {"task": task, "numeric_features": X.columns.tolist(), "clusters": k, "cluster_counts": counts}
    model = IsolationForest(random_state=42, contamination="auto")
    labels = model.fit_predict(Xs)
    return {"task": task, "numeric_features": X.columns.tolist(), "anomalies": int((labels == -1).sum()), "normal": int((labels == 1).sum())}


@app.get("/health")
def health():
    return {"ok": True, "service": "hephzibah-ml-service", "version": "0.1.0"}


@app.post("/profile")
async def profile_endpoint(file: UploadFile = File(...)):
    raw = await file.read(MAX_BYTES + 1)
    df = read_dataset(raw, file.filename or "dataset.csv")
    return {"ok": True, "profile": profile(df)}


@app.post("/train")
async def train_endpoint(
    file: UploadFile = File(...),
    task: Literal["classification", "regression", "clustering", "anomaly"] = Form(...),
    target: str | None = Form(None),
):
    raw = await file.read(MAX_BYTES + 1)
    df = read_dataset(raw, file.filename or "dataset.csv")
    if task in {"classification", "regression"}:
        if not target:
            raise HTTPException(400, "target is required for supervised learning.")
        result = train_supervised(df, target, task)
    else:
        result = train_unsupervised(df, task)
    return {"ok": True, "profile": profile(df), "result": result}
