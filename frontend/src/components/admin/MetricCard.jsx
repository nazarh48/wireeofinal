import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp } from '@mui/icons-material';

const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendValue,
  to, 
  gradient = 'from-emerald-500 to-emerald-600',
  delay = 0 
}) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {label}
          </p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight mb-1">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">{trendValue}</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

export default MetricCard;
