import joblib
import numpy as np
import pandas as pd

FILE_PATH = "nv1_cold_start_deployment_artifacts.joblib"

def describe_object(name, obj, indent=0):
    space = " " * indent
    print(f"{space}- {name}: {type(obj)}")

    if hasattr(obj, "shape"):
        print(f"{space}  shape: {obj.shape}")

    if isinstance(obj, pd.DataFrame):
        print(f"{space}  columns: {list(obj.columns)[:30]}")
        print(f"{space}  rows: {len(obj)}")

    if isinstance(obj, pd.Series):
        print(f"{space}  name: {obj.name}")
        print(f"{space}  length: {len(obj)}")

    if isinstance(obj, np.ndarray):
        print(f"{space}  dtype: {obj.dtype}")
        print(f"{space}  shape: {obj.shape}")

    if hasattr(obj, "feature_names_in_"):
        print(f"{space}  feature_names_in_: {list(obj.feature_names_in_)[:30]}")

    if hasattr(obj, "classes_"):
        print(f"{space}  classes_: {obj.classes_}")

    if hasattr(obj, "named_steps"):
        print(f"{space}  pipeline steps: {list(obj.named_steps.keys())}")

    if isinstance(obj, dict):
        print(f"{space}  keys: {list(obj.keys())}")

def inspect_joblib():
    artifact = joblib.load(FILE_PATH)

    print("\n==============================")
    print("LOADED ARTIFACT")
    print("==============================")
    print("Type:", type(artifact))

    if isinstance(artifact, dict):
        print("\nTOP-LEVEL KEYS:")
        for key in artifact.keys():
            print(" -", key)

        print("\nDETAIL:")
        for key, value in artifact.items():
            describe_object(key, value, indent=2)

    else:
        print("\nArtifact không phải dict.")
        describe_object("artifact", artifact, indent=2)

        if hasattr(artifact, "__dict__"):
            print("\nOBJECT ATTRIBUTES:")
            for key, value in artifact.__dict__.items():
                describe_object(key, value, indent=2)

if __name__ == "__main__":
    inspect_joblib()