import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/contacts", icon: "fas fa-address-book", label: "Contacts" },
    { path: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                location === item.path 
                  ? "text-emergency" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <i className={`${item.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
