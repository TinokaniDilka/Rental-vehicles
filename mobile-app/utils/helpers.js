export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatCurrency = (amount) =>
  `LKR ${Number(amount).toLocaleString()}`;

export const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return '#22c55e';
    case 'pending':   return '#f59e0b';
    case 'cancelled': return '#ef4444';
    case 'completed': return '#6366f1';
    default:          return '#64748b';
  }
};

export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};