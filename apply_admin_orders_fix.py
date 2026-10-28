with open('src/components/AdminPurchaseManager.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* Section Title */}"
end_marker = "{/* ORDER REVIEW & DECISION MODAL */}"

s_pos = content.find(start_marker)
e_pos = content.find(end_marker)

assert s_pos != -1 and e_pos != -1

new_section = """{/* Section Title & Real-Time Sync Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className={`text-base sm:text-lg font-black font-mono flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>Puja Offer Orders</span>
            </h3>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border ${
              isLight ? 'bg-amber-100 text-amber-950 border-amber-300 font-black' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              150K+ Reels Mega Pack
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Sync Active (Firestore + SSE)</span>
            </span>
          </div>
          <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Verify UPI payments against BharatPe statements, approve or revoke digital download access, and audit customer records.
          </p>
        </div>

        <div className={`text-xs font-mono font-bold shrink-0 self-start sm:self-auto px-3 py-1.5 rounded-xl border ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-zinc-300'
        }`}>
          {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'} Displayed
        </div>
      </div>

      {/* Mobile Orders Card List (< 768px) — Clean, Flat, No Unwanted Nested Box Clutter */}
      <div className="md:hidden space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className={`p-8 text-center text-xs rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-zinc-900/60 border-white/10 text-zinc-400'}`}>
            No orders found matching your search.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPendingReview = order.status === 'PENDING_ADMIN_REVIEW';
            const isApproved = order.status === 'APPROVED';

            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border transition-all space-y-3.5 font-mono text-xs ${
                  isPendingReview
                    ? isLight
                      ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                      : 'bg-[#15120c] border-amber-500/40 shadow-md shadow-amber-500/5'
                    : isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-zinc-900/80 border-white/10'
                }`}
              >
                {/* Header Row: Order ID & Status Badge */}
                <div className={`flex items-start justify-between gap-2 pb-2.5 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-black text-xs select-all ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {order.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.id, `id-${order.id}`)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          isLight ? 'text-slate-400 hover:text-slate-800' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Copy Order ID"
                      >
                        {copiedKey === `id-${order.id}` ? <Check size={12} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span className={`text-[11px] font-black block mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                      ₹{order.amount} INR
                    </span>
                  </div>
                  <div className="shrink-0">{getStatusBadge(order.status)}</div>
                </div>

                {/* Detail 1: Customer Name */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    <User size={13} className="text-[#FF5500] shrink-0" />
                    <span>Customer Name:</span>
                  </span>
                  <span className={`font-bold text-left sm:text-right break-words ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                    {order.customerName || 'Anonymous Customer'}
                  </span>
                </div>

                {/* Detail 2: Registered Mobile Number (Fully visible verbatim label) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    <Phone size={13} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} />
                    <span>Registered Mobile Number:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className={`font-mono font-bold text-sm select-all hover:underline ${
                        isLight ? 'text-emerald-800' : 'text-emerald-400'
                      }`}
                      title="Tap to call"
                    >
                      {order.customerPhone || 'Not Provided'}
                    </a>
                    {order.customerPhone && (
                      <button
                        type="button"
                        onClick={() => handleCopy(order.customerPhone, `ph-${order.id}`)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          isLight ? 'text-slate-400 hover:text-emerald-700' : 'text-zinc-400 hover:text-emerald-400'
                        }`}
                        title="Copy Registered Mobile Number"
                      >
                        {copiedKey === `ph-${order.id}` ? <Check size={12} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Detail 3: Payment Verification Status & 12-Digit UTR */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    <Tag size={13} className={isLight ? 'text-amber-800' : 'text-amber-400'} />
                    <span>Payment Status:</span>
                  </span>
                  <div className="text-left sm:text-right space-y-0.5">
                    {order.paymentVerifiedAt || order.verificationSource === 'manual_admin' ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <CheckCircle2 size={11} />
                        <span>Verified in BharatPe</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <Clock size={11} />
                        <span>Pending Verification</span>
                      </span>
                    )}
                    {order.utrReference && (
                      <div className="flex items-center gap-1 justify-start sm:justify-end text-[11px] pt-0.5">
                        <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>UTR:</span>
                        <strong className={`select-all font-mono font-black ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                          {order.utrReference}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.utrReference!, `utr-${order.id}`)}
                          className="p-0.5 text-zinc-400 hover:text-amber-400 cursor-pointer"
                          title="Copy UTR"
                        >
                          {copiedKey === `utr-${order.id}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail 4: Order Submission Date & Time */}
                <div className={`flex items-center justify-between text-[11px] pt-1.5 border-t ${isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-zinc-400'}`}>
                  <span className="font-bold">Submission Date:</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
                    {new Date(order.submittedAt || order.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Action Buttons: Clear, Touch-Friendly, Non-Overlapping */}
                <div className={`pt-2.5 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                  {/* Primary Decision Row */}
                  {isPendingReview && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecideOrder('approve', order)}
                        className="py-2.5 px-3 rounded-xl font-mono font-black text-xs uppercase bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecideOrder('reject', order)}
                        className="py-2.5 px-3 rounded-xl font-mono font-bold text-xs uppercase bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <button
                      type="button"
                      onClick={() => handleDecideOrder('revoke', order)}
                      className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                    >
                      <Lock size={13} />
                      <span>Revoke Approval & Lock Access</span>
                    </button>
                  )}

                  {!order.paymentVerifiedAt && order.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleDecideOrder('verify_payment', order)}
                      className={`w-full py-2 px-3 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        isLight ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100' : 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>Verify Payment in BharatPe Statement</span>
                    </button>
                  )}

                  {/* Secondary Management Row */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveReviewOrder(order)}
                      className={`py-2 px-1 rounded-xl border font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                      }`}
                      title="View Details"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(order)}
                      className={`py-2 px-1 rounded-xl border font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                        isLight ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 font-black' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                      title="Edit Purchase"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAuditOrder(order)}
                      className={`py-2 px-1 rounded-xl border font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                      }`}
                      title="Audit History"
                    >
                      <History size={13} />
                      <span>Audit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingOrder(order)}
                      className={`py-2 px-1 rounded-xl border font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                        isLight ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300 font-black' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                      title="Delete Order"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Orders Table (>= 768px) — Clean, Flat, Spacious, Complete Labels */}
      <div className={`hidden md:block rounded-2xl border overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950/80 border-white/10'
      }`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[1040px]">
            <thead className={`text-[11px] font-mono uppercase tracking-wider border-b ${
              isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-zinc-900/90 text-zinc-300 border-white/10'
            }`}>
              <tr>
                <th className="py-3.5 px-4 font-black">Order ID</th>
                <th className="py-3.5 px-4 font-black">Customer Name</th>
                <th className="py-3.5 px-4 font-black whitespace-nowrap">Registered Mobile Number</th>
                <th className="py-3.5 px-4 font-black">Payment Verification Status</th>
                <th className="py-3.5 px-4 font-black">Order Submission Date</th>
                <th className="py-3.5 px-4 font-black">Admin Approval Status</th>
                <th className="py-3.5 px-4 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isPendingReview = order.status === 'PENDING_ADMIN_REVIEW';
                  const isApproved = order.status === 'APPROVED';

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isPendingReview
                          ? isLight ? 'bg-amber-50/70 hover:bg-amber-100/50' : 'bg-amber-950/20 hover:bg-amber-950/30'
                          : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Column 1: Order ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold select-all ${isLight ? "text-slate-900" : "text-white"}`}>
                            {order.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.id, `id-${order.id}`)}
                            className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedKey === `id-${order.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <span className={`text-[11px] font-black block mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                          ₹{order.amount} INR
                        </span>
                      </td>

                      {/* Column 2: Customer Name */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#FF5500] shrink-0" />
                          <span className={`break-words ${isLight ? "text-slate-900" : "text-white"}`}>
                            {order.customerName || 'Anonymous Customer'}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Registered Mobile Number (Fully visible verbatim label and full customer number) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className={`shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                          <a
                            href={`tel:${order.customerPhone}`}
                            className={`font-mono font-bold text-xs select-all hover:underline ${
                              isLight ? "text-emerald-800" : "text-emerald-400"
                            }`}
                            title="Click to dial"
                          >
                            {order.customerPhone || 'Not Provided'}
                          </a>
                          {order.customerPhone && (
                            <button
                              type="button"
                              onClick={() => handleCopy(order.customerPhone, `ph-${order.id}`)}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                isLight ? 'text-slate-400 hover:text-emerald-700' : 'text-zinc-400 hover:text-emerald-400'
                              }`}
                              title="Copy Registered Mobile Number"
                            >
                              {copiedKey === `ph-${order.id}` ? <Check size={12} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Payment Verification Status */}
                      <td className="py-3.5 px-4">
                        {order.paymentVerifiedAt || order.verificationSource === 'manual_admin' ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              <CheckCircle2 size={11} />
                              <span>Verified in BharatPe</span>
                            </span>
                            {order.utrReference && (
                              <div className={`text-[10.5px] font-mono flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                <span>UTR:</span>
                                <strong className={`select-all font-mono font-bold ${isLight ? "text-amber-900" : "text-amber-300"}`}>
                                  {order.utrReference}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(order.utrReference!, `utr-${order.id}`)}
                                  className="p-0.5 text-zinc-400 hover:text-amber-400 cursor-pointer"
                                  title="Copy UTR"
                                >
                                  {copiedKey === `utr-${order.id}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              <Clock size={11} />
                              <span>Pending Verification</span>
                            </span>
                            {order.utrReference ? (
                              <div className={`text-[10.5px] font-mono flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                <span>UTR:</span>
                                <strong className={`select-all font-mono font-bold ${isLight ? "text-amber-900" : "text-amber-300"}`}>
                                  {order.utrReference}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(order.utrReference!, `utr-${order.id}`)}
                                  className="p-0.5 text-zinc-400 hover:text-amber-400 cursor-pointer"
                                  title="Copy UTR"
                                >
                                  {copiedKey === `utr-${order.id}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                </button>
                              </div>
                            ) : (
                              <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>No UTR entered</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Order Submission Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`text-[11px] font-bold font-mono ${isLight ? "text-slate-900" : "text-zinc-200"}`}>
                          {new Date(order.submittedAt || order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                          {new Date(order.submittedAt || order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Column 6: Admin Approval Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Primary Decision Button */}
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleDecideOrder('approve', order)}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase cursor-pointer shadow-sm transition-all"
                              title="Approve Order & Grant Access"
                            >
                              Approve
                            </button>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleDecideOrder('revoke', order)}
                              className="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                              title="Revoke Approval & Invalidate Links"
                            >
                              <Lock size={11} />
                              <span>Revoke</span>
                            </button>
                          )}

                          {(!order.paymentVerifiedAt && order.status !== 'APPROVED') && (
                            <button
                              type="button"
                              onClick={() => handleDecideOrder('verify_payment', order)}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                                isLight
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30'
                              }`}
                              title="Verify Payment in BharatPe statement"
                            >
                              Verify
                            </button>
                          )}

                          {/* Secondary Icon Buttons with Clear Tooltips & Proper Touch Targets */}
                          <button
                            type="button"
                            onClick={() => setActiveReviewOrder(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10"
                            }`}
                            title="View Full Details"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight ? "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 font-black" : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                            title="Edit Purchase Details"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingOrder(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight ? "bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300 font-black" : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}
                            title="Delete Record & Revoke Access"
                          >
                            <Trash2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveAuditOrder(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10"
                            }`}
                            title="View Audit History"
                          >
                            <History size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      """

content = content[:s_pos] + new_section + content[e_pos:]

# Update Review Modal label
content = content.replace(
    '<span className="text-[10px] text-zinc-400 uppercase block">Customer Mobile Phone</span>',
    '<span className="text-[10px] text-zinc-400 uppercase block font-bold">Registered Mobile Number</span>'
)

# Update Delete Modal label
content = content.replace(
    '<span className="text-zinc-500">Mobile:</span>',
    '<span className="text-zinc-500 font-bold">Registered Mobile Number:</span>'
)

with open('src/components/AdminPurchaseManager.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminPurchaseManager.tsx updated successfully!")
