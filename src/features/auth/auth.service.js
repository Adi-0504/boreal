export const authService = {
  login: (userId) => {
    localStorage.setItem('boreal_user_id', userId);
    return true;
  },
  logout: () => {
    localStorage.removeItem('boreal_user_id');
  },
  getCurrentUser: () => {
    return localStorage.getItem('boreal_user_id');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('boreal_user_id');
  }
};
