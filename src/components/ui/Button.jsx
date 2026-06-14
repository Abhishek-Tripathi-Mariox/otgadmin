export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  ...props 
}) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow-md focus:ring-orange-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md focus:ring-green-500',
    outline: 'border border-orange-500 text-orange-600 hover:bg-orange-50 focus:ring-orange-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
