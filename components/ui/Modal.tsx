"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: ReactNode;
  href?: string;
  additionalStyles?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const Modal = ({
  children,
  href = "",
  additionalStyles = true,
  isOpen = true,
  onClick,
}: ModalProps) => {
  const router = useRouter();

  const onDismiss = () => {
    if (!href) router.back();
    else if (href === "none") onClick && onClick();
    else router.push(href);
  };

  const blockWrapperStyles =
    "bg-background rounded-md border border-solid border-border p-9 shadow-sm flex flex-col";

  return createPortal(
    <div
      onClick={onDismiss}
      className={`fixed inset-0 w-screen h-screen bg-black/50 z-20 flex items-center justify-center ${!isOpen && "hidden"}`}
    >
      <dialog
        onClick={(e) => e.stopPropagation()}
        open={isOpen}
        className={`
                    max-w-fit static translate-x-0 translate-y-0 m-0
                    ${additionalStyles ? blockWrapperStyles : "bg-transparent"}
                `}
      >
        {children}
      </dialog>
    </div>,
    document.body,
  );
};

export default Modal;
