"""A service that handles sending API requests to chatGPT, and receiving the response.
The only issue is how we get the messages, but that's presumably done as well.
Task
"""
import os
from dotenv import load_dotenv
import openai

GPT_MODEL = "gpt-4"
load_dotenv()
openai.api_key = os.environ["OPENAI_API_KEY"]


def get_chat(messages):
    from ..app import app  # Purely for logging.

    """Send a request to the ChatGPT api for a chat completion, given the messages as a list.
    Message objects should be formatted: {role: "my_role", content: "some content"}."""
    # app.logger.info(f"GPT receives: {messages} as messages.")
    chat_raw = openai.ChatCompletion.create(
        model=GPT_MODEL, messages=messages, stream=True, max_tokens=1200
    )
    return chat_raw
