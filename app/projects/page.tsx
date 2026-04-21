"use client";

import ProjectItem from "@/components/project/ProjectItem";
import { DUMMY_PROJECTS_DATA } from "@/lib/data";
import ProjectTopBar from "@/components/project/ProjectTopBar";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/ui/Modal";
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
} from "@heroicons/react/24/outline";
import Link from "next/link";

export type ProjectStatus = "To do" | "In progress" | "Completed";

const ProjectsPage = () => {
  const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(
    null,
  );

  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get("showmodal") === "true";

  const data = currentFilter
    ? DUMMY_PROJECTS_DATA.filter((project) => project.status === currentFilter)
    : DUMMY_PROJECTS_DATA;

  const handleSubmit = async (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());
    console.log("Dane formularza:", rawData);
  };

  const fieldClasses =
    "w-full pl-10 pr-4 py-3 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary appearance-none";
  const iconClasses =
    "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground";

  const FormField = ({
    icon: Icon,
    isSelect,
    children,
  }: {
    icon: any;
    isSelect?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="relative w-full flex items-center">
      <Icon className={iconClasses} />
      {children}
      {isSelect && (
        <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-muted-foreground" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-11 w-full h-full">
      <ProjectTopBar
        current={currentFilter}
        setCurrent={(val) => setCurrentFilter(val)}
      />

      <div className="grid 2xl:grid-cols-4 grid-cols-2 gap-4">
        {data.map((project, index) => (
          <ProjectItem key={index} project={project} />
        ))}
        {isModalOpen && (
          <Modal href="/projects">
            <div className="w-[600px] max-w-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-semibold">Project form</h2>
                <Link
                  href="/projects"
                  className="flex items-center justify-center w-10 h-10 border border-border rounded-full hover:bg-secondary transition-all group"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>

              <form action={handleSubmit} className="flex flex-col gap-4">
                <FormField icon={LinkIcon}>
                  <input
                    name="name"
                    placeholder="Name"
                    className={fieldClasses}
                  />
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
                    <input
                      name="startDate"
                      placeholder="Start date"
                      className={fieldClasses}
                    />
                  </FormField>
                  <FormField icon={CalendarIcon}>
                    <input
                      name="endDate"
                      placeholder="End date"
                      className={fieldClasses}
                    />
                  </FormField>
                </div>

                <FormField icon={BriefcaseIcon} isSelect>
                  <select name="workpackageId" className={fieldClasses}>
                    <option>Select a workpackage</option>
                  </select>
                </FormField>

                <div className="relative">
                  <PencilSquareIcon className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Project description"
                    className="w-full pl-10 pr-4 py-3 bg-transparent border border-border rounded-md resize-none"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="bg-[#2D3748] text-white px-6 py-2 rounded-full hover:bg-[#1a202c] transition-colors flex items-center gap-2"
                  >
                    Add new project <span>+</span>
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
