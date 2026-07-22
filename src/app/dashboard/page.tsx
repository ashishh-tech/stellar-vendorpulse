'use client';

import React, { useState } from 'react';
import { useVendors, useRegisterVendor, useSubmitReview, useUpdateVendorStatus } from '@/features/contracts/hooks/useVendors';
import { VendorDTO } from '@/features/contracts/types';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { formatScore, truncateAddress, formatTimestamp, getExplorerUrl } from '@/lib/utils';
import {
  Users,
  Award,
  AlertTriangle,
  Plus,
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Shield,
  Loader2,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, setModalOpen } = useWallet();
  const { data: vendors = [], isLoading, refetch } = useVendors();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedVendorForReview, setSelectedVendorForReview] = useState<VendorDTO | null>(null);

  // Form states
  const [regName, setRegName] = useState('');
  const [regCat, setRegCat] = useState('Logistics');
  const [regEmail, setRegEmail] = useState('');

  const [delScore, setDelScore] = useState(80);
  const [qualScore, setQualScore] = useState(85);
  const [payScore, setPayScore] = useState(75);
  const [commScore, setCommScore] = useState(90);
  const [reviewComment, setReviewComment] = useState('');

  const registerMutation = useRegisterVendor();
  const reviewMutation = useSubmitReview();
  const statusMutation = useUpdateVendorStatus();

  // Filters logic
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // KPI Computations
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === 'Active').length;
  const avgSystemScore = Math.round(
    vendors.reduce((acc, v) => acc + (v.avg_score || 0), 0) / (totalVendors || 1)
  );

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setModalOpen(true);
      return;
    }
    try {
      await registerMutation.mutateAsync({
        name: regName,
        category: regCat,
        contactEmail: regEmail,
      });
      setIsRegisterOpen(false);
      setRegName('');
      setRegEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForReview) return;
    if (!isConnected) {
      setModalOpen(true);
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        vendorId: selectedVendorForReview.id,
        deliveryScore: delScore,
        qualityScore: qualScore,
        paymentScore: payScore,
        communicationScore: commScore,
        comment: reviewComment,
      });
      setIsReviewOpen(false);
      setReviewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Vendor Performance Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time supplier metrics backed by Soroban smart contract authorization
          </p>
        </div>

        <button
          onClick={() => {
            if (!isConnected) setModalOpen(true);
            else setIsRegisterOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-orange-500 hover:from-indigo-500 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vendor</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Registered Vendors</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalVendors}</span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Compliance Rate</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {totalVendors ? Math.round((activeVendors / totalVendors) * 100) : 0}%
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Ecosystem Quality Rating</span>
            <span className="text-3xl font-black text-orange-400 mt-1 block">{avgSystemScore}/100</span>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Logistics & Shipping">Logistics & Shipping</option>
            <option value="Hardware & Hardware">Hardware & Components</option>
            <option value="Packaging & Containers">Packaging & Containers</option>
            <option value="IT & Cloud Infrastructure">IT & Cloud</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="Suspended">Suspended</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-400">Loading vendors from Soroban ledger...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No Vendors Found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or register a new vendor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVendors.map((vendor) => {
            const scoreInfo = formatScore(vendor.avg_score);

            return (
              <div
                key={vendor.id}
                className="glass-card rounded-2xl p-6 border border-slate-800 glass-card-hover space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{vendor.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                          vendor.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : vendor.status === 'Probation'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-400 font-medium mt-1">{vendor.category}</p>
                  </div>

                  <div className="text-right">
                    <span className={`text-2xl font-black ${scoreInfo.colorClass}`}>{scoreInfo.text}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {vendor.review_count} {vendor.review_count === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-xs space-y-1.5 font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <span className="text-slate-200">{vendor.contact_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On-Chain Owner:</span>
                    <span className="text-slate-200">{truncateAddress(vendor.owner, 6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registered:</span>
                    <span>{formatTimestamp(vendor.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedVendorForReview(vendor);
                      setIsReviewOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Submit Score Review</span>
                  </button>

                  <select
                    value={vendor.status}
                    onChange={(e) =>
                      statusMutation.mutate({ vendorId: vendor.id, status: e.target.value })
                    }
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Active">Set Active</option>
                    <option value="Probation">Set Probation</option>
                    <option value="Suspended">Set Suspended</option>
                    <option value="Deactivated">Deactivate</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Vendor Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Register New Vendor on Soroban</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Orion Global Supply"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                <select
                  value={regCat}
                  onChange={(e) => setRegCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Logistics & Shipping">Logistics & Shipping</option>
                  <option value="Hardware & Hardware">Hardware & Components</option>
                  <option value="Packaging & Containers">Packaging & Containers</option>
                  <option value="IT & Cloud Infrastructure">IT & Cloud Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                  {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Sign & Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Review Modal */}
      {isReviewOpen && selectedVendorForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Evaluate {selectedVendorForReview.name}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Submits multi-axis review to ReviewSystem contract & updates VendorRegistry score via inter-contract call.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Delivery Timeliness (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={delScore}
                    onChange={(e) => setDelScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Product Quality (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={qualScore}
                    onChange={(e) => setQualScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Payment Terms (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={payScore}
                    onChange={(e) => setPayScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Communication (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commScore}
                    onChange={(e) => setCommScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Review Notes / SLA Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide details regarding delivery performance, product quality, or invoice resolution..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                  {reviewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit & Trigger Inter-Contract Call</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
