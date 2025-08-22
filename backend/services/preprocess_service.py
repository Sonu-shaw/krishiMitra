# backend/services/preprocess_service.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
from config import SEQ_LEN
from pathlib import Path

def load_series_from_docs(docs):
    # docs: list of {"date": iso, "price": float} unsorted
    df = pd.DataFrame(docs)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').set_index('date').resample('D').mean()
    df['price'] = df['price'].interpolate(limit_direction='both')
    return df['price'].astype(float)

def create_sequences(series, seq_len=SEQ_LEN, horizon=7):
    X, y = [], []
    arr = series.values
    for i in range(len(arr) - seq_len - horizon + 1):
        X.append(arr[i:i+seq_len])
        y.append(arr[i+seq_len:i+seq_len+horizon])
    X = np.array(X)[:, :, None]
    y = np.array(y)
    return X, y

def scale_series(series, scaler=None, save_path=None):
    arr = series.values.reshape(-1,1)
    if scaler is None:
        scaler = StandardScaler()
        scaler.fit(arr)
    scaled = scaler.transform(arr).flatten()
    if save_path:
        joblib.dump(scaler, save_path)
    return scaled, scaler
