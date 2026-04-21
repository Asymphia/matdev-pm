import UsersTopBar from "@/components/users/UsersTopBar";
import { ReactNode } from "react";

const UsersLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
      <div>{children}</div>
  );
};

export default UsersLayout;