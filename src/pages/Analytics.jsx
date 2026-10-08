import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CalendarCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsApi.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error(err);
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

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Productivity Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          In-depth performance metrics, completion timelines, and tasks requiring urgent attention.
        </p>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>On-Time Completion</span>
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{data.onTimeCompletionRate}%</p>
          <p className="text-[11px] text-slate-400">Completed prior to or on due date</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Late Completion Rate</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600">{data.lateCompletionRate}%</p>
          <p className="text-[11px] text-slate-400">Completed past due deadline</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Avg Completion Time</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{data.averageCompletionTimeDays} Days</p>
          <p className="text-[11px] text-slate-400">Average time from creation to DONE</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Most Productive Day</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{data.mostProductiveDay}</p>
          <p className="text-[11px] text-slate-400">Highest task resolution frequency</p>
        </div>
      </div>

      {/* Weekly Completion Trend Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" /> Weekly Task Velocity (Created vs Completed)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.weeklyCompletionTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="weekLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="completedCount" name="Completed Tasks" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="createdCount" name="Created Tasks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks Needing Attention */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-900 text-lg">Tasks Needing Attention</h3>
        </div>
        <p className="text-xs text-slate-500">Overdue tasks or high/critical priority items not yet started.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.tasksNeedingAttention.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">All high priority tasks and deadlines are under control!</td>
                </tr>
              ) : (
                data.tasksNeedingAttention.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.title}</td>
                    <td className="py-3 px-4 text-slate-600">{t.projectName}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-4 font-semibold text-rose-600">{t.dueDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
