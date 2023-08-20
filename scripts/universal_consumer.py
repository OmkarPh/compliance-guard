import re
import sqlite3
import requests
import json
from kafka import KafkaConsumer
from producers.topics import log_level_topics

LLM_API_URL = "https://merry-perfectly-jay.ngrok-free.app"

# Kafka configuration for local setup
kafka_config = {
    # Assuming Kafka broker is running locally
    "bootstrap_servers": "localhost:9092",
    # Different consumer group to listen to all topics
    "group_id": "all-consumer-group",
    "auto_offset_reset": "latest"
}

# Create a Kafka consumer instance
consumer = KafkaConsumer(
    *log_level_topics.values(),  # Subscribe to all topics from the dictionary
    **kafka_config
)

print(f"Consuming =>", list(log_level_topics.values()))


# DB for storing insights
db_connection = sqlite3.connect("logs.db")
db_cursor = db_connection.cursor()

# Create the "compliantlogs" table if it doesn't exist
db_cursor.execute('''
    CREATE TABLE IF NOT EXISTS compliantlogs (
        timestamp TEXT,
        loglevel TEXT,
        service TEXT,
        module TEXT,
        userid TEXT,
        event TEXT
    )
''')
db_cursor.execute('''
    CREATE TABLE IF NOT EXISTS noncompliantlogs (
        timestamp TEXT,
        loglevel TEXT,
        service TEXT,
        module TEXT,
        userid TEXT,
        event TEXT,
        cause TEXT,
        breaches TEXT,
        insight TEXT,
        teams TEXT
    )
''')
db_connection.commit()

# Parse for storing in DB
def parse_log(log_string):
    log_string = log_string.replace(
        "Not Compliant ", "").replace("Compliant ", "")
    log_pattern = re.compile(
        r'(?P<timestamp>[\d\-: ]+) (?P<loglevel>\w+) (?P<service>\w+) (?P<module>\w+) (?P<userid>\w+) (?P<event>.+)')
    match = log_pattern.match(log_string)
    if match:
        return match.groupdict()
    return None

# Consume and print messages
for message in consumer:
    topic = message.topic
    log = message.value.decode("utf-8")
    print(f"Consumed from {topic}: {log}")
    parsed_log = parse_log(log)

    # Call the API to check compliance
    response = requests.post(f"{LLM_API_URL}/verifylog", json={
        "log": log
    })

    if response.status_code == 200:
        api_data = response.json()
        is_compliant = api_data.get("isCompliant", False)

        if is_compliant:
            db_cursor.execute('''
                INSERT INTO compliantlogs (timestamp, loglevel, service, module, userid, event)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (parsed_log['timestamp'], parsed_log['loglevel'], parsed_log['service'], parsed_log['module'], parsed_log['userid'], parsed_log['event']))
        else:
            db_cursor.execute('''
                INSERT INTO noncompliantlogs (timestamp, loglevel, service, module, userid, event, cause, breaches, insight, teams)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (parsed_log['timestamp'], parsed_log['loglevel'], parsed_log['service'], parsed_log['module'], parsed_log['userid'], parsed_log['event'],
                  api_data['report']['cause'], api_data['report']['breaches'], api_data['report']['insight'], api_data['report']['teams']))
        db_connection.commit()
    else:
        print("Cant connect to LLM")

# Close the consumer and db connection
db_connection.close()
consumer.close()
