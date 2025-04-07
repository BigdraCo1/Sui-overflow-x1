# IoT Data Simulator

This Rust application simulates an IoT device collecting sensor data (temperature, humidity, pressure) and saves the data to JSON files rather than sending it to a middleware service.

## Features

- Simulates sensor readings at configurable intervals
- Encrypts data using AES-GCM for security
- Creates SHA-256 hashes for data integrity verification
- Batches data into JSON files
- Supports simulation timing configuration
- Saves both encrypted data and metadata

## File Output

The simulator creates two types of files in the `output` directory:

1. `iot_data_batch_{batch_number}_timestamp_{timestamp}.json` - Contains the complete batch payload with both metadata and encrypted sensor readings
2. `raw_data_batch_{batch_number}_timestamp_{timestamp}.json` - Contains just the metadata for easier analysis

## Configuration

You can modify these constants in the code to change the simulation behavior:

- `BATCH_SIZE`: Number of readings to collect before saving a batch (default: 10)
- `DEVICE_ID`: Identifier for the simulated device (default: "rpi-rust-001")
- `READING_INTERVAL_MS`: Milliseconds between readings (default: 1000ms for simulation speed)
- `OUTPUT_DIR`: Directory where JSON files will be saved (default: "./output")

## Building and Running

1. Make sure you have Rust installed (https://www.rust-lang.org/tools/install)
2. Clone this repository
3. Build and run:

```bash
cargo build --release
cargo run --release
```

The simulation will run for 5 minutes by default and then exit, or you can stop it earlier by pressing Ctrl+C.

## Dependencies

- `serde`: For JSON serialization/deserialization
- `tokio`: Async runtime
- `sha2`: For SHA-256 hashing
- `aes-gcm`: For AES-GCM encryption
- `rand`: For random number generation
- `base64`: For encoding/decoding
- `anyhow`: For error handling

## JSON Output Format

The main JSON output follows this structure:

```json
{
  "batch": [
    {
      "metadata": {
        "device_id": "rpi-rust-001",
        "timestamp": 1712511234,
        "data_hash": "a1b2c3d4e5f6..."
      },
      "encrypted_data": "base64encodedstring..."
    },
    ... (more readings)
  ]
}
```

## Notes

- The encryption key is stored in the `key/encryption.key` file and is created automatically if it doesn't exist
- A new simulation run will use the existing encryption key if available