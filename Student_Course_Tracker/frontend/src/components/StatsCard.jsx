const StatsCard = ({ icon, label, value, color, subtitle }) => {
  return (
    <div className="stats-card" style={{ '--accent': color }}>
      <div className="stats-icon" style={{ background: color }}>{icon}</div>
      <div className="stats-content">
        <p className="stats-label">{label}</p>
        <h2 className="stats-value">{value}</h2>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
