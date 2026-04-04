import { Bars3Icon } from "@heroicons/react/24/outline";
import ProgressBar from "./ProgressBar";

const ProjectItem = ({
  id,
  name,
  description,
  startDate,
  endDate,
  budget,
  amountSpent,
}: {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  amountSpent: number;
}) => {

  return (
    <div className="flex flex-col justify-between m-4 p-6 pb-4 w-100 h-52 shadow-lg rounded-3xl border border-border">
      <div>
        <div className="w-full flex justify-between">
          <div className="line-clamp-1 mb-2">
            <h3>{name}</h3>
          </div>
          <div className="flex justify-end">
            btn
            <Bars3Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="line-clamp-2">{description}</div>
      </div>
      <div>
        <div className="mb-0">
          <ProgressBar name={"Budget"}
          progress={calculateBudgetDiff(budget, amountSpent)}
          limit={amountSpent + '/' + budget}
          />
          {/* budget bar */}
        </div>
        <div>
          <ProgressBar
            name={startDate.toLocaleDateString("pl-PL")}
            progress={30}
            limit={endDate.toLocaleDateString("pl-PL")}
          />
          {/* date bar */}
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;

//   obliczanie progressu projektu na podstawie daty
//   trzeba by się zastanowić jak dni oraz długość przekładają się na postęp
//
//   const calculateDateDiff = () => {
//     const diffInMins = endDate.getTime() - startDate.getTime(); 
//     const diffInDays = diffInMins / (1000 * 60 * 60 * 24);
//     if(diffInDays > 28) {
//         const diffInMonths = Math.floor(diffInDays/) 
//     }
//     return Math.ceil(diffInDays);
//   };

const calculateBudgetDiff = (budget:number, amountSpent:number) => {
    return (amountSpent / budget)*100;
} 
