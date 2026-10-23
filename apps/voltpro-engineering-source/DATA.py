import os
import pandas as pd
import requests
from tqdm import tqdm
from urllib.parse import urlparse

# Define dataset folder path
dataset_folder = "C:/Users/prasa/Documents/ec_it/dataset"

# List all CSV files in the dataset folder
csv_files = [f for f in os.listdir(dataset_folder) if f.endswith(".csv")]

print("Found CSV Files:")
for file in csv_files:
    print(file)

# Function to validate URLs
def is_valid_url(url):
    parsed_url = urlparse(url)
    return bool(parsed_url.netloc) and bool(parsed_url.scheme)

# Function to download and save images with headers
def download_image(url, folder, filename):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        # Remove extra 'https:' occurrences
        if url.startswith("https:https://"):
            url = url.replace("https:https://", "https://")

        if not is_valid_url(url):
            print(f"Skipping invalid URL: {url}")
            return

        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            with open(os.path.join(folder, filename), 'wb') as file:
                file.write(response.content)
        else:
            print(f"Failed to download {url}: Status Code {response.status_code}")

    except Exception as e:
        print(f"Failed to download {url}: {e}")

# Process each CSV file
for csv_file in csv_files:
    csv_path = os.path.join(dataset_folder, csv_file)
    component_name = os.path.splitext(csv_file)[0]  # Folder name from CSV filename
    component_folder = os.path.join(dataset_folder, component_name)

    # Create a folder for each component
    if not os.path.exists(component_folder):
        
        os.makedirs(component_folder)

    # Read the CSV file
    df = pd.read_csv(csv_path)

    # Ensure 'Image' column exists
    if 'Image' not in df.columns:
        print(f"Skipping {csv_file} (No 'Image' column found)")
        continue

    # Download images
    for index, row in tqdm(df.iterrows(), total=len(df), desc=f"Downloading {component_name}"):
        image_url = str(row['Image']).strip()
        if image_url and image_url not in ["-", "nan"]:  # Ignore missing entries
            filename = f"{component_name}_{index}.jpg"
            download_image(image_url, component_folder, filename)

print("Dataset creation complete!")
