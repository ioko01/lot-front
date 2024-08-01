export const getToken = () => {
  // Retrieve the token from local storage or your state management library
  const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
  const refresh_token = localStorage.getItem(import.meta.env.VITE_OPS_REFRESH_TOKEN);
  return { access_token, refresh_token };
};