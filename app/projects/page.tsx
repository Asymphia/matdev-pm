import ProjectItem from "@/components/project/ProjectItem";

const ProjectsPage = () => {
  return (
    <div className="flec flex-col gap-4">
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          id={project.id}
          name={project.name}
          description={project.description}
          startDate={new Date(project.startDate)}
          endDate={new Date(project.endDate)}
          budget={project.budget}
          amountSpent={project.amountSpent}
        />
      ))}
    </div>
  );
};

export default ProjectsPage;

const projects = [
  {
    id: "1",
    name: "project 1",
    description: "description of project 1",
    startDate: "2026.10.10",
    endDate: "2026.10.20",
    amountSpent: 100,
    budget: 2000,
  },
  {
    id: "2",
    name: "project 2",
    description:
      "description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2",
    startDate: "2026.10.10",
    endDate: "2026.10.20",
    amountSpent: 1000,
    budget: 2000,
  },
  {
    id: "3",
    name: "project 3project 3project 3project 3",
    description:
      "description of project 3description of project 3description of project 3description of project 3description of project 3",
    startDate: "2026.10.10",
    endDate: "2026.10.20",
    amountSpent: 2500,
    budget: 2000,
  },
];
