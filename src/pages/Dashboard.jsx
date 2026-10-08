import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthBadge } from '../components/common/HealthBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const { lastTaskUpdate } = useWebSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [lastTaskUpdate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
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

  if (!stats) return null;

  // Chart Data Transformations
  const statusPieData = [
    { name: 'To Do', value: stats.tasksByStatus?.TODO || 0, color: '#94a3b8' },
    { name: 'In Progress', value: stats.tasksByStatus?.IN_PROGRESS || 0, color: '#3b82f6' },
    { name: 'In Review', value: stats.tasksByStatus?.IN_REVIEW || 0, color: '#f59e0b' },
    { name: 'Done', value: stats.tasksByStatus?.DONE || 0, color: '#10b981' },
  ].filter(item => item.value > 0);

  const priorityBarData = [
    { priority: 'Low', count: stats.tasksByPriority?.LOW || 0 },
    { priority: 'Medium', count: stats.tasksByPriority?.MEDIUM || 0 },
    { priority: 'High', count: stats.tasksByPriority?.HIGH || 0 },
    { priority: 'Critical', count: stats.tasksByPriority?.CRITICAL || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            Personalized Overview
          </span>
          <h1 className="text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Here is your live productivity summary. Track task completion, project health, and upcoming deadlines in real-time.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center shrink-0">
          <p className="text-xs font-medium text-blue-100">Overall Completion Rate</p>
          <p className="text-4xl font-black mt-1">{stats.overallCompletionRate}%</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Tasks</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalTasks}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Completed</p>
            <p className="text-2xl font-black text-slate-900">{stats.completedTasks}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">In Progress</p>
            <p className="text-2xl font-black text-slate-900">{stats.inProgressTasks}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Overdue</p>
            <p className="text-2xl font-black text-rose-600">{stats.overdueTasks}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Due (Next 7 Days)</p>
            <p className="text-2xl font-black text-slate-900">{stats.upcomingDeadlinesCount}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Task Status Distribution
            </h3>
          </div>
          {statusPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">No task status data available</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Priority Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Tasks by Priority
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityBarData}>
                <XAxis dataKey="priority" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Progress & Upcoming Deadlines Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects Progress */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg">Project Progress & Health</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {stats.projectProgressList.length === 0 ? (
              <p className="text-xs text-slate-400">No active projects</p>
            ) : (
              stats.projectProgressList.map((p) => (
                <div key={p.projectId} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                    <HealthBadge health={p.health} />
                  </div>
                  <ProgressBar progress={p.progressPercentage} size="md" />
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{p.completedTasks} / {p.totalTasks} Tasks Done</span>
                    <span>{p.progressPercentage}% Complete</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadline Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg">Upcoming Deadlines (Next 7 Days)</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {stats.upcomingDeadlineTasks.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming task deadlines in the next 7 days.</p>
            ) : (
              stats.upcomingDeadlineTasks.map((task) => (
                <div key={task.id} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.projectName}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
