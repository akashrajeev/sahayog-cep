import { Alert } from '@/context/DisasterContext';
import { AlertTriangle, Flame, Waves, Wind, Mountain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
}

const AlertCard = ({ alert }: AlertCardProps) => {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (alert.type) {
      case 'flood':
        return Waves;
      case 'fire':
        return Flame;
      case 'earthquake':
        return AlertTriangle;
      case 'cyclone':
        return Wind;
      case 'landslide':
        return Mountain;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'high':
        return 'border-primary bg-primary/5 text-primary';
      case 'medium':
        return 'border-accent bg-accent/5 text-accent';
      case 'low':
        return 'border-secondary bg-secondary/5 text-secondary';
      default:
        return 'border-muted bg-muted/5 text-muted-foreground';
    }
  };

  const Icon = getIcon();
  const timeAgo = formatTimeAgo(alert.timestamp);

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all hover:shadow-md',
        getSeverityColor()
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base">
              {t(`alerts.${alert.type}`)} - {alert.region}
            </h3>
            <span className="text-xs uppercase font-medium px-2 py-1 rounded bg-current/10">
              {t(`alerts.${alert.severity}`)}
            </span>
          </div>
          <p className="text-sm text-foreground/80 mb-2">{alert.description}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default AlertCard;
