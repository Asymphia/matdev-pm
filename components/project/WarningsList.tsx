import BlockWrapper from "@/components/ui/BlockWrapper"
import Th from "@/components/ui/Th"
import { DUMMY_WARNING_DATA } from "@/lib/data"
import StatusItem from "@/components/ui/StatusItem"
import { EllipsisVerticalIcon, CheckIcon } from "@heroicons/react/24/outline"

const WarningsList = () => {
    return (
        <BlockWrapper className="flex flex-col gap-5">
            <h2>Warnings</h2>

            <table className="w-full border-separate border-spacing-y-4">
                <thead>
                    <tr>
                        <Th>Severity</Th>
                        <Th>Description</Th>
                        <Th>{""}</Th>
                        <Th>Manage</Th>
                    </tr>
                </thead>

                <tbody>
                    {DUMMY_WARNING_DATA.map((data, index) => (
                        <tr key={index} className={!data.isRead ? "font-medium" : "font-normal opacity-70"}>
                            <td>
                                <div className="flex justify-center">
                                    <StatusItem status={data.severity} />
                                </div>
                            </td>
                            <td>{data.description}</td>
                            <td></td>
                            <td className="flex justify-center gap-2">
                                <button className={`group transition ${data.isRead ? "cursor-default opacity-70" : ""}`}>
                                    <CheckIcon className={`text-text-primary-300 size-6 transition ${!data.isRead ? "group-hover:text-primary-700 group-active:text-primary-500" : ""}`} />
                                </button>

                                <button className="group">
                                    <EllipsisVerticalIcon className="text-text-primary-300 group-hover:text-primary-700 group-active:text-primary-500 size-6 transition" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </BlockWrapper>
    )
}

export default WarningsList
