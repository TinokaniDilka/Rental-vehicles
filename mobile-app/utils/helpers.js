export const formatDate = (dateString) => {
  if (!dateString) return '—';

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  if (amount == null) return 'LKR 0';
  return `LKR ${Number(amount).toLocaleString('en-US')}`;
};

// Keep your existing getStatusColor if you have it
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