from pydantic import BaseModel


class GoogleAuthRequest(
    BaseModel
):

    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: int
    name: str
    email: str
    is_new_user:bool

class RefreshTokenRequest(BaseModel):
    refresh_token: str