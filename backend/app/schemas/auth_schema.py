from pydantic import BaseModel


class GoogleAuthRequest(
    BaseModel
):

    id_token: str


class AuthResponse(
    BaseModel
):

    access_token: str

    user_id: int

    name: str

    email: str