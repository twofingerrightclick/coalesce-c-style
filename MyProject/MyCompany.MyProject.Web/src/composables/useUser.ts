import {
  userInfo,
} from "@/user-service";

export function useUser() {
  return {
    userInfo,
  };
}
