from groq import Groq
from decouple import config


client = Groq(
    api_key=config("GROQ_API_KEY")
)


response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "user",
            "content": "Say hello in one short sentence."
        }
    ],
    reasoning_effort="low",
)


print(response.choices[0].message.content)