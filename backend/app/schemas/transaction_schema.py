from pydantic import BaseModel


class TransactionResponse(
    BaseModel
):

    message: str

    merchant: str

    intent: str

    amount: float

    type: str

    category: str

    confidence: float

    source: str