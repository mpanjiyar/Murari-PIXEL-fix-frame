import re

with open('src/components/ReelsPackModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Tab 1 states replacement:
tab1_start = content.find('{/* TAB 1: CHECKOUT & APPROVAL STATUS */}')
top_strip = content.find('{/* Top Festive Special Offer Header Strip */}')

assert tab1_start != -1 and top_strip != -1

new_tab1_states = """{/* TAB 1: CHECKOUT & APPROVAL STATUS */}
          {activeTab === 'checkout' && (
            <div>
              {/* STATE A: APPROVED — HIGH CONTRAST & CLEAN CONFIRMATION */}
              {orderStatus === 'APPROVED' ? (
                <div className="space-y-6 max-w-lg mx-auto py-6">
                  <div className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl transition-all ${
                    isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-emerald-100/50' : 'bg-emerald-950/40 border-emerald-500/40 text-white'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                      isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      <CheckCircle2 size={36} />
                    </div>
                    <div className="space-y-2">
                      <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isLight ? 'bg-emerald-200/90 text-emerald-950 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        Payment Confirmed
                      </div>
                      <h4 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isLight ? "text-emerald-950" : "text-emerald-400"}`}>
                        Your Payment Has Been Verified and Approved!
                      </h4>
                      <p className={`text-xs sm:text-sm leading-relaxed font-mono ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        Administrator Murari Panjiyar has confirmed and approved your payment request.
                      </p>
                    </div>
                    {orderId && (
                      <div className={`p-3.5 rounded-xl border font-mono text-xs flex items-center justify-between ${
                        isLight ? "bg-white border-slate-300 text-slate-900 shadow-xs" : "bg-black/40 border-white/10 text-white"
                      }`}>
                        <span className={isLight ? "text-slate-600 font-bold" : "text-zinc-400"}>Order Reference:</span>
                        <span className={`font-mono font-black select-all ${isLight ? "text-emerald-900" : "text-emerald-400"}`}>{orderId}</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl border text-center space-y-2.5 ${
                    isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-500/10 border-amber-500/20 text-white'
                  }`}>
                    <p className={`text-xs font-mono font-bold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                      Need to purchase another license or submit payment for another person?
                    </p>
                    <button
                      type="button"
                      onClick={handleStartNewOrder}
                      className="py-2.5 px-5 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md transition-transform active:scale-95 inline-flex items-center gap-2 border border-amber-500/40"
                    >
                      <Zap size={14} className="fill-slate-950" />
                      <span>Make a New Payment / Submit Another Order →</span>
                    </button>
                  </div>
                </div>
              ) : orderStatus === 'PENDING_ADMIN_REVIEW' ? (
                /* STATE B: AWAITING ADMIN APPROVAL — STRICTLY LOCKED WITH REAL-TIME SYNC */
                <div className="space-y-5 max-w-xl mx-auto py-2">
                  <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-5 shadow-2xl transition-all ${
                    isLight ? 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-amber-100/60' : 'bg-[#11121d] border-amber-500/40 text-white'
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg border ${
                      isLight ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-amber-200/50' : 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                    }`}>
                      <Clock size={28} className={`animate-spin ${isLight ? 'text-amber-800' : 'text-amber-400'}`} />
                    </div>
                    <div className="space-y-1.5">
                      <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isLight ? 'bg-amber-200/90 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        Verification in Progress
                      </div>
                      <h4 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isLight ? "text-amber-950" : "text-amber-400"}`}>
                        Payment Submitted • Awaiting Admin Approval
                      </h4>
                      <p className={`text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-mono ${isLight ? "text-slate-700 font-medium" : "text-zinc-300"}`}>
                        Your payment details and 12-digit UTR have been submitted to administrator Murari Panjiyar.
                        Approval is typically completed within 5-15 minutes during business hours.
                      </p>
                    </div>

                    {/* Live Order Metadata Box */}
                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 text-left font-mono text-xs ${
                      isLight ? "bg-white border-amber-300 shadow-sm text-slate-900" : "bg-black/60 border-white/10 text-white"
                    }`}>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Order Reference:</span>
                        <span className={`font-mono font-black select-all ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                          {submittedOrderSummary?.id || orderId}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Customer Name:</span>
                        <span className={`font-bold ${isLight ? "text-slate-950" : "text-white"}`}>
                          {submittedOrderSummary?.customerName || customerName || 'Customer'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Registered Phone:</span>
                        <span className={`font-bold font-mono ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                          {submittedOrderSummary?.customerPhone || customerPhone || '—'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>12-Digit UTR:</span>
                        <span className={`font-mono font-black tracking-wider select-all ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                          {submittedOrderSummary?.utrReference || utrNumber || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Amount Paid:</span>
                        <span className={`font-mono font-black text-sm ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                          ₹{submittedOrderSummary?.amount || storeConfig.productPrice} INR
                        </span>
                      </div>
                    </div>

                    {/* Real-Time Live Status Pulse */}
                    <div className={`pt-1 flex items-center justify-center gap-2 text-xs font-mono font-bold ${
                      isLight ? 'text-amber-950' : 'text-amber-400'
                    }`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span>Live sync active • This screen updates automatically once approved.</span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const activeId = submittedOrderSummary?.id || orderId;
                          if (!activeId) return;
                          fetch(`/api/reels/order-status/${encodeURIComponent(activeId)}`)
                            .then(res => res.json())
                            .then(d => {
                              if (d.success && d.order?.status === 'APPROVED') {
                                setOrderStatus('APPROVED');
                                triggerToast('Your Payment Has Been Verified and Approved!', 'success');
                              } else {
                                triggerToast('Verification in progress. Your order is waiting for admin approval.', 'info');
                              }
                            });
                        }}
                        className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                          isLight
                            ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <RefreshCw size={13} />
                        <span>Check Status Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderStatus('PENDING_PAYMENT')}
                        className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                            : 'bg-transparent border-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        Need to edit details?
                      </button>
                      <button
                        type="button"
                        onClick={handleStartNewOrder}
                        className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                          isLight ? 'text-amber-900 hover:text-amber-950 underline' : 'text-amber-400 hover:underline'
                        }`}
                      >
                        Place Another Order →
                      </button>
                    </div>
                  </div>
                </div>
              ) : orderStatus === 'REJECTED' ? (
                /* STATE C: REJECTED — HIGH CONTRAST & ACTIONABLE */
                <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 max-w-lg mx-auto py-6 shadow-xl ${
                  isLight ? 'bg-red-50 border-red-300 text-slate-900' : 'bg-red-950/40 border-red-500/40 text-white'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
                    isLight ? 'bg-red-100 border-red-300 text-red-700' : 'bg-red-500/20 border-red-500/30 text-red-400'
                  }`}>
                    <XCircle size={30} />
                  </div>
                  <div className="space-y-1.5">
                    <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isLight ? 'bg-red-200/90 text-red-950 border border-red-300' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      Verification Unsuccessful
                    </div>
                    <h3 className={`text-lg sm:text-xl font-bold font-mono ${isLight ? 'text-red-950 font-black' : 'text-white'}`}>
                      Payment Verification Unsuccessful
                    </h3>
                    <p className={`text-xs sm:text-sm font-mono max-w-md mx-auto ${isLight ? 'text-red-900 font-medium' : 'text-red-300'}`}>
                      {rejectionReason || 'The 12-digit UPI reference number could not be reconciled in the merchant statement.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOrderStatus('PENDING_PAYMENT')}
                      className="py-2.5 px-4 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-sm"
                    >
                      Re-enter Details & UTR
                    </button>
                    <button
                      type="button"
                      onClick={handleStartNewOrder}
                      className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      Start Fresh Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('faq')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isLight
                          ? 'border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          : 'border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE D: INITIAL CHECKOUT FORM (Clean, Modern, Fully Responsive Payment UI) */
                <div className="space-y-6">
                  """

content = content[:tab1_start] + new_tab1_states + content[top_strip:]
print("Tab 1 updated in memory.")

# 2. Update Tab 2: Track My Order
t2_start = content.find('{/* TAB 2: TRACK MY ORDER */}')
t3_start = content.find('{/* TAB 3: EXPLORE CATEGORIES */}')
assert t2_start != -1 and t3_start != -1

new_tab2 = """{/* TAB 2: TRACK MY ORDER */}
          {activeTab === 'track' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="text-center space-y-1.5">
                <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  Live Order Tracker
                </div>
                <h4 className={`text-lg sm:text-xl font-black font-mono tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                  Track Your Order Status
                </h4>
                <p className={`text-xs font-mono ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                  Check real-time admin approval status and verify your payment submission across devices.
                </p>
              </div>

              {/* Single Search Field & Button */}
              <form onSubmit={handleLookupOrder} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className={`absolute left-3.5 top-3.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={e => setLookupQuery(e.target.value)}
                      placeholder="Enter Order ID (RP-...) or 10-Digit Mobile"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono outline-none transition-all ${
                        isLight
                          ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm'
                          : 'bg-black/70 border border-white/15 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="py-3 px-5 sm:px-6 rounded-xl font-mono text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0 border border-amber-500/40"
                  >
                    {isLookingUp ? 'Searching...' : 'Track Order'}
                  </button>
                </div>

                {lookupError && (
                  <div className={`p-3.5 rounded-xl text-xs font-mono font-medium border ${
                    isLight ? 'bg-red-50 border-red-300 text-red-950' : 'bg-red-950/60 border-red-500/30 text-red-300'
                  }`}>
                    ⚠️ {lookupError}
                  </div>
                )}
              </form>

              {/* Order Status Display */}
              {lookupResult && (
                <div className={`p-5 rounded-2xl border space-y-4 font-mono text-xs shadow-md transition-all ${
                  isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                }`}>
                  {/* Header: Order ID & Current Status */}
                  <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    <div>
                      <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Order ID</span>
                      <span className={`font-mono font-black text-sm select-all ${isLight ? "text-slate-950" : "text-white"}`}>{lookupResult.id}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase border ${
                      lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                        ? isLight ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                        : lookupResult.status === 'Pending Admin Approval' || lookupResult.internalStatus === 'PENDING_ADMIN_REVIEW'
                        ? isLight ? 'bg-amber-100 text-amber-950 border-amber-300 font-black' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
                        : lookupResult.status === 'Rejected' || lookupResult.internalStatus === 'REJECTED'
                        ? isLight ? 'bg-rose-100 text-rose-950 border-rose-300 font-black' : 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
                        : isLight ? 'bg-slate-100 text-slate-900 border-slate-300 font-black' : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30 font-bold'
                    }`}>
                      {lookupResult.status || 'Pending Admin Approval'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className={`grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  }`}>
                    <div>
                      <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Customer Name:</span>
                      <span className={`font-bold ${isLight ? "text-slate-950" : "text-white"}`}>{lookupResult.customerName || 'Customer'}</span>
                    </div>
                    <div>
                      <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Mobile Number:</span>
                      <span className={`font-bold font-mono ${isLight ? 'text-emerald-900' : 'text-emerald-400'}`}>
                        {lookupResult.customerPhone || 'Registered'}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Tracker */}
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Order Progress Timeline:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] sm:text-[10px]">
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>✓</div>
                        <span className={`font-bold block ${isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'}`}>1. Created</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          lookupResult.utrReference
                            ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-white/5 text-zinc-500 border-white/10'
                        }`}>{lookupResult.utrReference ? '✓' : '2'}</div>
                        <span className={`font-bold block ${
                          lookupResult.utrReference
                            ? isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'
                            : isLight ? 'text-slate-500 font-normal' : 'text-zinc-500'
                        }`}>2. UTR Sent</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isLight ? 'bg-amber-100 text-amber-950 border-amber-400 font-black' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED' ? '✓' : '3'}
                        </div>
                        <span className={`font-bold block ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'
                            : isLight ? 'text-amber-950 font-black' : 'text-amber-400'
                        }`}>3. Review</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'bg-emerald-600 text-white border-emerald-700 font-black' : 'bg-emerald-500 text-black border-emerald-400 font-black'
                            : isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-white/5 text-zinc-500 border-white/10'
                        }`}>
                          {lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED' ? '★' : '4'}
                        </div>
                        <span className={`font-bold block ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'
                            : isLight ? 'text-slate-500 font-normal' : 'text-zinc-500'
                        }`}>4. Approved</span>
                      </div>
                    </div>
                  </div>

                  {/* STATUS CONDITION: Revoked / Refunded */}
                  {(lookupResult.status === 'Refunded' || lookupResult.internalStatus === 'REFUNDED') && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2.5 text-center ${
                      isLight ? 'bg-rose-50 border-rose-300 text-slate-900' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                        isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        <Lock size={18} />
                      </div>
                      <p className={`font-bold text-sm ${isLight ? 'text-rose-950 font-black' : 'text-amber-300'}`}>Access Revoked</p>
                      <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        {lookupResult.rejectionReason || 'Access for this order has been revoked by administrator. Please complete a new purchase to regain access.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleStartNewOrder}
                        className="py-2.5 px-5 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md inline-flex items-center gap-2 border border-amber-500/40"
                      >
                        <Zap size={14} className="fill-slate-950" />
                        <span>Place a New Order →</span>
                      </button>
                    </div>
                  )}

                  {/* STATUS CONDITION 1: Pending Admin Approval */}
                  {(lookupResult.status === 'Pending Admin Approval' || lookupResult.internalStatus === 'PENDING_ADMIN_REVIEW') && (
                    <div className={`p-4 rounded-xl border text-xs text-center space-y-2 ${
                      isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                        isLight ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        <Clock size={18} className="animate-pulse" />
                      </div>
                      <p className={`font-black text-sm ${isLight ? 'text-amber-950 font-black' : 'text-amber-300'}`}>Waiting for Admin Approval</p>
                      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        Your payment has been received and your order is waiting for admin approval from Murari Panjiyar.
                      </p>
                    </div>
                  )}

                  {/* STATUS CONDITION 2: Approved */}
                  {(lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED') && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border text-xs text-center space-y-2 ${
                        isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                          isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-400' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          <CheckCircle2 size={20} />
                        </div>
                        <p className={`font-black text-sm ${isLight ? 'text-emerald-950 font-black' : 'text-white'}`}>
                          Your Payment Has Been Verified and Approved!
                        </p>
                        <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                          Your digital access to the authorized resources has been unlocked.
                        </p>
                      </div>

                      {/* If searched by mobile number alone: Ownership verification requirement */}
                      {lookupResult.requiresOwnershipVerification ? (
                        <form onSubmit={handleVerifyOwnership} className={`p-4 rounded-xl border space-y-2.5 ${
                          isLight ? 'bg-amber-50/70 border-amber-300 text-slate-900' : 'bg-black/60 border-amber-500/40 text-white'
                        }`}>
                          <div className="space-y-1">
                            <label className={`text-xs font-bold block ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                              🔒 Ownership Verification Required
                            </label>
                            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                              To protect customer privacy and access your download, please enter your Order ID:
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={verifyOrderIdInput}
                              onChange={e => setVerifyOrderIdInput(e.target.value)}
                              placeholder="Enter Order ID (e.g. RP-...)"
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none ${
                                isLight
                                  ? 'bg-white border-2 border-slate-300 text-slate-900 focus:border-amber-500'
                                  : 'bg-black border border-white/20 text-white focus:border-amber-500'
                              }`}
                            />
                            <button
                              type="submit"
                              disabled={isVerifyingOwnership || !verifyOrderIdInput.trim()}
                              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono cursor-pointer border border-amber-500/40 shadow-sm"
                            >
                              {isVerifyingOwnership ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Authorized Download Button */
                        <a
                          href={lookupResult.downloadUrl || masterDriveUrl || (lookupResult.id ? `/api/reels/vault-access/${lookupResult.id}` : '#')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 rounded-xl font-mono font-black text-xs uppercase bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Download size={16} />
                          <span>Download Now</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* STATUS CONDITION 3: Rejected */}
                  {(lookupResult.status === 'Rejected' || lookupResult.internalStatus === 'REJECTED') && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 text-center ${
                      isLight ? 'bg-rose-50 border-rose-300 text-slate-900' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                        isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        <XCircle size={18} />
                      </div>
                      <p className={`font-black text-sm ${isLight ? 'text-rose-950' : 'text-white'}`}>Order Not Approved</p>
                      <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        {lookupResult.rejectionReason || 'Your request was not approved by the administrator.'}
                      </p>
                    </div>
                  )}

                  {/* STATUS CONDITION 4: Payment Pending or Verification Failed */}
                  {(lookupResult.status === 'Payment Pending' || lookupResult.status === 'Payment Verification Failed' || lookupResult.internalStatus === 'PENDING_PAYMENT') && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 text-center ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-zinc-800/80 border-white/10 text-zinc-300'
                    }`}>
                      <p className={`font-black text-sm ${isLight ? 'text-slate-950' : 'text-zinc-200'}`}>{lookupResult.status}</p>
                      <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                        Payment verification could not be confirmed. Please check your transaction details or contact support.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('faq')}
                        className={`text-xs font-mono font-bold underline cursor-pointer ${
                          isLight ? 'text-amber-900 hover:text-amber-950' : 'text-amber-400'
                        }`}
                      >
                        Contact Support →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          """

content = content[:t2_start] + new_tab2 + content[t3_start:]
print("Tab 2 updated in memory.")

# 3. Update Tab 3: Explore Categories
t3_start = content.find('{/* TAB 3: EXPLORE CATEGORIES */}')
t4_start = content.find('{/* TAB 4: WHAT\'S INCLUDED */}')
assert t3_start != -1 and t4_start != -1

new_tab3 = """{/* TAB 3: EXPLORE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    Verified Digital Video Categories
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                    All 9 categories are organized in folders inside the Master Google Drive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('checkout')}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-black uppercase bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer shadow-md border border-amber-500/40 shrink-0 self-start sm:self-auto"
                >
                  {orderStatus === 'APPROVED' ? 'View Order Status' : `Unlock All for ₹${Math.round(storeConfig.productPrice)}`}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border space-y-2.5 transition-all shadow-xs hover:shadow-md ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-amber-400'
                        : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                        isLight
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {cat.count}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                        isLight ? 'bg-slate-100 text-slate-700 font-bold border border-slate-200' : 'bg-white/5 text-zinc-400'
                      }`}>
                        {cat.sampleAspect}
                      </span>
                    </div>

                    <h5 className={`text-sm font-bold tracking-tight ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                      {cat.name}
                    </h5>

                    <p className={`text-[11.5px] leading-relaxed ${isLight ? 'text-slate-600 font-normal' : 'text-zinc-400'}`}>
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {cat.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md ${
                            isLight ? 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold' : 'bg-white/5 text-zinc-300'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          """

content = content[:t3_start] + new_tab3 + content[t4_start:]
print("Tab 3 updated in memory.")

# 4. Update Tab 4: What's Included
t4_start = content.find('{/* TAB 4: WHAT\'S INCLUDED */}')
t5_start = content.find('{/* TAB 5: FAQ & SUPPORT */}')
assert t4_start != -1 and t5_start != -1

new_tab4 = """{/* TAB 4: WHAT'S INCLUDED */}
          {activeTab === 'included' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10 text-white'
                }`}>
                  <h5 className={`text-sm font-bold uppercase font-mono flex items-center gap-2 ${
                    isLight ? 'text-amber-800 font-black' : 'text-amber-400'
                  }`}>
                    <CheckCircle2 size={16} />
                    Verified Pack Specifications
                  </h5>
                  <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Total Count:</strong> 150,000+ Raw Short-Form Video Clips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Aspect Ratio:</strong> 9:16 Vertical format (1080x1920 Full HD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Video Format:</strong> H.264 MP4 (Universal CapCut, Premiere, InShot compatibility)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Watermarks:</strong> 100% Watermark-free, logo-free clean footage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Storage Delivery:</strong> High-Speed Master Google Drive Direct Access</span>
                    </li>
                  </ul>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10 text-white'
                }`}>
                  <h5 className={`text-sm font-bold uppercase font-mono flex items-center gap-2 ${
                    isLight ? 'text-emerald-800 font-black' : 'text-emerald-400'
                  }`}>
                    <ShieldCheck size={16} />
                    License & Usage Permissions
                  </h5>
                  <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>Personal and commercial content creation rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>Eligible for monetization on YouTube Shorts, Instagram Reels, and TikTok</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>No attribution required when published</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>Lifetime access with no recurring subscription fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          """

content = content[:t4_start] + new_tab4 + content[t5_start:]
print("Tab 4 updated in memory.")

# 5. Update Tab 5: FAQ & Support (fixing the white text and washed out colors!)
t5_start = content.find('{/* TAB 5: FAQ & SUPPORT */}')
assert t5_start != -1

# Find end of tab 5
end_marker = "</div>\n      </motion.div>\n    </div>\n  );\n};"
end_pos = content.find(end_marker, t5_start)
if end_pos == -1:
    end_pos = content.rfind("</motion.div>")

new_tab5 = """{/* TAB 5: FAQ & SUPPORT */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className={`font-bold text-sm flex items-center gap-2 ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    <HelpCircle size={15} className="text-amber-500 shrink-0" />
                    How does payment verification work?
                  </h5>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600 font-normal' : 'text-zinc-400'}`}>
                    Scan our verified BharatPe UPI QR code and pay ₹{Math.round(storeConfig.productPrice)}. Submit your 10-digit mobile number and 12-digit UTR reference. Administrator Murari Panjiyar matches your UTR against merchant records to approve your order.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className={`font-bold text-sm flex items-center gap-2 ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    <HelpCircle size={15} className="text-amber-500 shrink-0" />
                    How long does approval take?
                  </h5>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600 font-normal' : 'text-zinc-400'}`}>
                    Murari reviews incoming payments promptly, typically within 5 to 30 minutes. Once approved, your order status changes to Approved in real-time across all your devices without refreshing.
                  </p>
                </div>
              </div>

              {/* Direct Support Form (NO Email!) */}
              <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-white/10'
              }`}>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#FF5500]" />
                  <h5 className={`font-bold text-sm ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    Contact Murari Panjiyar for Assistance
                  </h5>
                </div>

                {supportSubmitted ? (
                  <div className={`p-4 rounded-xl border text-xs font-mono font-medium ${
                    isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    ✅ Your inquiry has been received! Murari will reach out to your registered phone number shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={supportName}
                        onChange={e => setSupportName(e.target.value)}
                        placeholder="Your Name *"
                        className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-xs'
                            : 'bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500'
                        }`}
                      />
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={e => setSupportPhone(e.target.value)}
                        placeholder="Your Phone Number"
                        className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-xs'
                            : 'bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500'
                        }`}
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={supportMsg}
                      onChange={e => setSupportMsg(e.target.value)}
                      placeholder="Describe your issue or question regarding your UPI payment or order reference..."
                      className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-xs'
                          : 'bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSendingSupport}
                      className="py-2.5 px-5 rounded-xl font-bold bg-[#FF5500] hover:bg-orange-600 text-white cursor-pointer shadow-md inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{isSendingSupport ? 'Sending...' : 'Send Inquiry to Murari'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
"""

content = content[:t5_start] + new_tab5
with open('src/components/ReelsPackModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ReelsPackModal.tsx written successfully!")
