import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, tasksApi, activityApi } from '../api';
import { useWebSocket } from '../context/WebSocketContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthBadge } from '../components/common/HealthBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Calendar, User, Users, Activity, Plus, ArrowLeft, CheckCircle } from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscribeToProject } = useWebSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();

    // Subscribe to STOMP live topic updates for this project
    const subscription = subscribeToProject(id, (update) => {
      console.log('Live WebSocket update for project:', update);
      fetchProjectDetails();
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const [projRes, tasksRes, actRes] = await Promise.all([
        projectsApi.getProjectById(id),
        tasksApi.getTasks({ projectId: id }),
        activityApi.getEntityActivities('PROJECT', id),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setActivities(actRes.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Project not found.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-sm text-blue-600 font-bold">
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Project Overview Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{project.name}</h1>
              <HealthBadge health={project.health} />
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{project.description}</p>
          </div>
          <button
            onClick={() => navigate(`/tasks?projectId=${project.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Task to Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Timeline</span>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" /> {project.startDate} to {project.endDate}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Owner</span>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" /> {project.owner?.fullName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Assigned Team</span>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" /> {project.teamName || 'Personal Project'}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <ProgressBar progress={project.progressPercentage} size="lg" />
        </div>
      </div>

      {/* Project Tasks & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Project Tasks ({tasks.length})</h3>
          <div className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No tasks added to this project yet.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm">{task.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>Due: {task.dueDate}</span>
                      {task.assignee && <span>• Assignee: {task.assignee.fullName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Activity Feed
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400">No activity recorded for this project.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{act.user?.fullName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600">{act.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
