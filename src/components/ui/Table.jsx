export default function Table({ columns, data, actions = null }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
