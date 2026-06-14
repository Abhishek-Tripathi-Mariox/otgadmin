export default function Badge({ status, label }) {
  const statusStyles = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
        status === 'active' ? 'bg-green-600' : status === 'inactive' ? 'bg-red-600' : 'bg-yellow-600'
      }`}></span>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
