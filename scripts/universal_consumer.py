from kafka import KafkaConsumer
from producers.topics import log_level_topics

# Kafka configuration for local setup
kafka_config = {
    "bootstrap_servers": "localhost:9092",  # Assuming Kafka broker is running locally
    "group_id": "all-consumer-group",  # Different consumer group to listen to all topics
    "auto_offset_reset": "earliest",
}

# Create a Kafka consumer instance
consumer = KafkaConsumer(
    *log_level_topics.values(),  # Subscribe to all topics from the map
    **kafka_config
)

print(f"Consuming =>", list(log_level_topics.values()))

# Consume and print messages
for message in consumer:
    topic = message.topic
    value = message.value.decode("utf-8")
    print(f"Consumed from {topic}: {value}")

# Close the consumer
consumer.close()
