/* BdREN OpsSync — App entry */

const { useState: useStateApp } = React;

function App() {
  const [route, setRoute] = useStateApp("dashboard");

  const CRUMBS = {
    dashboard:  ["Dashboard"],
    meeting:    ["Request", "Meeting Booking"],
    food:       ["Request", "Food Requisition"],
    logistics:  ["Request", "Logistics & Stock"],
    vehicle:    ["Request", "Vehicle Requisition"],
    conveyance: ["Request", "Conveyance Claim"],
  };

  let Page = null;
  if (route === "dashboard")  Page = <DashboardPage onNav={setRoute} />;
  if (route === "meeting")    Page = <MeetingPage />;
  if (route === "food")       Page = <FoodPage />;
  if (route === "logistics")  Page = <LogisticsPage />;
  if (route === "vehicle")    Page = <VehiclePage />;
  if (route === "conveyance") Page = <ConveyancePage />;

  return (
    <div className="app" data-screen-label={route}>
      <Sidebar current={route} onNav={setRoute} />
      <div className="main">
        <Topbar crumbs={CRUMBS[route] || ["Dashboard"]} />
        {Page}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
