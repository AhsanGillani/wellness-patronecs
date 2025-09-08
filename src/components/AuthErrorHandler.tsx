import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";

const AuthErrorHandler: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Only show error for explicit authentication errors
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get("error");

    // Only show error if there's an explicit auth error in the URL
    // This prevents showing error during normal app usage
    if (authError === "invalid_token" || authError === "auth_error") {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, []);

  const handleRetry = () => {
    setShowError(false);
    window.location.reload();
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  if (!showError) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Required
        </h2>

        <p className="text-gray-600 mb-6">
          Your session has expired or there was an authentication error. Please
          sign in again to continue.
        </p>

        <div className="space-y-3">
          <Button onClick={handleSignIn} className="w-full">
            Sign In
          </Button>

          <Button onClick={handleRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorHandler;
