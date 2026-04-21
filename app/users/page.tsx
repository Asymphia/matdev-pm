"use client";

import BlockWrapper from "@/components/ui/BlockWrapper";
import Modal from "@/components/ui/Modal";
import UserSnippet from "@/components/users/UserSnippet";
import UsersTopBar from "@/components/users/UsersTopBar";
import {
  ArrowLeftIcon,
  AtSymbolIcon,
  ChevronDownIcon,
  LinkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const UsersPage = () => {
  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get("showmodal") === "true";

  const handleSubmit = async (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());
    console.log("Dane formularza:", rawData);
  };

  const fieldClasses =
    "w-full pl-10 pr-4 py-3 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary appearance-none";
  const iconClasses =
    "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground";

  const FormField = ({
    icon: Icon,
    isSelect,
    children,
  }: {
    icon: any;
    isSelect?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="relative w-full flex items-center">
      <Icon className={iconClasses} />
      {children}
      {isSelect && (
        <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-muted-foreground" />
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-11 w-full h-full">
      <div className="w-full">
        <UsersTopBar />
      </div>
      <BlockWrapper>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-4 justify-items-center w-full font-semibold">
            <button className="flex flex-row items-center gap-1">
              <div>Name</div>
              <div>
                <ChevronDownIcon className="size-4" />
              </div>
            </button>
            <div>Email</div>
            <div>Phone</div>
            <div>Manage</div>
          </div>
          <div className="flex flex-col gap-4">
            {Users.map((user, index) => (
              <UserSnippet
                name={user.firstName + " " + user.secondName}
                email={user.email}
                phone={user.phone}
                key={index}
              />
            ))}
          </div>
        </div>
      </BlockWrapper>
      {isModalOpen && (
        <Modal href="/users">
          <div className="w-[600px] max-w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h2 className="text-2xl font-semibold">User form</h2>
              <Link
                href="/users"
                className="flex items-center justify-center w-10 h-10 border border-border rounded-full hover:bg-secondary transition-all group"
              >
                <ArrowLeftIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>

            <form action={handleSubmit} className="flex flex-col gap-4">
              <FormField icon={LinkIcon}>
                <input
                  name="name"
                  placeholder="Name"
                  className={fieldClasses}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField icon={UserIcon}>
                  <input
                    name="firstName"
                    placeholder="First Name"
                    className={fieldClasses}
                  />
                </FormField>
                <FormField icon={UserIcon}>
                  <input
                    name="secondName"
                    placeholder="Second Name"
                    className={fieldClasses}
                  />
                </FormField>
              </div>

              <div>
                <FormField icon={AtSymbolIcon}>
                  <input
                    name="email"
                    placeholder="e-mail"
                    className={fieldClasses}
                  />
                </FormField>
              </div>
              <div>
                <FormField icon={AtSymbolIcon}>
                  <input
                    name="name"
                    placeholder="phoneNumber"
                    className={fieldClasses}
                  />
                </FormField>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-[#2D3748] text-white px-6 py-2 rounded-full hover:bg-[#1a202c] transition-colors flex items-center gap-2"
                >
                  Add new user <span>+</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;

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
]
