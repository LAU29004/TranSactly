from google.auth.transport import requests
from google.oauth2 import id_token

from app.config.settings import settings


def verify_google_token(
    token: str,
):

    payload = id_token.verify_oauth2_token(

        token,

        requests.Request(),

        settings.GOOGLE_CLIENT_ID,
    )

    return {

        "google_id":
        payload["sub"],

        "email":
        payload["email"],

        "name":
        payload.get(
            "name",
            "",
        ),

        "picture":
        payload.get(
            "picture",
        ),
    }