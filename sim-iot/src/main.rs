use std::collections::VecDeque;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use std::vec::Vec;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use serde::{Serialize, Deserialize};
use tokio::sync::Mutex;
use std::sync::Arc;
use sha2::{Sha256, Digest};
use aes_gcm::{Aes256Gcm, Key, Nonce, KeyInit};
use aes_gcm::aead::Aead;
use rand::Rng;
use base64::{Engine, engine::general_purpose::STANDARD};
use anyhow::{Result, Context};

// Configuration constants
const BATCH_SIZE: usize = 10;
const DEVICE_ID: &str = "rpi-rust-001";
const READING_INTERVAL_MS: u64 = 1000; // 1 second for faster simulation
const KEY_STORAGE_PATH: &str = "./key/encryption.key";
const OUTPUT_DIR: &str = "./output";

// Sensor reading data structure
#[derive(Serialize, Deserialize, Debug)]
struct SensorReading {
    device_id: String,
    timestamp: u64,
    readings: Readings,
}

#[derive(Serialize, Deserialize, Debug)]
struct Readings {
    temperature: f32,
    humidity: f32,
    pressure: Option<f32>,
}

// Payload structure 
#[derive(Serialize, Deserialize, Debug, Clone)]
struct Payload {
    metadata: Metadata,
    encrypted_data: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Metadata {
    device_id: String,
    timestamp: u64,
    data_hash: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct BatchPayload {
    batch: Vec<Payload>,
}

// Main function for async runtime
#[tokio::main]
async fn main() -> Result<()> {
    println!("Starting IoT data simulation...");
    
    // Create output directory if it doesn't exist
    std::fs::create_dir_all(OUTPUT_DIR)
        .context("Failed to create output directory")?;
    
    // Initialize or load encryption key
    let encryption_key = load_or_create_encryption_key()?;
    
    // Initialize data queue
    let data_queue: Arc<Mutex<VecDeque<Payload>>> = Arc::new(Mutex::new(VecDeque::new()));
    
    // Start data collection task
    let collection_queue: Arc<Mutex<VecDeque<Payload>>> = data_queue.clone();
    
    // Set simulation duration (5 minutes)
    let simulation_duration = Duration::from_secs(300);
    let start_time = SystemTime::now();
    
    println!("Running simulation for {} seconds...", simulation_duration.as_secs());
    
    // Start collection loop
    tokio::spawn(async move {
        let mut batch_count = 0;
        
        while SystemTime::now().duration_since(start_time).unwrap() < simulation_duration {
            match collect_and_process_data(&encryption_key).await {
                Ok(payload) => {
                    let mut queue = collection_queue.lock().await;
                    queue.push_back(payload);
                    println!("Collected new data point. Queue size: {}", queue.len());
                    
                    // If we have enough for a batch, save to JSON file
                    if queue.len() >= BATCH_SIZE {
                        drop(queue); // Release lock before saving
                        match save_batch_to_json(&collection_queue, batch_count).await {
                            Ok(_) => batch_count += 1,
                            Err(e) => eprintln!("Failed to save batch: {}", e),
                        }
                    }
                },
                Err(e) => eprintln!("Error collecting data: {}", e),
            }
            
            tokio::time::sleep(Duration::from_millis(READING_INTERVAL_MS)).await;
        }
        
        // At the end, save any remaining data in the queue
        if let Err(e) = save_batch_to_json(&collection_queue, batch_count).await {
            eprintln!("Failed to save final batch: {}", e);
        }
        
        println!("Simulation complete. Check the '{}' directory for output files.", OUTPUT_DIR);
        std::process::exit(0);
    });
    
    // Keep the main thread running
    tokio::signal::ctrl_c().await?;
    println!("Shutdown signal received, cleaning up...");
    println!("IoT data simulation stopped");
    Ok(())
}

// Load existing encryption key or create a new one
fn load_or_create_encryption_key() -> Result<[u8; 32]> {
    use std::fs;
    use std::io::{Read, Write};
    use std::path::Path;
    
    let key_path = Path::new(KEY_STORAGE_PATH);
    
    if key_path.exists() {
        // Load existing key
        let mut file: fs::File = fs::File::open(key_path)
            .context("Failed to open encryption key file")?;
        
        let mut key = [0u8; 32];
        file.read_exact(&mut key)
            .context("Failed to read encryption key")?;
        
        Ok(key)
    } else {
        // Create directory if it doesn't exist
        if let Some(parent) = key_path.parent() {
            fs::create_dir_all(parent)
                .context("Failed to create directory for encryption key")?;
        }
        
        // Generate new key
        let key: [u8; 32] = rand::thread_rng().r#gen();

        // Save key for future use
        let mut file = fs::File::create(key_path)
            .context("Failed to create encryption key file")?;
        
        file.write_all(&key)
            .context("Failed to write encryption key")?;
        
        // Set appropriate permissions for the key file
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(key_path)?.permissions();
            perms.set_mode(0o600); // Only owner can read/write
            fs::set_permissions(key_path, perms)?;
        }
        
        Ok(key)
    }
}

// Simulate reading sensor data
async fn read_sensor_data() -> Result<SensorReading> {
    // For simulation - generate random values
    let temperature = 20.0 + (rand::thread_rng().r#gen::<f32>() * 10.0) - 5.0; // 15°C to 25°C
    let humidity = 40.0 + (rand::thread_rng().r#gen::<f32>() * 20.0); // 40% to 60%
    let pressure = Some(1000.0 + (rand::thread_rng().r#gen::<f32>() * 50.0)); // 1000-1050 hPa
    
    // Get current timestamp
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("Time went backwards")?
        .as_secs();
    
    Ok(SensorReading {
        device_id: DEVICE_ID.to_string(),
        timestamp,
        readings: Readings {
            temperature,
            humidity,
            pressure,
        },
    })
}

// Process and encrypt data
async fn collect_and_process_data(encryption_key: &[u8; 32]) -> Result<Payload> {
    // Read sensor data
    let sensor_data = read_sensor_data().await?;
    
    // Skip invalid readings
    if sensor_data.readings.temperature < -40.0 || sensor_data.readings.temperature > 85.0 {
        anyhow::bail!("Invalid temperature reading: {}", sensor_data.readings.temperature);
    }
    
    // Serialize to JSON
    let data_string = serde_json::to_string(&sensor_data)?;
    
    // Create hash for integrity check
    let mut hasher = Sha256::new();
    hasher.update(data_string.as_bytes());
    let data_hash = format!("{:x}", hasher.finalize());
    
    // Encrypt the data
    let encrypted_data = encrypt_data(data_string.as_bytes(), encryption_key)?;
    
    // Create payload
    let payload = Payload {
        metadata: Metadata {
            device_id: sensor_data.device_id,
            timestamp: sensor_data.timestamp,
            data_hash,
        },
        encrypted_data,
    };
    
    Ok(payload)
}

// Encrypt data using AES-GCM
fn encrypt_data(data: &[u8], key_bytes: &[u8; 32]) -> Result<String> {
    let key = Key::<Aes256Gcm>::from_slice(key_bytes);
    let cipher = Aes256Gcm::new(&key);
    
    // Generate a random 12-byte nonce
    let mut rng = rand::thread_rng();
    let mut nonce_bytes = [0u8; 12];
    rng.fill(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    // Encrypt
    let ciphertext = cipher.encrypt(nonce, data)
        .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;
    
    // Combine nonce and ciphertext and encode as base64
    let mut combined = Vec::with_capacity(nonce_bytes.len() + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);
    
    Ok(STANDARD.encode(&combined))
}

// Decrypt data (for verification purposes)
fn decrypt_data(encrypted_data: &str, key_bytes: &[u8; 32]) -> Result<Vec<u8>> {
    // Decode from base64
    let combined = STANDARD.decode(encrypted_data)
        .context("Failed to decode base64 data")?;
    
    // Extract nonce and ciphertext
    if combined.len() < 12 {
        anyhow::bail!("Encrypted data too short");
    }
    
    let nonce = Nonce::from_slice(&combined[..12]);
    let ciphertext = &combined[12..];
    
    // Create cipher instance
    let key = Key::<Aes256Gcm>::from_slice(key_bytes);
    let cipher = Aes256Gcm::new(&key);
    
    // Decrypt
    cipher.decrypt(nonce, ciphertext)
        .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))
}

// Save batch to JSON file
async fn save_batch_to_json(queue_arc: &Arc<Mutex<VecDeque<Payload>>>, batch_number: usize) -> Result<()> {
    // Extract batch from queue
    let mut batch = Vec::new();
    {
        let mut queue = queue_arc.lock().await;
        while !queue.is_empty() && batch.len() < BATCH_SIZE {
            if let Some(item) = queue.pop_front() {
                batch.push(item);
            }
        }
    }
    
    if batch.is_empty() {
        return Ok(());
    }
    
    // Create a timestamp for the filename
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("Time went backwards")?
        .as_secs();
    
    // Create batch payload
    let batch_payload = BatchPayload { batch: batch.clone() };
    
    // Convert to JSON
    let json_data = serde_json::to_string_pretty(&batch_payload)
        .context("Failed to serialize batch to JSON")?;
    
    // Create output file path
    let file_path = Path::new(OUTPUT_DIR)
        .join(format!("iot_data_batch_{}_timestamp_{}.json", batch_number, timestamp));
    
    // Save to file
    let mut file = File::create(&file_path)
        .context(format!("Failed to create output file: {:?}", file_path))?;
    
    file.write_all(json_data.as_bytes())
        .context("Failed to write JSON data to file")?;
    
    println!("Successfully saved batch {} with {} items to {:?}", 
             batch_number, batch.len(), file_path);
    
    // Also save the raw data for easier analysis (optional)
    let mut raw_readings = Vec::new();
    
    // Create output file path for raw data
    let raw_file_path = Path::new(OUTPUT_DIR)
        .join(format!("raw_data_batch_{}_timestamp_{}.json", batch_number, timestamp));
    
    // Decrypt and save raw data
    for payload in batch {
        // Skip decryption in simulator for simplicity
        raw_readings.push(payload.metadata);
    }
    
    // Save raw metadata to file
    let raw_json = serde_json::to_string_pretty(&raw_readings)
        .context("Failed to serialize raw readings to JSON")?;
    
    let mut raw_file = File::create(&raw_file_path)
        .context(format!("Failed to create raw output file: {:?}", raw_file_path))?;
    
    raw_file.write_all(raw_json.as_bytes())
        .context("Failed to write raw JSON data to file")?;
    
    println!("Also saved raw metadata to {:?}", raw_file_path);
    
    Ok(())
}