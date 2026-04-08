import { ReactNode } from "react";

const UsersLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div>
      <div className="w-full h-6 rounded-lg bg-primary-700"></div>
      <div>{children}</div>
    </div>
  );
};

export default UsersLayout;