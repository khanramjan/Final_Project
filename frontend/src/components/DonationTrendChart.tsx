import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DonationTrendData {
  month: string;
  amount: number;
  count: number;
}

interface DonationTrendChartProps {
  data: DonationTrendData[];
}

const DonationTrendChart: React.FC<DonationTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Giving Trend</h3>
          <p className="text-sm text-gray-500 mt-1">Monthly donation activity over the past year</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'amount') return [`$${value.toLocaleString()}`, 'Amount'];
              return [value, 'Donations'];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Total Donated</p>
          <p className="text-lg font-semibold text-gray-900">
            ${data.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Donations</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationTrendChart;
