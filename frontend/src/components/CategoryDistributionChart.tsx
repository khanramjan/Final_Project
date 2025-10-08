import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Donation Distribution</h3>
        <p className="text-sm text-gray-500 mt-1">Your support across different causes</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => {
              const percent = (((entry.value || 0) / total) * 100).toFixed(0);
              return `${percent}%`;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `৳${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-3">
        {data.map((item, index) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">৳{item.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{percent}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
