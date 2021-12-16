import './taskmanager.scss';
const TaskManager = () => {
  return (
    <>
      <div className="container">
        <iframe className="responsive-iframe" src="api/status"></iframe>
      </div>
    </>
  );
};
export default TaskManager;
