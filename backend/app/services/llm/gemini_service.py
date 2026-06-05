import json

from google import genai

from app.config.settings import (
    settings,
)

client = genai.Client(

    api_key=settings.GEMINI_API_KEY
)


# def detect_financial_intent(
#     query: str,
# ):

#     prompt = f"""

# You are a financial AI intent classifier.

# Classify the user query into ONE intent.

# Possible intents:

# - spending
# - categories
# - subscriptions
# - anomaly
# - savings
# - income
# - unknown

# Return ONLY valid JSON.

# Example:
# {{"intent":"spending"}}

# User Query:
# {query}

# """

#     response = client.models.generate_content(

#         model="gemini-2.0-flash",

#         contents=prompt,
#     )

#     text = (
#         response.text
#         .strip()
#         .replace(
#             "```json",
#             ""
#         )
#         .replace(
#             "```",
#             ""
#         )
#     )

#     try:

#         parsed = json.loads(text)

#         return parsed.get(
#             "intent",
#             "unknown",
#         )

#     except Exception as e:

#         print(
#             "GEMINI PARSE ERROR:",
#             e,
#         )

#         return "unknown"

def classify_merchant(
    merchant: str,
):

    prompt = f"""

You are a financial merchant classifier.

Classify the merchant into ONE category.

Possible categories:

- Food
- Shopping
- Travel
- Entertainment
- Bills
- Income
- Transfer
- Healthcare
- Education
- Other

Return ONLY JSON.

Example:

{{

  "category": "Food",

  "confidence": 0.95

}}

Merchant:

{merchant}

"""

    response = client.models.generate_content(

        model="gemini-2.0-flash",

        contents=prompt,
    )

    text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:

        result = json.loads(text)

        return {

            "category":
            result.get(
                "category",
                "Other",
            ),

            "confidence":
            float(
                result.get(
                    "confidence",
                    0.5,
                )
            ),
        }

    except Exception:

        return {

            "category":
            "Other",

            "confidence":
            0.5,
        }
