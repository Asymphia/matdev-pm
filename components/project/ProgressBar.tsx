
const ProgressBar = ({name, progress, limit} : {name : string, progress : number, limit : string}) => {
    return (
        <div className="w-full">
            <div className="flex justify-between"><div>{name}</div>{limit}</div>
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <div className={`h-2 transition-all duration-500 ease-out ${progress<100 ? "bg-primary-500" : "bg-error"}`} style={{ width: `${progress}%` }}>

                </div>
            </div>
        </div>
    )
}

export default ProgressBar;