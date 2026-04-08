import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

const SearchBar = () => {
    return (
        <label className="bg-background border border-solid border-border px-3 py-2.5 rounded-md flex items-center gap-3 hover:bg-foreground group">
            <MagnifyingGlassIcon className="size-6 text-text-primary-500 group-hover:text-primary-500" />

            <input
                type="text"
                placeholder="Search..."
                className="text-text-primary-300 placeholder:text-text-primary-300 focus:outline-0 group-hover:text-primary-500 group-hover:placeholder:text-primary-500"
            />
        </label>
    )
}

export default SearchBar