import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material';

const RecentItemsCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  items = [], 
  linkTo,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  accentColor = 'bg-emerald-400',
  delay = 0,
  emptyMessage = 'No items yet'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + (i * 0.05) }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <span className={`w-1.5 h-8 rounded-full ${accentColor} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                {item.subtitle && (
                  <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                )}
              </div>
              {linkTo && (
                <Link 
                  to={linkTo} 
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-sm py-4 text-center">{emptyMessage}</p>
      )}
    </motion.div>
  );
};

export default RecentItemsCard;
