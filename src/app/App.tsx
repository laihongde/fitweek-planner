import Guard from "../features/auth/Guard";
import PlannerPage from "../pages/PlannerPage";

export default function App() {
  return (
    <Guard>
      <PlannerPage />
    </Guard>
  );
}
