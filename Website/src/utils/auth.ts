export const auth = {
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')

    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_email')
  },

  isAuthenticated() {
    return !!localStorage.getItem(
      'auth_token'
    )
  },
}