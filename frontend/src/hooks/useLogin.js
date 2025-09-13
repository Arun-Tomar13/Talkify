import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../lib/api.js';

function useLogin() {
  const queryClient = useQueryClient();
  const {mutate,isPending,error,} = useMutation({
    mutationFn: async (credentials) => {
    try {
        return await login(credentials);
      } catch (err) {
        // Extract backend error message if available
        if (err.response && err.response.data && err.response.data.message) {
          throw new Error(err.response.data.message);
        }
        throw new Error("Something went wrong. Please try again.");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    
  });

  return {isPending,error,loginMutation:mutate}
}

export default useLogin;