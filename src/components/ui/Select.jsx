export default function Select({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  error = '',
  className = '',
  ...props
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white appearance-none cursor-pointer ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id || opt.value} value={opt.id || opt.value}>
            {opt.name || opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 text-xs font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
}
