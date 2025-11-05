const DashboardHeader = ({ title, subtitle, icon }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-primary">{icon}</div>}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      )}
    </div>
  );
};

export default DashboardHeader;
