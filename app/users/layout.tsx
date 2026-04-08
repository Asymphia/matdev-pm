import UsersTopBar from "@/components/users/UsersTopBar";
import { ReactNode } from "react";

const UsersLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="grid gap-11">
      <div className="w-full">
        <UsersTopBar/>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default UsersLayout;