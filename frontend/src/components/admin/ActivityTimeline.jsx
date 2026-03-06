import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ActivityItem = ({ icon: Icon, title, subtitle, time, color = 'bg-violet-400', delay = 0 }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    className="relative flex gap-4 py-3 pl-8 group"
  >
    <span className={`absolute left-0 w-4 h-4 rounded-full ${color} border-2 border-white shadow-sm group-hover:scale-110 transition-transform`} />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      <p className="text-xs text-slate-400 mt-1">{time}</p>
    </div>
  </motion.li>
);

const ActivityTimeline = ({ activities = [], emptyMessage = 'No recent activity' }) => {
  if (!activities.length) {
    return <p className="text-slate-500 text-sm py-4">{emptyMessage}</p>;
  }

  return (
    <ul className="relative space-y-0">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
      {activities.map((activity, i) => (
        <ActivityItem
          key={activity.id}
          icon={activity.icon}
          title={activity.label}
          subtitle={activity.subtitle}
          time={new Date(activity.timestamp).toLocaleString()}
          color={activity.color || 'bg-violet-400'}
          delay={i * 0.05}
        />
      ))}
    </ul>
  );
};

export default ActivityTimeline;
