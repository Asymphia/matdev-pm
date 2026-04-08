import { Bars3Icon } from "@heroicons/react/24/outline";

interface UserSnippetProps {
  name: string,
  email: string,
  phone:string
}

const UserSnippet = ({name, email, phone} : UserSnippetProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 justify-items-center w-full">
      <div>{name}</div>
      <div>{email}</div>
      <div className="font-medium">{phone}</div>
      <button><Bars3Icon className="size-6"/></button>
    </div>
  );
};

export default UserSnippet;
