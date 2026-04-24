"use client"

import ProjectItem from "@/components/project/ProjectItem"
import { DUMMY_PROJECTS_DATA } from "@/lib/data"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Modal from "@/components/ui/Modal"
import {
    BellIcon,
    BriefcaseIcon,
    CalendarIcon,
    Cog6ToothIcon,
    ExclamationTriangleIcon,
    HashtagIcon,
    LinkIcon,
    PencilSquareIcon,
    UserIcon,
    ChevronDownIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"

export type ProjectStatus = "To do" | "In progress" | "Completed"

const ProjectsPage = () => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)

    const searchParams = useSearchParams()
    const isModalOpen = searchParams.get("showmodal") === "true"

    const data = currentFilter ? DUMMY_PROJECTS_DATA.filter(project => project.status === currentFilter) : DUMMY_PROJECTS_DATA

    const handleSubmit = async (formData: FormData) => {
        const rawData = Object.fromEntries(formData.entries())
        console.log("Dane formularza:", rawData)
    }

    const fieldClasses = "w-full pl-10 pr-4 py-3 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
    const iconClasses = "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"

    const FormField = ({ icon: Icon, isSelect, children }: { icon: any; isSelect?: boolean; children: React.ReactNode }) => (
        <div className="relative flex w-full items-center">
            <Icon className={iconClasses} />
            {children}
            {isSelect && <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute right-3 h-4 w-4" />}
        </div>
    )

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <ProjectTopBar current={currentFilter} setCurrent={val => setCurrentFilter(val)} />

            <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3">
                {data.map((project, index) => (
                    <ProjectItem key={index} project={project} />
                ))}
                {isModalOpen && (
                    <Modal href="/projects">
                        <div className="w-[600px] max-w-full">
                            <div className="border-border mb-6 flex items-center justify-between border-b pb-4">
                                <h2 className="text-2xl font-semibold">Project form</h2>
                                <Link href="/projects" className="border-border hover:bg-secondary group flex h-10 w-10 items-center justify-center rounded-full border transition-all">
                                    <ArrowLeftIcon className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                                </Link>
                            </div>

                            <form action={handleSubmit} className="flex flex-col gap-4">
                                <FormField icon={LinkIcon}>
                                    <input name="name" placeholder="Name" className={fieldClasses} />
                                </FormField>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField icon={HashtagIcon} isSelect>
                                        <select name="topicId" className={fieldClasses}>
                                            <option>Select a topic</option>
                                        </select>
                                    </FormField>
                                    <FormField icon={Cog6ToothIcon} isSelect>
                                        <select name="statusId" className={fieldClasses}>
                                            <option>Select a status</option>
                                        </select>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField icon={BellIcon} isSelect>
                                        <select name="priorityId" className={fieldClasses}>
                                            <option>Select a priority</option>
                                        </select>
                                    </FormField>
                                    <FormField icon={ExclamationTriangleIcon} isSelect>
                                        <select name="issueTypeId" className={fieldClasses}>
                                            <option>Select a issue type</option>
                                        </select>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField icon={UserIcon} isSelect>
                                        <select name="respPersonId" className={fieldClasses}>
                                            <option>Select responsible person</option>
                                        </select>
                                    </FormField>
                                    <FormField icon={UserIcon} isSelect>
                                        <select name="suppPersonId" className={fieldClasses}>
                                            <option>Select supporting person</option>
                                        </select>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField icon={CalendarIcon}>
                                        <input name="startDate" placeholder="Start date" className={fieldClasses} />
                                    </FormField>
                                    <FormField icon={CalendarIcon}>
                                        <input name="endDate" placeholder="End date" className={fieldClasses} />
                                    </FormField>
                                </div>

                                <FormField icon={BriefcaseIcon} isSelect>
                                    <select name="workpackageId" className={fieldClasses}>
                                        <option>Select a workpackage</option>
                                    </select>
                                </FormField>

                                <div className="relative">
                                    <PencilSquareIcon className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                                    <textarea
                                        name="description"
                                        rows={4}
                                        placeholder="Project description"
                                        className="border-border w-full resize-none rounded-md border bg-transparent py-3 pr-4 pl-10"
                                    />
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button type="submit" className="flex items-center gap-2 rounded-full bg-[#2D3748] px-6 py-2 text-white transition-colors hover:bg-[#1a202c]">
                                        Add new project <span>+</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    )
}

export default ProjectsPage
