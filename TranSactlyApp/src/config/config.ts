const DEV_API = "http://10.0.2.2:8000";
const PROD_API = "https://centfluence-backend.onrender.com";
export const GOOGLE_WEB_CLIENT_ID = '487713976249-32ass0tj29j646afrof4lkjtdu21jvt3.apps.googleusercontent.com';
export const API_BASE_URL = __DEV__
  ? DEV_API
  : PROD_API;