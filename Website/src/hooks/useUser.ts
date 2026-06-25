// hooks/useUser.ts

import { useApi } from "./useApi";
import { userService } from "@/services/userService";

export function useUser() {
  return useApi(
    () => userService.getMe(),
    []
  );
}