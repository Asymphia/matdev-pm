import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

interface SearchBarProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
}

const SearchBar = ({ value, onChange, placeholder = "Search..." }: SearchBarProps) => {
    return (
        <label className="bg-background border-border hover:bg-foreground group flex items-center gap-3 rounded-md border border-solid px-3 py-2.5">
            <MagnifyingGlassIcon className="text-text-primary-500 group-hover:text-primary-500 size-6 flex-shrink-0" />
            <input
                type="text"
                value={value}
                onChange={e => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="text-text-primary-300 placeholder:text-text-primary-300 group-hover:text-primary-500 group-hover:placeholder:text-primary-500 focus:outline-0 min-w-0 w-full"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange?.("")}
                    className="text-text-primary-100 hover:text-text-primary-500 text-lg leading-none flex-shrink-0"
                    aria-label="Clear search"
                >
                    ×
                </button>
            )}
        </label>
    )
}

export default SearchBar
