"use client";
import { Loader2 } from "lucide-react";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/axios';
import ShoppingCartLoader from "@/components/ShoppingCartLoader";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      // No token, redirect to login
      router.push('/login');
    } else {
      // Token exists, allow access
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <ShoppingCartLoader />;
  }

  // Only render children if authenticated
  return isAuthenticated ? children : null;
}
