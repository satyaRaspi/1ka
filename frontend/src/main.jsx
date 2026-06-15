import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '/api';
const SCHEMES = ['Gruha Jyothi', 'Gruha Lakshmi', 'Anna Bhagya', 'Yuva Nidhi', 'Shakti Scheme'];
const STATUSES = ['Draft', 'Registered', 'Under Review', 'Returned for Correction', 'Approved', 'Rejected', 'On Hold'];
const DISTRICTS = ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Kalaburagi', 'Dakshina Kannada', 'Dharwad', 'Shivamogga', 'Tumakuru', 'Ballari'];
const STATES = ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Telangana', 'Kerala', 'Maharashtra', 'Goa'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated', 'Prefer not to say'];
const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other dependent family member'];

function digitsOnly(value, maxLen) { return String(value || '').replace(/\D/g, '').slice(0, maxLen || 99); }
function calculateAgeFromDob(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : '';
}
function validateApplicantForm(f) {
  if (!f.applicant_name?.trim()) return 'Full name is required';
  if (!GENDERS.includes(f.gender)) return 'Please select gender from the dropdown';
  if (!f.dob) return 'Date of birth is required';
  if (f.mobile && (!/^\d{10}$/.test(f.mobile))) return 'Mobile number must be exactly 10 digits';
  if (f.alternate_mobile && (!/^\d{10}$/.test(f.alternate_mobile))) return 'Alternate mobile number must be exactly 10 digits';
  if (f.aadhaar && (!/^\d{12}$/.test(f.aadhaar))) return 'Aadhaar number must be exactly 12 digits';
  if (f.aadhaar_linked_mobile && (!/^\d{10}$/.test(f.aadhaar_linked_mobile))) return 'Aadhaar-linked mobile must be exactly 10 digits';
  if (f.email && !f.email.includes('@')) return 'Email must contain @';
  if (f.marital_status && !MARITAL_STATUSES.includes(f.marital_status)) return 'Please select marital status from the dropdown';
  return '';
}
function validateFamilyForm(f) {
  if (!f.full_name?.trim()) return 'Family member full name is required';
  if (f.gender && !GENDERS.includes(f.gender)) return 'Please select family member gender from the dropdown';
  if (f.mobile && !/^\d{10}$/.test(f.mobile)) return 'Family member mobile must be exactly 10 digits';
  if (f.aadhaar && !/^\d{12}$/.test(f.aadhaar)) return 'Family member Aadhaar must be exactly 12 digits';
  if (f.marital_status && !MARITAL_STATUSES.includes(f.marital_status)) return 'Please select family member marital status from the dropdown';
  return '';
}
function validateAddressForm(f) {
  if (!DISTRICTS.includes(f.district)) return 'Please select district from the dropdown';
  if (!STATES.includes(f.state)) return 'Please select state from the dropdown';
  if (f.pincode && !/^\d{6}$/.test(f.pincode)) return 'PIN code must be exactly 6 digits';
  return '';
}

function token() { return localStorage.getItem('kgs_token'); }
function role() { return localStorage.getItem('kgs_role'); }
function saveSession(data) { localStorage.setItem('kgs_token', data.token); localStorage.setItem('kgs_role', data.role); localStorage.setItem('kgs_user', JSON.stringify(data.user || {})); }
function clearSession() { localStorage.removeItem('kgs_token'); localStorage.removeItem('kgs_role'); localStorage.removeItem('kgs_user'); }

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const err = await res.json(); msg = err.detail || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

function App() {
  if (window.location.pathname.startsWith('/public/enrollment-statistics')) return <PublicStats />;
  const [sessionRole, setSessionRole] = useState(role());
  const [notice, setNotice] = useState('');
  const logout = async () => { try { await api('/auth/logout', { method: 'POST' }); } catch {} clearSession(); setSessionRole(null); };
  if (!sessionRole) return <Login onLogin={(data) => { saveSession(data); setSessionRole(data.role); }} />;
  return <Shell role={sessionRole} logout={logout} notice={notice} setNotice={setNotice} />;
}

function Shell({ role, logout, notice, setNotice }) {
  return <>
    <header className="topbar">
      <div className="brandSeal">ಕರ್ನಾಟಕ</div>
      <div>
        <h1>Karnataka Guarantee Schemes Registration Portal</h1>
        <p>Unified Citizen & Family Registration System</p>
      </div>
      <div className="topActions"><a href="/public/enrollment-statistics" target="_blank">Public Statistics</a><button onClick={logout}>Logout</button></div>
    </header>
    {notice && <div className="toast" onClick={() => setNotice('')}>{notice}</div>}
    {role === 'admin' && <Admin setNotice={setNotice} />}
    {role === 'citizen' && <Citizen setNotice={setNotice} />}
    {role === 'callcenter' && <CallCenter setNotice={setNotice} />}
  </>;
}

function Login({ onLogin }) {
  const [tab, setTab] = useState('citizen');
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  async function doCitizenLogin(e) {
    e.preventDefault(); setError('');
    try { const data = await api('/auth/citizen/otp/verify', { method: 'POST', body: JSON.stringify({ mobile, otp }) }); onLogin(data); }
    catch (err) { setError(err.message); }
  }
  async function doPasswordLogin(e) {
    e.preventDefault(); setError('');
    try {
      const path = tab === 'admin' ? '/auth/admin/login' : '/auth/callcenter/login';
      const data = await api(path, { method: 'POST', body: JSON.stringify({ username, password }) }); onLogin(data);
    } catch (err) { setError(err.message); }
  }
  async function requestOtp() {
    try { const data = await api('/auth/citizen/otp/request', { method: 'POST', body: JSON.stringify({ mobile }) }); setOtpMsg(`Demo OTP: ${data.demo_otp}`); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { if (tab === 'admin') { setUsername('admin'); setPassword('admin123'); } if (tab === 'callcenter') { setUsername('callcenter'); setPassword('call123'); } }, [tab]);
  return <div className="landing">
    <section className="hero">
      <div className="brandSeal big">ಕರ್ನಾಟಕ</div>
      <h1>Karnataka Guarantee Schemes Registration Portal</h1>
      <p>A mobile-first registration portal prototype for Gruha Jyothi, Gruha Lakshmi, Anna Bhagya, Yuva Nidhi and Shakti Scheme.</p>
      <div className="schemePills">{SCHEMES.map(s => <span key={s}>{s}</span>)}</div>
      <a className="publicLink" href="/public/enrollment-statistics">View Public Enrollment Statistics</a>
    </section>
    <section className="loginCard">
      <div className="tabs"><button className={tab==='citizen'?'active':''} onClick={()=>setTab('citizen')}>Citizen</button><button className={tab==='admin'?'active':''} onClick={()=>setTab('admin')}>Admin</button><button className={tab==='callcenter'?'active':''} onClick={()=>setTab('callcenter')}>Call Center</button></div>
      {error && <div className="error">{error}</div>}
      {tab === 'citizen' ? <form onSubmit={doCitizenLogin}>
        <label>Mobile Number<input value={mobile} onChange={e=>setMobile(e.target.value)} maxLength="10" /></label>
        <label>OTP<input value={otp} onChange={e=>setOtp(e.target.value)} /></label>
        {otpMsg && <p className="hint">{otpMsg}</p>}
        <button type="button" className="secondary" onClick={requestOtp}>Request OTP</button>
        <button>Login as Citizen</button>
      </form> : <form onSubmit={doPasswordLogin}>
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <button>Login</button>
      </form>}
      <div className="credentials"><b>Demo:</b> admin/admin123, callcenter/call123, citizen OTP 123456</div>
    </section>
  </div>;
}

function Admin({ setNotice }) {
  const [view, setView] = useState('dashboard');
  return <main className="appGrid">
    <aside className="sidebar">
      {['dashboard','applications','analytics','reports','compliance','audit','master'].map(v => <button key={v} className={view===v?'active':''} onClick={()=>setView(v)}>{title(v)}</button>)}
    </aside>
    <section className="content">
      {view === 'dashboard' && <AdminDashboard />}
      {view === 'applications' && <ApplicationsPanel mode="admin" setNotice={setNotice} />}
      {view === 'analytics' && <AdminDashboard analytics />}
      {view === 'reports' && <Reports />}
      {view === 'compliance' && <Compliance />}
      {view === 'audit' && <AuditLogs />}
      {view === 'master' && <MasterData />}
    </section>
  </main>;
}

function AdminDashboard({ analytics=false }) {
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/dashboard').then(setData).catch(console.error); }, []);
  if (!data) return <Loading />;
  const s = data.summary;
  return <>
    <h2>{analytics ? 'Admin Analytics' : 'Admin Dashboard'}</h2>
    <div className="cards">
      <Metric label="Total Registrations" value={s.total_registrations} />
      <Metric label="Family Members" value={s.family_members} />
      <Metric label="Call Center Comments" value={s.comments} />
      <Metric label="Pending SLA" value={s.pending_sla} />
      <Metric label="Privacy Requests" value={s.open_privacy_requests} />
      <Metric label="Open Grievances" value={s.open_grievances} />
    </div>
    <div className="chartGrid">
      <Chart title="Status Distribution" rows={data.by_status} />
      <Chart title="Scheme-wise Enrollment" rows={data.by_scheme} />
      <Chart title="District-wise Enrollment" rows={data.by_district} />
      <Chart title="Gender-wise Applicants" rows={data.by_gender} />
      <Chart title="Daily Registration Trend" rows={data.trend} />
    </div>
  </>;
}

function ApplicationsPanel({ mode, setNotice }) {
  const [apps, setApps] = useState([]);
  const [filters, setFilters] = useState({ q:'', status:'', district:'', scheme:'' });
  const [selected, setSelected] = useState(null);
  async function load() {
    const params = new URLSearchParams(Object.entries(filters).filter(([_,v])=>v));
    const data = await api(`/applications?${params}`); setApps(data.applications);
  }
  async function runBatchAadhaar() {
    try {
      const data = await api('/admin/batch/aadhaar-verification', { method: 'POST' });
      setNotice(`${data.processed_count} registered application(s) moved to Under Review after batch Aadhaar verification`);
      await load();
    } catch (e) { setNotice(e.message); }
  }
  useEffect(() => { load().catch(err=>setNotice(err.message)); }, []);
  return <>
    <h2>{mode === 'admin' ? 'Application Management' : 'Citizen Application View'}</h2>
    <div className="filters">
      <input placeholder="Search name, mobile, app no, Aadhaar last 4" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})} />
      <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">All Statuses</option>{STATUSES.map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.district} onChange={e=>setFilters({...filters,district:e.target.value})}><option value="">All Districts</option>{DISTRICTS.map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.scheme} onChange={e=>setFilters({...filters,scheme:e.target.value})}><option value="">All Schemes</option>{SCHEMES.map(x=><option key={x}>{x}</option>)}</select>
      <button onClick={load}>Search</button>
      {mode === 'admin' && <button className="secondary" onClick={runBatchAadhaar}>Run Batch Aadhaar Verification</button>}
      {mode === 'admin' && <a className="buttonLike" href={`${API}/admin/reports/registration-summary?fmt=csv`} target="_blank">Export CSV</a>}
    </div>
    <div className="tableWrap">
      <table><thead><tr><th>Application</th><th>Name</th><th>Mobile</th><th>District</th><th>Schemes</th><th>Status</th><th>Aadhaar</th><th>Action</th></tr></thead>
      <tbody>{apps.map(a => <tr key={a.id}><td data-label="Application">{a.application_no}</td><td data-label="Name">{a.applicant_name || '-'}</td><td data-label="Mobile">{a.mobile}</td><td data-label="District">{a.district}</td><td data-label="Schemes">{(a.schemes||[]).join(', ')}</td><td data-label="Status"><span className="status">{a.status}</span></td><td data-label="Aadhaar">{a.aadhaar_masked}</td><td><button onClick={()=>setSelected(a.id)}>Open</button></td></tr>)}</tbody></table>
    </div>
    {selected && <ApplicationModal id={selected} mode={mode} close={()=>{setSelected(null);load();}} setNotice={setNotice} />}
  </>;
}

function ApplicationModal({ id, mode, close, setNotice }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('Under Review');
  const [remarks, setRemarks] = useState('');
  const [comment, setComment] = useState('');
  async function load(include=0) { const res = await api(`/applications/${id}?include_sensitive=${include}&reason=Admin%20review`); setData(res.application); }
  useEffect(() => { load().catch(e=>setNotice(e.message)); }, [id]);
  async function saveStatus() { await api(`/admin/applications/${id}/status`, { method:'POST', body: JSON.stringify({ status, remarks }) }); setNotice('Status updated'); load(); }
  async function saveComment() { await api(`/applications/${id}/comments`, { method:'POST', body: JSON.stringify({ comment_text: comment }) }); setComment(''); setNotice('Comment added'); load(); }
  if (!data) return <div className="modal"><div className="modalCard"><Loading /></div></div>;
  return <div className="modal"><div className="modalCard wide">
    <div className="modalHeader"><h3>{data.application_no} — {data.applicant_name}</h3><button onClick={close}>Close</button></div>
    <div className="detailGrid">
      <Info label="Mobile" value={data.mobile} /><Info label="Status" value={data.status} /><Info label="Gender" value={data.gender} /><Info label="Aadhaar" value={data.aadhaar_masked} /><Info label="Bank" value={data.account_number_masked} />
      <Info label="District" value={data.address?.district} /><Info label="Taluk" value={data.address?.taluk} /><Info label="Address" value={`${data.address?.house_no||''} ${data.address?.street||''} ${data.address?.village_city||''}`} />
    </div>
    <h4>Schemes, Eligibility and Approval Status</h4>
    <div className="schemeStatusGrid">{(data.scheme_selections||[]).map(s=><SchemeStatusCard key={s.id} scheme={s} applicationId={id} mode={mode} reload={load} setNotice={setNotice} />)}</div>
    <h4>Family Members</h4>{(data.family_members||[]).map(f=><div key={f.id} className="miniCard"><b>{f.full_name}</b> — {f.relationship} — {f.aadhaar_masked}</div>)}
    {mode === 'admin' && <div className="actionBox"><h4>Admin Status Action</h4><select value={status} onChange={e=>setStatus(e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><input placeholder="Remarks" value={remarks} onChange={e=>setRemarks(e.target.value)} /><button onClick={saveStatus}>Update Status</button><button className="secondary" onClick={()=>load(1)}>View Sensitive Data</button></div>}
    <div className="actionBox"><h4>Comments</h4><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add call center/admin comment" /><button onClick={saveComment}>Add Comment</button>{(data.comments||[]).map(c=><p className="comment" key={c.id}><b>{c.created_role}</b> {c.created_at}<br/>{c.comment_text}</p>)}</div>
    <h4>Status History</h4>{(data.status_history||[]).map(h=><p className="comment" key={h.id}>{h.previous_status || '-'} → <b>{h.new_status}</b> by {h.changed_by} on {h.changed_at}</p>)}
  </div></div>;
}

function SchemeStatusCard({ scheme, applicationId, mode, reload, setNotice }) {
  const [eligibility, setEligibility] = useState(scheme.eligibility_status || 'Eligibility Under Review');
  const [approval, setApproval] = useState(scheme.approval_status || 'Pending Scheme Approval');
  const [reason, setReason] = useState(scheme.eligibility_reason || '');
  async function save() {
    try {
      await api(`/admin/applications/${applicationId}/schemes/${encodeURIComponent(scheme.scheme_name)}/status`, {
        method: 'POST',
        body: JSON.stringify({ eligibility_status: eligibility, approval_status: approval, eligibility_reason: reason })
      });
      setNotice('Scheme eligibility and approval status updated');
      await reload();
    } catch (e) { setNotice(e.message); }
  }
  return <div className="schemeStatusCard">
    <div className="schemeStatusHead"><h3>{scheme.scheme_name}</h3><span className={`approvalBadge ${String(approval).toLowerCase().replaceAll(' ','-')}`}>{approval}</span></div>
    <p><b>Eligibility:</b> {scheme.eligibility_status || 'Pending'}</p>
    <p><b>Reason:</b> {scheme.eligibility_reason || 'Awaiting scheme review'}</p>
    {mode === 'admin' && <div className="schemeAdminControls">
      <select value={eligibility} onChange={e=>setEligibility(e.target.value)}><option>Eligibility Under Review</option><option>Eligible</option><option>Not Eligible</option><option>Correction Required</option><option>On Hold</option></select>
      <select value={approval} onChange={e=>setApproval(e.target.value)}><option>Pending Scheme Approval</option><option>Approved</option><option>Rejected</option><option>On Hold</option></select>
      <input placeholder="Eligibility / approval remarks" value={reason} onChange={e=>setReason(e.target.value)} />
      <button onClick={save}>Save Scheme Status</button>
    </div>}
  </div>;
}

function Reports() {
  const reports = ['registration-summary','scheme-wise-enrollment','district-wise-enrollment','citizen-application-status','family-member','aadhaar-duplicate-check','pending-review','approved-applications','rejected-applications','call-center-comments','daily-enrollment','monthly-enrollment','sla-aging','admin-action-audit','privacy-request','grievance','sensitive-data-access'];
  return <><h2>Reports</h2><div className="reportGrid">{reports.map(r=><div className="reportCard" key={r}><h3>{title(r)}</h3><p>Generated with masked Aadhaar and bank details by default.</p><a href={`${API}/admin/reports/${r}?fmt=json`} target="_blank">JSON</a><a href={`${API}/admin/reports/${r}?fmt=csv`} target="_blank">CSV</a><a href={`${API}/admin/reports/${r}?fmt=excel`} target="_blank">Excel</a><a href={`${API}/admin/reports/${r}?fmt=pdf`} target="_blank">PDF/Text</a></div>)}</div></>;
}

function Compliance() {
  const [data, setData] = useState(null);
  useEffect(()=>{ api('/admin/compliance').then(setData).catch(console.error); }, []);
  if (!data) return <Loading />;
  return <><h2>Compliance Dashboard</h2><div className="cards">{Object.entries(data.compliance).map(([k,v])=><Metric key={k} label={title(k)} value={v} />)}</div></>;
}
function AuditLogs() { const [rows,setRows]=useState([]); useEffect(()=>{api('/admin/audit-logs').then(d=>setRows(d.audit_logs))},[]); return <><h2>Audit Logs</h2><div className="tableWrap"><table><thead><tr><th>Time</th><th>Role</th><th>Action</th><th>Record</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.created_at}</td><td>{r.role}</td><td>{r.action}</td><td>{r.record_type} {r.record_id}</td></tr>)}</tbody></table></div></>; }
function MasterData() { const [data,setData]=useState(null); useEffect(()=>{api('/admin/master-data').then(setData)},[]); if(!data)return <Loading/>; return <><h2>Settings / Master Data</h2><h3>Schemes</h3><div className="schemePills">{data.schemes.map(s=><span key={s}>{s}</span>)}</div><h3>Retention Policy</h3>{data.retention_policy.map(r=><div className="miniCard" key={r.id}><b>{r.data_category}</b>: {r.retention_period}</div>)}<h3>Data Field Registry</h3>{data.data_field_registry.map(r=><div className="miniCard" key={r.id}><b>{r.field_name}</b>: {r.purpose} — Mask: {r.masking_rule}</div>)}</>; }

function Citizen({ setNotice }) {
  const [appData, setAppData] = useState(null);
  async function load() { const d = await api('/citizen/application'); setAppData(d.application); }
  async function createApp() { const d = await api('/citizen/application', { method: 'POST' }); setAppData(d.application); }
  useEffect(()=>{load().catch(e=>setNotice(e.message));},[]);
  if (appData === null) return <main className="citizenHome"><h2>Welcome</h2><p>No application found for this mobile number.</p><button onClick={createApp}>Start Registration</button></main>;
  return <main className="citizenHome"><CitizenDashboard appData={appData} reload={load} setNotice={setNotice} /></main>;
}

function CitizenDashboard({ appData, reload, setNotice }) {
  const [step, setStep] = useState('dashboard');
  return <>
    {step === 'dashboard' && <section><h2>Citizen Dashboard</h2><div className="cards"><Metric label="Application Number" value={appData.application_no} /><Metric label="Status" value={appData.status} /><Metric label="Selected Schemes" value={(appData.scheme_selections||[]).length} /><Metric label="Family Members" value={(appData.family_members||[]).length} /></div><div className="actions"><button onClick={()=>setStep('wizard')}>{['Draft','Returned for Correction'].includes(appData.status) ? 'Continue / Edit Registration' : 'View Registration'}</button><button className="secondary" onClick={()=>setStep('status')}>View Status & Eligibility</button><a className="buttonLike" href={`${API}/citizen/application/acknowledgement`} target="_blank">Download Acknowledgement</a><button className="secondary" onClick={()=>setStep('privacy')}>My Data & Privacy Rights</button></div></section>}
    {step === 'wizard' && <RegistrationWizard appData={appData} reload={reload} setNotice={setNotice} back={()=>setStep('dashboard')} />}
    {step === 'status' && <CitizenStatusPage back={()=>setStep('dashboard')} setNotice={setNotice} />}
    {step === 'privacy' && <PrivacyRights appData={appData} back={()=>setStep('dashboard')} setNotice={setNotice} />}
  </>;
}

function CitizenStatusPage({ back, setNotice }) {
  const [data, setData] = useState(null);
  useEffect(()=>{ api('/citizen/status').then(setData).catch(e=>setNotice(e.message)); }, []);
  if (!data) return <Loading />;
  if (!data.application) return <div className="formCard"><button className="secondary" onClick={back}>Back</button><h2>Status</h2><p>No application found.</p></div>;
  const app = data.application;
  return <div className="formCard statusPage">
    <button className="secondary" onClick={back}>Back</button>
    <h2>Application Status & Scheme Eligibility</h2>
    <div className="statusHero"><div><span>Application Number</span><strong>{app.application_no}</strong></div><div><span>Current Status</span><strong>{app.status}</strong></div><div><span>Aadhaar Batch Verification</span><strong>{app.aadhaar_verification_status || 'Not Started'}</strong></div></div>
    <h3>Workflow</h3>
    <div className="stageTimeline">{(data.workflow||[]).map((w,i)=><div className="timelineItem" key={w.step}><b>{i+1}</b><div><h4>{w.step}</h4><span>{w.status}</span><p>{w.description}</p></div></div>)}</div>
    <h3>Scheme-wise Approval and Eligibility</h3>
    <div className="schemeStatusGrid">{(app.scheme_selections||[]).map(s=><div className="schemeStatusCard citizen" key={s.id}><div className="schemeStatusHead"><h3>{s.scheme_name}</h3><span className={`approvalBadge ${String(s.approval_status).toLowerCase().replaceAll(' ','-')}`}>{s.approval_status}</span></div><p><b>Eligibility:</b> {s.eligibility_status}</p><p>{s.eligibility_reason || 'Eligibility decision is pending.'}</p></div>)}</div>
  </div>;
}

function RegistrationWizard({ appData, reload, setNotice, back }) {
  const [page,setPage]=useState(0);
  const steps=['Privacy','Applicant','Address','Family','Schemes','Review'];
  return <section><div className="wizardTop"><button className="secondary" onClick={back}>Back</button><div className="progress">{steps.map((s,i)=><span className={i===page?'active':''} key={s}>{i+1}. {s}</span>)}</div></div>
    {page===0 && <PrivacyStep next={()=>setPage(1)} />}
    {page===1 && <ApplicantStep appData={appData} next={async()=>{await reload();setPage(2)}} setNotice={setNotice} />}
    {page===2 && <AddressStep appData={appData} next={async()=>{await reload();setPage(3)}} setNotice={setNotice} />}
    {page===3 && <FamilyStep appData={appData} reload={reload} next={()=>setPage(4)} setNotice={setNotice} />}
    {page===4 && <SchemeStep appData={appData} next={async()=>{await reload();setPage(5)}} setNotice={setNotice} />}
    {page===5 && <ReviewStep appData={appData} reload={reload} setNotice={setNotice} back={back} />}
  </section>;
}
function PrivacyStep({ next }) { return <div className="formCard"><h2>Privacy Notice and Consent Intimation</h2><p>This prototype collects citizen and family details for scheme registration, eligibility assessment, audit, grievance handling and aggregated reporting. Aadhaar verification is simulated; real eKYC is not enabled.</p><p className="disclaimer">Public statistics are aggregated and do not expose personal information.</p><button onClick={next}>I Understand, Continue</button></div>; }
function ApplicantStep({ appData, next, setNotice }) {
  const [f,setF]=useState({ applicant_name: appData.applicant_name||'', gender: appData.gender||'', dob: appData.dob||'', age: appData.age||'', mobile: appData.mobile||'', alternate_mobile: appData.alternate_mobile||'', email: appData.email||'', aadhaar: '', aadhaar_name: appData.aadhaar_name||'', aadhaar_linked_mobile: appData.aadhaar_linked_mobile||'', ration_card: appData.ration_card||'', voter_id: appData.voter_id||'', caste_category: appData.caste_category||'', marital_status: appData.marital_status||'', occupation: appData.occupation||'', annual_income: appData.annual_income||'', bank_holder_name: appData.bank_holder_name||'', bank_name: appData.bank_name||'', branch_name: appData.branch_name||'', ifsc: appData.ifsc||'', account_number: '' });
  function update(k,v){
    const nextF={...f,[k]:v};
    if(k==='dob') nextF.age = calculateAgeFromDob(v);
    setF(nextF);
  }
  async function save(){
    const err = validateApplicantForm(f);
    if (err) { setNotice(err); return; }
    try{ await api('/citizen/application/applicant',{method:'PUT',body:JSON.stringify({...f, age:Number(f.age)||0})}); setNotice('Applicant details saved'); next(); }catch(e){setNotice(e.message)}
  }
  return <div className="formCard"><h2>Primary Applicant Details</h2><div className="formGrid">
    <Field label="Full Name" value={f.applicant_name} onChange={v=>update('applicant_name',v)} required />
    <Field label="Gender" type="select" value={f.gender} onChange={v=>update('gender',v)} options={GENDERS} required />
    <Field label="Date of Birth" type="date" value={f.dob} onChange={v=>update('dob',v)} required />
    <Field label="Age" value={f.age} onChange={()=>{}} readOnly hint="Auto-calculated from DOB" />
    <Field label="Mobile" value={f.mobile} onChange={v=>update('mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" required />
    <Field label="Alternate Mobile" value={f.alternate_mobile} onChange={v=>update('alternate_mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" />
    <Field label="Email" type="email" value={f.email} onChange={v=>update('email',v)} placeholder="name@example.com" />
    <Field label="Aadhaar Number" value={f.aadhaar} onChange={v=>update('aadhaar',digitsOnly(v,12))} inputMode="numeric" maxLength="12" placeholder={appData.aadhaar_masked || '12 digit Aadhaar'} required />
    <Field label="Aadhaar Name" value={f.aadhaar_name} onChange={v=>update('aadhaar_name',v)} />
    <Field label="Aadhaar-linked Mobile" value={f.aadhaar_linked_mobile} onChange={v=>update('aadhaar_linked_mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" />
    <Field label="Ration Card" value={f.ration_card} onChange={v=>update('ration_card',v)} />
    <Field label="Voter ID" value={f.voter_id} onChange={v=>update('voter_id',v)} />
    <Field label="Caste / Category" value={f.caste_category} onChange={v=>update('caste_category',v)} />
    <Field label="Marital Status" type="select" value={f.marital_status} onChange={v=>update('marital_status',v)} options={MARITAL_STATUSES} />
    <Field label="Occupation" value={f.occupation} onChange={v=>update('occupation',v)} />
    <Field label="Annual Income" value={f.annual_income} onChange={v=>update('annual_income',v)} inputMode="numeric" />
    <Field label="Bank Holder Name" value={f.bank_holder_name} onChange={v=>update('bank_holder_name',v)} />
    <Field label="Bank Name" value={f.bank_name} onChange={v=>update('bank_name',v)} />
    <Field label="Branch" value={f.branch_name} onChange={v=>update('branch_name',v)} />
    <Field label="IFSC" value={f.ifsc} onChange={v=>update('ifsc',v.toUpperCase())} />
    <Field label="Bank Account Number" value={f.account_number} onChange={v=>update('account_number',digitsOnly(v,18))} inputMode="numeric" />
  </div><button onClick={save}>Save and Continue</button></div>;
}
function AddressStep({ appData, next, setNotice }) {
  const a=appData.address||{};
  const [f,setF]=useState({ house_no:a.house_no||'', street:a.street||'', ward_no:a.ward_no||'', village_city:a.village_city||'', local_body:a.local_body||'', taluk:a.taluk||'', district:a.district||'', state:a.state||'Karnataka', pincode:a.pincode||'', landmark:a.landmark||'', same_as_aadhaar:a.same_as_aadhaar||'', residence_type:a.residence_type||'', electricity_consumer_no:a.electricity_consumer_no||'', lpg_ration_shop:a.lpg_ration_shop||'' });
  function update(k,v){ setF({...f,[k]:v}); }
  async function save(){
    const err = validateAddressForm(f);
    if (err) { setNotice(err); return; }
    try{await api('/citizen/application/address',{method:'PUT',body:JSON.stringify(f)});setNotice('Address saved');next();}catch(e){setNotice(e.message)}
  }
  return <div className="formCard"><h2>Present Address</h2><div className="formGrid">
    <Field label="House / Building" value={f.house_no} onChange={v=>update('house_no',v)} />
    <Field label="Street / Locality" value={f.street} onChange={v=>update('street',v)} />
    <Field label="Ward No" value={f.ward_no} onChange={v=>update('ward_no',v)} />
    <Field label="Village / Town / City" value={f.village_city} onChange={v=>update('village_city',v)} />
    <Field label="Gram Panchayat / Municipality" value={f.local_body} onChange={v=>update('local_body',v)} />
    <Field label="Taluk" value={f.taluk} onChange={v=>update('taluk',v)} />
    <Field label="District" type="select" value={f.district} onChange={v=>update('district',v)} options={DISTRICTS} required />
    <Field label="State" type="select" value={f.state || 'Karnataka'} onChange={v=>update('state',v)} options={STATES} required />
    <Field label="PIN Code" value={f.pincode} onChange={v=>update('pincode',digitsOnly(v,6))} inputMode="numeric" maxLength="6" />
    <Field label="Landmark" value={f.landmark} onChange={v=>update('landmark',v)} />
    <Field label="Same as Aadhaar Address?" type="select" value={f.same_as_aadhaar} onChange={v=>update('same_as_aadhaar',v)} options={['Yes','No']} />
    <Field label="Residence Type" type="select" value={f.residence_type} onChange={v=>update('residence_type',v)} options={['Own','Rented','Government Quarters','Other']} />
    <Field label="Electricity Consumer No" value={f.electricity_consumer_no} onChange={v=>update('electricity_consumer_no',v)} />
    <Field label="LPG / Ration Shop" value={f.lpg_ration_shop} onChange={v=>update('lpg_ration_shop',v)} />
  </div><button onClick={save}>Save and Continue</button></div>;
}
function Field({ label, value, onChange, type='text', options=[], required=false, readOnly=false, hint='', ...props }) {
  return <label>{label}{required && ' *'}
    {type==='select' ? <select value={value??''} onChange={e=>onChange(e.target.value)} disabled={readOnly}><option value="">Select {label}</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select> : <input type={type} value={value??''} readOnly={readOnly} onChange={e=>onChange(e.target.value)} {...props}/>} 
    {hint && <small>{hint}</small>}
  </label>;
}
function FamilyStep({ appData, reload, next, setNotice }) {
  const blank={full_name:'',relationship:'',gender:'',dob:'',age:'',aadhaar:'',mobile:'',occupation:'',education_status:'',marital_status:'',dependent:'',gov_benefit:'',scheme_eligibility:'',remarks:'',is_minor:0,guardian_declaration:0};
  const [f,setF]=useState(blank);
  function update(k,v){
    const nextF={...f,[k]:v};
    if(k==='dob') {
      const age = calculateAgeFromDob(v);
      nextF.age = age;
      nextF.is_minor = age !== '' && Number(age) < 18 ? 1 : 0;
    }
    setF(nextF);
  }
  async function add(){
    const err = validateFamilyForm(f);
    if (err) { setNotice(err); return; }
    try{await api('/citizen/application/family',{method:'POST',body:JSON.stringify({...f, age:Number(f.age)||0})});setF(blank);setNotice('Family member added');await reload();}catch(e){setNotice(e.message)}
  }
  return <div className="formCard"><h2>Immediate Family Details</h2><div className="listCards">{(appData.family_members||[]).map(m=><div className="miniCard" key={m.id}><b>{m.full_name}</b> — {m.relationship} — {m.aadhaar_masked}</div>)}</div><div className="formGrid">
    <Field label="Full Name" value={f.full_name} onChange={v=>update('full_name',v)} required />
    <Field label="Relationship" type="select" value={f.relationship} onChange={v=>update('relationship',v)} options={RELATIONSHIPS} />
    <Field label="Gender" type="select" value={f.gender} onChange={v=>update('gender',v)} options={GENDERS} />
    <Field label="Date of Birth" type="date" value={f.dob} onChange={v=>update('dob',v)} />
    <Field label="Age" value={f.age} onChange={()=>{}} readOnly hint="Auto-calculated from DOB" />
    <Field label="Aadhaar" value={f.aadhaar} onChange={v=>update('aadhaar',digitsOnly(v,12))} inputMode="numeric" maxLength="12" />
    <Field label="Mobile" value={f.mobile} onChange={v=>update('mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" />
    <Field label="Marital Status" type="select" value={f.marital_status} onChange={v=>update('marital_status',v)} options={MARITAL_STATUSES} />
    <Field label="Occupation" value={f.occupation} onChange={v=>update('occupation',v)} />
    <Field label="Education" value={f.education_status} onChange={v=>update('education_status',v)} />
    <Field label="Dependent?" type="select" value={f.dependent} onChange={v=>update('dependent',v)} options={['Yes','No']} />
    <Field label="Already receiving benefit?" type="select" value={f.gov_benefit} onChange={v=>update('gov_benefit',v)} options={['Yes','No']} />
  </div>{Number(f.age) < 18 && f.age !== '' && <label className="check"><input type="checkbox" checked={!!f.guardian_declaration} onChange={e=>update('guardian_declaration', e.target.checked ? 1 : 0)} /> Parent/guardian declaration confirmed for minor family member</label>}<button onClick={add}>Add Family Member</button><button className="secondary" onClick={next}>Continue</button></div>;
}
function SchemeStep({ appData, next, setNotice }) { const initial={}; (appData.scheme_selections||[]).forEach(s=>initial[s.scheme_name]=s.details||{}); const [selected,setSelected]=useState(initial); function toggle(s){ const n={...selected}; if(n[s]) delete n[s]; else n[s]={}; setSelected(n);} function setDetail(s,k,v){ setSelected({...selected,[s]:{...(selected[s]||{}),[k]:v}}); } async function save(){try{await api('/citizen/application/schemes',{method:'PUT',body:JSON.stringify({schemes:selected})});setNotice('Scheme selections saved');next();}catch(e){setNotice(e.message)}} return <div className="formCard"><h2>Scheme Selection</h2><div className="schemeCards">{SCHEMES.map(s=><div className={`schemeCard ${selected[s]?'selected':''}`} key={s} onClick={()=>toggle(s)}><h3>{s}</h3><p>{selected[s]?'Selected':'Tap to select'}</p>{selected[s] && <input onClick={e=>e.stopPropagation()} placeholder="Eligibility detail / reference number" value={selected[s].reference||''} onChange={e=>setDetail(s,'reference',e.target.value)} />}</div>)}</div><button onClick={save}>Save and Continue</button></div>; }
function ReviewStep({ appData, reload, setNotice, back }) { async function submit(){try{await api('/citizen/application/submit',{method:'POST'});setNotice('Application registered');await reload();back();}catch(e){setNotice(e.message)}} return <div className="formCard"><h2>Review and Submit</h2><p><b>Applicant:</b> {appData.applicant_name}</p><p><b>Aadhaar:</b> {appData.aadhaar_masked}</p><p><b>Address:</b> {appData.address?.district}, {appData.address?.taluk}</p><p><b>Schemes:</b> {(appData.scheme_selections||[]).map(s=>s.scheme_name).join(', ')}</p><label className="check"><input type="checkbox" checked readOnly /> I confirm the information is true and consent to its use for eligibility assessment and registration.</label><button onClick={submit}>Register Application</button></div>; }
function PrivacyRights({ appData, back, setNotice }) { const [type,setType]=useState('Correction'); const [desc,setDesc]=useState(''); async function submitPrivacy(){try{await api('/citizen/privacy-request',{method:'POST',body:JSON.stringify({application_id:appData.id,request_type:type,description:desc})});setNotice('Privacy request submitted');setDesc('');}catch(e){setNotice(e.message)}} async function submitGrievance(){try{await api('/citizen/grievance',{method:'POST',body:JSON.stringify({application_id:appData.id,category:type,description:desc})});setNotice('Grievance submitted');setDesc('');}catch(e){setNotice(e.message)}} return <div className="formCard"><button className="secondary" onClick={back}>Back</button><h2>My Data & Privacy Rights</h2><p>Application: {appData.application_no}. Aadhaar is stored and displayed in masked form in this prototype.</p><select value={type} onChange={e=>setType(e.target.value)}><option>Correction</option><option>Update</option><option>Grievance</option><option>Deletion request where legally permitted</option></select><textarea placeholder="Describe your request" value={desc} onChange={e=>setDesc(e.target.value)} /><button onClick={submitPrivacy}>Submit Privacy Request</button><button className="secondary" onClick={submitGrievance}>Submit Grievance</button></div>; }

function CallCenter({ setNotice }) { return <main className="appGrid single"><section className="content"><ApplicationsPanel mode="callcenter" setNotice={setNotice}/></section></main>; }

function PublicStats() {
  const [data,setData]=useState(null); const [district,setDistrict]=useState(''); const [scheme,setScheme]=useState('');
  async function load(){ const p=new URLSearchParams(Object.entries({district,scheme}).filter(([_,v])=>v)); const d=await api(`/public/enrollment-statistics?${p}`); setData(d); }
  useEffect(()=>{load();},[]);
  if(!data) return <Loading/>;
  const total = Number(data.summary.total_registrations || 0);
  const approved = Number(data.summary.approved || 0);
  const review = Number(data.summary.under_review || 0);
  const registered = Number(data.summary.registered || 0);
  const approvalRate = total ? Math.round((approved/total)*100) : 0;
  return <>
    <header className="publicHero">
      <nav><div className="brandSeal">ಕರ್ನಾಟಕ</div><div><h1>Karnataka Guarantee Schemes</h1><p>Public Enrollment Statistics</p></div><a href="/">Portal Login</a></nav>
      <section className="publicHeroBody">
        <div><span className="eyebrow">Aggregated public dashboard</span><h2>Transparent enrollment view for Karnataka’s 5 Guarantee Schemes</h2><p>No personal citizen information, Aadhaar details, mobile numbers, addresses, or bank details are displayed. Last updated: {data.last_updated}</p></div>
        <div className="heroStat"><small>Overall Approval Rate</small><strong>{approvalRate}%</strong><span>{approved} approved of {total} registrations</span></div>
      </section>
    </header>
    <main className="publicModern">
      <section className="filterPanel"><div><b>Explore Statistics</b><p>Filter by district or scheme</p></div><select value={district} onChange={e=>setDistrict(e.target.value)}><option value="">All Districts</option>{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select><select value={scheme} onChange={e=>setScheme(e.target.value)}><option value="">All Schemes</option>{SCHEMES.map(s=><option key={s}>{s}</option>)}</select><button onClick={load}>Apply Filters</button></section>
      <section className="kpiRibbon"><Metric label="Total Registrations" value={total} /><Metric label="Registered" value={registered} /><Metric label="Under Review" value={review} /><Metric label="Approved" value={approved} /><Metric label="Rejected" value={data.summary.rejected} /></section>
      <section className="publicDashboardGrid"><div className="spotlightPanel"><h3>Scheme Enrollment Share</h3><p>Scheme-wise count of applications received.</p><Chart title="" rows={data.scheme_wise}/></div><div className="spotlightPanel"><h3>District Coverage</h3><p>District-wise participation across the portal.</p><Chart title="" rows={data.district_wise}/></div><div className="spotlightPanel"><h3>Application Pipeline</h3><p>Registered applications move to batch Aadhaar verification and then eligibility review.</p><Chart title="" rows={data.status}/></div><div className="spotlightPanel"><h3>Daily Trend</h3><p>Registrations over time.</p><Chart title="" rows={data.trend}/></div></section>
      <section className="publicFooterNote"><b>Privacy note:</b> {data.disclaimer} Small-count suppression should be increased for production deployment where re-identification risk exists.</section>
    </main>
  </>;
}

function Metric({ label, value }) { return <div className="metric"><span>{label}</span><strong>{value}</strong></div>; }
function Chart({ title, rows=[] }) { const max = Math.max(1,...rows.map(r=>Number(r.value)||0)); return <div className="chart"><h3>{title}</h3>{rows.length===0 && <p>No data</p>}{rows.map((r,i)=><div className="barRow" key={i}><span>{r.label || 'Not specified'}</span><div><b style={{width:`${((Number(r.value)||0)/max)*100}%`}}></b></div><em>{r.value}</em></div>)}</div>; }
function Info({ label, value }) { return <div className="info"><span>{label}</span><b>{value || '-'}</b></div>; }
function Loading(){ return <div className="loading">Loading…</div>; }
function title(x){ return x.replace(/[-_]/g,' ').replace(/\b\w/g, m=>m.toUpperCase()); }

createRoot(document.getElementById('root')).render(<App />);
