export default function Card({ title, children, className = '', icon: Icon = null, onClick = null }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-6 ${onClick ? 'cursor-pointer hover:border-orange-200' : ''} ${className}`}>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className="p-2.5 bg-orange-50 rounded-lg">
              <Icon size={20} className="text-orange-600" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
