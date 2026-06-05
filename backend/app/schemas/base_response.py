from pydantic import BaseModel

from typing import Any


class SuccessResponse(
    BaseModel
):

    success: bool = True

    message: str

    data: Any


class ErrorResponse(
    BaseModel
):

    success: bool = False

    error: str
