from pydantic import BaseModel

from typing import List


class SMSItem(BaseModel):

    message: str

    date: str


class SMSRequest(BaseModel):

    messages: List[SMSItem]
