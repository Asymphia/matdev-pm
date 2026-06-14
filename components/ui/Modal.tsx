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
    else if (href === "none") onClick?.();
    else router.push(href);
  };

  const blockWrapperStyles =
    "bg-background rounded-md border border-solid border-border p-6 shadow-sm flex max-h-[calc(100vh-2rem)] w-full max-w-fit flex-col overflow-hidden sm:p-9";

  return createPortal(
    <div
      onClick={onDismiss}
      className={`fixed inset-0 z-20 overflow-y-auto bg-black/50 p-4 ${!isOpen && "hidden"}`}
    >
      <div className="flex min-h-full items-center justify-center">
        <dialog
          onClick={(e) => e.stopPropagation()}
          open={isOpen}
          className={`
                    static m-0 max-w-fit translate-x-0 translate-y-0
                    ${additionalStyles ? blockWrapperStyles : "bg-transparent"}
                `}
        >
          {children}
        </dialog>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
