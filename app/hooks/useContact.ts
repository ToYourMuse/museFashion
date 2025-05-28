import { useState } from 'react';
import { toast } from 'react-toastify';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

interface UseContactReturn {
  sendMessage: (formData: ContactFormData) => Promise<void>;
  loading: boolean;
  success: boolean;
  error: string | null;
  reset: () => void;
}

export const useContact = (): UseContactReturn => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (formData: ContactFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      toast.success('Thank you for contacting us!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  };

  return {
    sendMessage,
    loading,
    success,
    error,
    reset,
  };
};