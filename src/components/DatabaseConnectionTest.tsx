import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionStatus {
  isConnected: boolean;
  error: string | null;
  tables: string[];
  userCount: number;
}

export const DatabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    error: null,
    tables: [],
    userCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setStatus({
      isConnected: false,
      error: null,
      tables: [],
      userCount: 0,
    });

    try {
      // Test basic connection
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("Auth test:", { user: !!user, authError });

      // Test database access
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (profilesError) {
        throw new Error(`Database error: ${profilesError.message}`);
      }

      // Get table list
      const { data: tables, error: tablesError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public");

      // Get user count
      const { count: userCount, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStatus({
        isConnected: true,
        error: null,
        tables: tables?.map((t) => t.table_name) || [],
        userCount: userCount || 0,
      });
    } catch (error) {
      console.error("Connection test failed:", error);
      setStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tables: [],
        userCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Database Connection Test</h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status.isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="font-medium">
            {status.isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{status.error}</p>
          </div>
        )}

        {status.isConnected && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-800 font-medium">Connection successful!</p>
            <p className="text-green-600 text-sm">
              Found {status.tables.length} tables and {status.userCount} users
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Available Tables:</h3>
          <div className="grid grid-cols-2 gap-2">
            {status.tables.map((table, index) => (
              <div
                key={index}
                className="bg-gray-100 px-2 py-1 rounded text-sm"
              >
                {table}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={testConnection}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Connection Again"}
        </button>
      </div>
    </div>
  );
};

export default DatabaseConnectionTest;



