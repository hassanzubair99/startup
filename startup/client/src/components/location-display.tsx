interface LocationDisplayProps {
  location: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function LocationDisplay({ location, loading, error, onRefresh }: LocationDisplayProps) {
  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Current Location</h3>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          <i className={`fas fa-refresh mr-1 ${loading ? 'animate-spin' : ''}`}></i>
          Update
        </button>
      </div>

      <div className="space-y-2">
        {error ? (
          <div className="text-sm text-emergency flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        ) : loading ? (
          <div className="text-sm text-gray-500 flex items-center">
            <i className="fas fa-spinner animate-spin mr-2"></i>
            Getting location...
          </div>
        ) : location ? (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-compass text-gray-400"></i>
              <span>Latitude: {formatCoordinate(location.coords.latitude)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-compass text-gray-400"></i>
              <span>Longitude: {formatCoordinate(location.coords.longitude)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-clock text-gray-400"></i>
              <span>Last updated: {formatTimestamp(location.timestamp)}</span>
            </div>
            {location.coords.accuracy && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-crosshairs text-gray-400"></i>
                <span>Accuracy: ±{Math.round(location.coords.accuracy)}m</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">
            No location data available
          </div>
        )}
      </div>
    </div>
  );
}
