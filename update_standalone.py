with open('src/components/StandaloneReelsOfferPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add isLight definition if not already present
if 'const isLight = ' not in content:
    content = content.replace(
        "const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {",
        "const isLight = currentTheme === 'light';\n\n  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {"
    )

# Replace the approved modal state
old_approved_state_start = content.find("{/* STATE 1: APPROVED STATE (Only unlocked when Murari approves in admin) */}")
next_state_start = content.find(") : orderStatus === 'pending_approval' ? (", old_approved_state_start)

assert old_approved_state_start != -1 and next_state_start != -1

new_approved_state = """{/* STATE 1: APPROVED STATE — HIGH CONTRAST & CLEAN CONFIRMATION (NO LINKS) */}
              {orderStatus === 'approved' ? (
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
                        Administrator Murari Panjiyar has confirmed and approved your ₹{config.productPrice} order.
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
                      onClick={() => {
                        setOrderId('');
                        setCustomerName('');
                        setCustomerPhone('');
                        setSubmittedName('');
                        setSubmittedPhone('');
                        setUtrNumber('');
                        setSubmittedUtr('');
                        setOrderStatus('checkout');
                        setDownloadToken('');
                        setUnlockedDriveLink('');
                        try {
                          localStorage.removeItem('last_reels_order_id');
                        } catch {}
                      }}
                      className="py-2.5 px-5 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md transition-transform active:scale-95 inline-flex items-center gap-2 border border-amber-500/40"
                    >
                      <Zap size={14} className="fill-slate-950" />
                      <span>Make a New Payment / Submit Another Order →</span>
                    </button>
                  </div>
                </div>
              """

content = content[:old_approved_state_start] + new_approved_state + content[next_state_start:]

# Also update the modal title:
content = content.replace(
    "{orderStatus === 'approved' ? 'Access Unlocked — Mega Pack Directory' : orderStatus === 'pending_approval' ? 'Payment Submitted — Pending Review' : 'Payment & Order Verification (₹199)'}",
    "{orderStatus === 'approved' ? 'Payment Verified & Approved' : orderStatus === 'pending_approval' ? 'Payment Submitted — Pending Review' : 'Payment & Order Verification (₹199)'}"
)

with open('src/components/StandaloneReelsOfferPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("StandaloneReelsOfferPage.tsx updated successfully!")
