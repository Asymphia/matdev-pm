import ProjectItem from "@/components/project/ProjectItem";


const ProjectsPage = () => {
  return (
    <div>
      {projects.map((project) => (
        <ProjectItem
            key={project.id}
            id = {project.id}
            name = {project.name}
            description={project.description}
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
    startDate: "10.10.2026",
    endDate: "10.20.2026",
    budget: "2000",
  },
  {
    id: "2",
    name: "project 2",
    description: "description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2description of project 2",
    startDate: "10.10.2026",
    endDate: "10.20.2026",
    budget: "2000",
  },
  {
    id: "3",
    name: "project 3project 3project 3project 3",
    description: "description of project 3description of project 3description of project 3description of project 3description of project 3",
    startDate: "10.10.2026",
    endDate: "10.20.2026",
    budget: "2000",
  },
];
