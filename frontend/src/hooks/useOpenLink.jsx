export const useOpenLink = () => {
  return (url) => {
    return window.open(url, "_blank");
  };
};
