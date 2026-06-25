import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../../config/config';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export default GoogleSignin;