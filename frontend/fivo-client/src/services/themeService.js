export const getThemeData = async (themeCode) => {
  const res = await fetch(`http://localhost:8000/theme/data?theme_code=${themeCode}`);
  return await res.json();
};
