const DEV_API = "http://10.0.2.2:8000";
const PROD_API = "https://YOUR-RAILWAY-BACKEND.up.railway.app";

export const API_BASE_URL = __DEV__
  ? DEV_API
  : PROD_API;