from app.services.llm.groq_service import (
    client,
)


def answer_financial_question(
    question: str,
    context: str,
):

    prompt = f"""
You are TranSactly AI.

You are a personal finance assistant.

IMPORTANT:

- Use ONLY the provided financial context.
- Never assume missing transactions.
- Never speculate about additional income.
- Never suggest reviewing unknown data.
- If information is unavailable, explicitly say:
  "That information is not available in the current financial data."
- Base every recommendation on actual categories and amounts.

Never invent numbers.

If information is missing,
say so.

Financial Context:

{context}

Question:

{question}

Answer clearly and concisely.
"""

    try:

        completion = (
            client.chat.completions.create(

                model=
                "llama-3.3-70b-versatile",

                messages=[
                    {
                        "role":
                        "user",

                        "content":
                        prompt,
                    }
                ],

                temperature=0.3,

                max_tokens=400,
            )
        )

        answer = (
            completion
            .choices[0]
            .message.content
        )

        return {

            "text":
            answer,

            "insightType":
            "summary",

            "suggestions": [

                "How much did I save?",

                "Where am I spending most?",

                "Show top merchants",

                "How healthy are my finances?",
            ],
        }

    except Exception as e:

        print(
            "GROQ ERROR:",
            str(e),
        )

        return {

            "text":
            "AI analysis is currently unavailable.",

            "insightType":
            "summary",
        }