import React from "react";

function Sidebar({
  userQueries,
  onDeleteQuery,
  onClearHistory,
  isDarkMode,
  toggleTheme,
}) {
  return (
    <div
      className={`h-full flex flex-col ${
        isDarkMode ? "bg-gray-900" : "bg-orange-50"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <img
              src="/cimmyt-square.png"
              alt="CIMMYT Logo"
              className="h-auto w-auto"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Clear All Button */}
      {userQueries.length > 0 && (
        <div
          className={`p-4 border-b ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <button
            onClick={onClearHistory}
            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              isDarkMode
                ? "text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 border border-orange-500"
                : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-orange-200"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Clear All History</span>
          </button>
        </div>
      )}

      {/* User Queries History */}
      {userQueries.length > 0 && (
        <div
          className={`p-4 border-b ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Recent Queries
          </h3>
          <ul className="space-y-1 max-h-140 overflow-y-hidden">
            {userQueries
              .slice(-5)
              .reverse()
              .map((query) => (
                <li
                  key={query.id}
                  className={`group flex items-start justify-between py-1 px-2 rounded transition-colors ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {query.text.length > 60
                        ? `${query.text.substring(0, 60)}...`
                        : query.text}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {query.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuery(query.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ml-2 ${
                      isDarkMode
                        ? "text-gray-500 hover:text-orange-400"
                        : "text-gray-400 hover:text-orange-500"
                    }`}
                    title="Delete query"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Empty State - only show when no user queries */}
      {userQueries.length === 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className={`text-center py-8 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <svg
              className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">No queries yet</p>
            <p className="text-sm mt-1">Your recent queries will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
