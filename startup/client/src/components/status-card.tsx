interface StatusCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  status: string;
  statusColor: string;
}

export default function StatusCard({ 
  icon, 
  iconColor, 
  iconBg, 
  title, 
  status, 
  statusColor 
}: StatusCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} ${iconColor}`}></i>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className={`text-xs ${statusColor}`}>{status}</p>
        </div>
      </div>
    </div>
  );
}
