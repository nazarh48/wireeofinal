import { motion } from 'framer-motion';

const AnalyticsCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  children, 
  iconBg = 'bg-emerald-50',
  iconColor = 'text-emerald-600',
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div>{children}</div>
    </motion.div>
  );
};

export default AnalyticsCard;
