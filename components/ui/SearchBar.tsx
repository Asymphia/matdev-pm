import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

const SearchBar = () => {
    return (
        <label className="bg-background border-border hover:bg-foreground group flex items-center gap-3 rounded-md border border-solid px-3 py-2.5">
            <MagnifyingGlassIcon className="text-text-primary-500 group-hover:text-primary-500 size-6" />

            <input
                type="text"
                placeholder="Search..."
                className="text-text-primary-300 placeholder:text-text-primary-300 group-hover:text-primary-500 group-hover:placeholder:text-primary-500 focus:outline-0"
            />
        </label>
    )
}

export default SearchBar
