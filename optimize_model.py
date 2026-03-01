import tensorflow as tf
import os

model_path = 'model.keras'
tflite_path = 'model.tflite'

if not os.path.exists(model_path):
    print(f"Error: {model_path} not found.")
    exit(1)

print(f"Loading {model_path} for conversion...")
model = tf.keras.models.load_model(model_path)

print("Converting to TFLite with Float16 quantization...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]

tflite_model = converter.convert()

with open(tflite_path, 'wb') as f:
    f.write(tflite_model)

size_mb = os.path.getsize(tflite_path) / (1024 * 1024)
print(f"Success! Optimized model saved to {tflite_path}")
print(f"New Model Size: {size_mb:.2f} MB")

if size_mb > 25:
    print("\nWarning: Model is still over 25MB. Retrying with INT8 quantization...")
    # Note: INT8 usually requires a representative dataset for calibration, 
    # but we can try basic dynamic range quantization first.
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model_int8 = converter.convert()
    with open('model_int8.tflite', 'wb') as f:
        f.write(tflite_model_int8)
    size_mb_int8 = os.path.getsize('model_int8.tflite') / (1024 * 1024)
    print(f"INT8 Model Size: {size_mb_int8:.2f} MB")
