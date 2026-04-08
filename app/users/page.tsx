import UserSnippet from "@/components/users/UserSnippet";
import { ChevronDownIcon } from "@heroicons/react/24/outline"

const UsersPage = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-4 justify-items-center w-full font-semibold">
        <button className="flex flex-row items-center gap-1"><div>Name</div><div><ChevronDownIcon className="size-4"/></div></button>
        <div>Email</div>
        <div>Phone</div>
        <div>Manage</div>
      </div>
      <div className="flex flex-col gap-4">
        {Users.map((user, index) => (
            <UserSnippet name={user.firstName + " " + user.secondName} email={user.email} phone={user.phone} key={index}/>
        ))}
      </div>
    </div>
  );
};

export default UsersPage

const Users = [
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
  {
    firstName: "Jan",
    secondName: "Kowalski",
    email: "jakisemail@gmail.com",
    phone: "123-123-123",
  },
];
