import { TrendingUp, TrendingDown } from 'lucide-react';

// ============================================================
// KOMPONEN: StatCard (Admin Dashboard)
// Menampilkan satu kartu statistik dengan ikon, nilai, dan tren.
// ============================================================
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => {
  const colorMap = {
    green:  { bg: 'bg-primary-50',  icon: 'bg-primary-800 text-white',  text: 'text-primary-800' },
    blue:   { bg: 'bg-blue-50',     icon: 'bg-blue-600 text-white',     text: 'text-blue-700' },
    amber:  { bg: 'bg-amber-50',    icon: 'bg-amber-500 text-white',    text: 'text-amber-700' },
    red:    { bg: 'bg-red-50',      icon: 'bg-red-500 text-white',      text: 'text-red-700' },
    purple: { bg: 'bg-purple-50',   icon: 'bg-purple-600 text-white',   text: 'text-purple-700' },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`${c.bg} rounded-2xl p-5 border border-white`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        {/* Tren naik/turun */}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {Math.abs(trendValue || trend)}%
          </div>
        )}
      </div>
      <p className={`text-2xl font-display font-bold ${c.text} mb-1`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
