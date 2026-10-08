import React, { useState, useEffect } from 'react';
import { teamsApi, usersApi } from '../api';
import { Modal } from '../components/common/Modal';
import { Users, Plus, UserPlus, Shield, User, Trash2 } from 'lucide-react';

export const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Team Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamError, setTeamError] = useState('');

  // Add Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        teamsApi.getTeams(),
        usersApi.getAllUsers(),
      ]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setTeamError('');
    try {
      await teamsApi.createTeam({ name, description });
      setIsTeamModalOpen(false);
      setName('');
      setDescription('');
      fetchTeams();
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      await teamsApi.addMember(selectedTeamId, { email: memberEmail, role: memberRole });
      setIsMemberModalOpen(false);
      setMemberEmail('');
      fetchTeams();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add team member');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (window.confirm('Remove this user from the team?')) {
      try {
        await teamsApi.removeMember(teamId, userId);
        fetchTeams();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Teams & Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build cross-functional teams, assign roles, and manage project accessibility.
          </p>
        </div>
        <button
          onClick={() => setIsTeamModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Create New Team
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {teams.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Teams Created</h3>
            <p className="text-xs text-slate-400">Create a team to start collaborating with team members.</p>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{team.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{team.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setIsMemberModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Invite Member
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Team Members ({team.members?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {team.members?.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs">
                          {m.user?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{m.user?.fullName}</p>
                          <p className="text-[11px] text-slate-400">{m.user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            m.role === 'LEAD'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {m.role === 'LEAD' ? '👑 Lead' : 'Member'}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(team.id, m.user.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Create New Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {teamError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {teamError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Core Engineering Team"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Responsibilities and purpose of this team..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md"
            >
              Create Team
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Invite Member to Team"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {memberError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {memberError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">User Email Address</label>
            <input
              type="email"
              required
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jane.smith@taskflow.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Team Role</label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="MEMBER">Standard Team Member</option>
              <option value="LEAD">Team Lead</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
