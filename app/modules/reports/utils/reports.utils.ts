export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('vi-VN').format(val);
};
