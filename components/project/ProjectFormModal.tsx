"use client"

import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import {
    PROJECT_ISSUE_TYPE_OPTIONS,
    PROJECT_PRIORITY_OPTIONS,
    PROJECT_STATUS_OPTIONS,
    PROJECT_TOPIC_OPTIONS,
    PROJECT_WORKPACKAGE_OPTIONS,
} from "@/lib/data"
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
} from "@heroicons/react/24/outline"

interface ProjectFormModalProps {
    isOpen: boolean
    onClose: () => void
}

const ProjectFormModal = ({ isOpen, onClose }: ProjectFormModalProps) => {
    const handleSubmit = async (formData: FormData) => {
        const rawData = Object.fromEntries(formData.entries())
        console.log("Project form data:", rawData)
        onClose()
    }

    return (
        <FormModalShell isOpen={isOpen} title="Project form" onClose={onClose}>
            <form action={handleSubmit} className="flex flex-col gap-4">
                <FormField icon={LinkIcon}>
                    <input name="name" placeholder="Name" className={formFieldClasses} />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={HashtagIcon} isSelect>
                        <select name="topicId" className={formFieldClasses}>
                            <option value="">Select a topic</option>
                            {PROJECT_TOPIC_OPTIONS.map(topic => (
                                <option key={topic} value={topic}>
                                    {topic}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField icon={Cog6ToothIcon} isSelect>
                        <select name="statusId" className={formFieldClasses}>
                            <option value="">Select a status</option>
                            {PROJECT_STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={BellIcon} isSelect>
                        <select name="priorityId" className={formFieldClasses}>
                            <option value="">Select a priority</option>
                            {PROJECT_PRIORITY_OPTIONS.map(priority => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField icon={ExclamationTriangleIcon} isSelect>
                        <select name="issueTypeId" className={formFieldClasses}>
                            <option value="">Select an issue type</option>
                            {PROJECT_ISSUE_TYPE_OPTIONS.map(issueType => (
                                <option key={issueType} value={issueType}>
                                    {issueType}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={UserIcon}>
                        <input name="respPersonId" placeholder="Responsible person" className={formFieldClasses} />
                    </FormField>
                    <FormField icon={UserIcon}>
                        <input name="suppPersonId" placeholder="Supporting person" className={formFieldClasses} />
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={CalendarIcon}>
                        <input name="startDate" placeholder="Start date" type="date" className={formFieldClasses} />
                    </FormField>
                    <FormField icon={CalendarIcon}>
                        <input name="endDate" placeholder="End date" type="date" className={formFieldClasses} />
                    </FormField>
                </div>

                <FormField icon={BriefcaseIcon} isSelect>
                    <select name="workpackageId" className={formFieldClasses}>
                        <option value="">Select a workpackage</option>
                        {PROJECT_WORKPACKAGE_OPTIONS.map(workpackage => (
                            <option key={workpackage} value={workpackage}>
                                {workpackage}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div className="relative">
                    <PencilSquareIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <textarea
                        name="description"
                        rows={4}
                        placeholder="Project description"
                        className="w-full resize-none rounded-md border border-border bg-transparent py-3 pl-10 pr-4"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 rounded-full bg-[#2D3748] px-6 py-2 text-white transition-colors hover:bg-[#1a202c]">
                        Add new project <span>+</span>
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default ProjectFormModal
