from kafka import KafkaProducer
import time
from topics import log_level_topics

# Kafka configuration for local setup
kafka_config = {
    "bootstrap_servers": "localhost:9092",  # Assuming Kafka broker is running locally
}

# Create a Kafka producer instance
producer = KafkaProducer(**kafka_config)

# The topic to produce messages to
topic = log_level_topics["debug"]

# File to read and send lines from
test_logs_path = "../../logs"
file_path = f"{test_logs_path}/{topic}.txt"

print(f"Consuming {topic}")

# Read and send lines from the file
with open(file_path, "r") as file:
    for line in file:
        message = line.strip()  # Remove leading/trailing whitespaces and newline
        producer.send(topic, message.encode("utf-8"))
        producer.flush()
        print(f"Produced ({topic}): {message}")
        time.sleep(2)  # Delay between sending messages

# Close the producer
producer.close()