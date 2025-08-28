import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../lib/api.js';

function useLogout() {
  const queryClient = useQueryClient();

  const {mutate:logoutMutation , isPending, error} = useMutation({
    mutationFn: logout,
    onSuccess:()=> queryClient.invalidateQueries({queryKey:["authUser"]})
  })

  return {logoutMutation}
}

export default useLogout;