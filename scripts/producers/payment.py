from kafka import KafkaProducer
import time
from topics import log_level_topics
from producer_config import LOGS_TIME_INTERVAL, TEST_LOGS_PATH

# Kafka configuration for local setup
kafka_config = {
    "bootstrap_servers": "localhost:9092",  # Assuming Kafka broker is running locally
}

# Create a Kafka producer instance
producer = KafkaProducer(**kafka_config)

# The topic to produce messages to
topic = log_level_topics["payment"]

# File to read and send lines from
file_path = f"{TEST_LOGS_PATH}/{topic}.txt"

print(f"{topic} producing logs ...\n")

# Read and send lines from the file
with open(file_path, "r") as file:
    for line in file:
        message = line.strip()  # Remove leading/trailing whitespaces and newline
        producer.send(topic, message.encode("utf-8"))
        producer.flush()
        print(f"Produced ({topic}): {message}")
        time.sleep(LOGS_TIME_INTERVAL)  # Delay between sending messages

# Close the producer
producer.close()