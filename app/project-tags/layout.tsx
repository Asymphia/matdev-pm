import { ReactNode } from "react";

const TagsLayout = ({children} : Readonly<{children:ReactNode}>) => {
return (
    <div className="grid gap-11">
    <h1>Project Tags</h1>
    <div className="flex-1 h-full">{children}</div>
    </div>
)
}

export default TagsLayout