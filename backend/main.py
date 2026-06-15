from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, Response, FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import sqlite3
import os
import json
import hashlib
import secrets
import csv
import io
import zipfile
import html

APP_NAME = "Karnataka Guarantee Schemes Registration Portal"
DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "guarantee_portal.db"))
OTP_DEMO = os.getenv("DEMO_OTP", "123456")

app = FastAPI(title=APP_NAME, version="1.1.2")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCHEMES = ["Gruha Jyothi", "Gruha Lakshmi", "Anna Bhagya", "Yuva Nidhi", "Shakti Scheme"]
STATUSES = ["Draft", "Registered", "Under Review", "Returned for Correction", "Approved", "Rejected", "On Hold"]
DISTRICTS = [
    "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Belagavi", "Kalaburagi",
    "Dakshina Kannada", "Dharwad", "Shivamogga", "Tumakuru", "Ballari"
]
STATES = ["Karnataka", "Andhra Pradesh", "Tamil Nadu", "Telangana", "Kerala", "Maharashtra", "Goa"]
GENDERS = ["Male", "Female", "Other", "Prefer not to say"]
MARITAL_STATUSES = ["Single", "Married", "Widowed", "Divorced", "Separated", "Prefer not to say"]
CONSENT_TEXT = (
    "I confirm that the information provided by me is true to the best of my knowledge. "
    "I consent to the use of my personal and family details for eligibility assessment and "
    "registration under the Government of Karnataka Guarantee Schemes."
)
PRIVACY_NOTICE = {
    "version": "1.0",
    "title": "Privacy Notice and Consent Intimation",
    "summary": "This prototype collects citizen and family details for scheme registration, eligibility assessment, audit, grievance handling and aggregated reporting. Aadhaar verification is simulated and real eKYC is not enabled.",
    "consent_text": CONSENT_TEXT,
    "prototype_disclaimer": "This is a prototype system for demonstration purposes. Real Aadhaar verification, government database integration, and benefit approval workflows are not enabled in this version.",
}

# -----------------------------
# DB helpers
# -----------------------------

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def now_iso():
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def hash_password(password: str) -> str:
    salt = os.getenv("PASSWORD_SALT", "prototype-salt-change-me")
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def row_to_dict(row):
    return dict(row) if row else None


def mask_aadhaar(value: Optional[str]) -> str:
    if not value:
        return ""
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if len(digits) < 4:
        return "XXXX-XXXX-XXXX"
    return f"XXXX-XXXX-{digits[-4:]}"


def mask_bank(value: Optional[str]) -> str:
    if not value:
        return ""
    v = str(value)
    return "X" * max(0, len(v) - 4) + v[-4:]


def generate_application_no() -> str:
    return "KGS" + datetime.utcnow().strftime("%Y%m%d") + secrets.token_hex(3).upper()


def audit(conn, user_id: Optional[int], role: str, action: str, record_type: str = "", record_id: str = "", metadata: Optional[dict] = None):
    conn.execute(
        "INSERT INTO audit_logs(user_id, role, action, record_type, record_id, metadata, created_at) VALUES(?,?,?,?,?,?,?)",
        (user_id, role, action, record_type, str(record_id or ""), json.dumps(metadata or {}), now_iso()),
    )


def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript(
        """
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS sessions(
            token TEXT PRIMARY KEY,
            user_id INTEGER,
            role TEXT NOT NULL,
            mobile TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS applications(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_no TEXT UNIQUE NOT NULL,
            citizen_mobile TEXT NOT NULL,
            applicant_name TEXT DEFAULT '',
            gender TEXT DEFAULT '',
            dob TEXT DEFAULT '',
            age INTEGER DEFAULT 0,
            mobile TEXT DEFAULT '',
            alternate_mobile TEXT DEFAULT '',
            email TEXT DEFAULT '',
            aadhaar TEXT DEFAULT '',
            aadhaar_name TEXT DEFAULT '',
            aadhaar_linked_mobile TEXT DEFAULT '',
            ration_card TEXT DEFAULT '',
            voter_id TEXT DEFAULT '',
            caste_category TEXT DEFAULT '',
            marital_status TEXT DEFAULT '',
            occupation TEXT DEFAULT '',
            annual_income TEXT DEFAULT '',
            bank_holder_name TEXT DEFAULT '',
            bank_name TEXT DEFAULT '',
            branch_name TEXT DEFAULT '',
            ifsc TEXT DEFAULT '',
            account_number TEXT DEFAULT '',
            status TEXT DEFAULT 'Draft',
            consent_accepted INTEGER DEFAULT 0,
            consent_version TEXT DEFAULT '1.0',
            consent_text TEXT DEFAULT '',
            submitted_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS addresses(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER UNIQUE NOT NULL,
            house_no TEXT DEFAULT '',
            street TEXT DEFAULT '',
            ward_no TEXT DEFAULT '',
            village_city TEXT DEFAULT '',
            local_body TEXT DEFAULT '',
            taluk TEXT DEFAULT '',
            district TEXT DEFAULT '',
            state TEXT DEFAULT 'Karnataka',
            pincode TEXT DEFAULT '',
            landmark TEXT DEFAULT '',
            same_as_aadhaar TEXT DEFAULT '',
            residence_type TEXT DEFAULT '',
            electricity_consumer_no TEXT DEFAULT '',
            lpg_ration_shop TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(application_id) REFERENCES applications(id)
        );
        CREATE TABLE IF NOT EXISTS family_members(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            relationship TEXT DEFAULT '',
            gender TEXT DEFAULT '',
            dob TEXT DEFAULT '',
            age INTEGER DEFAULT 0,
            aadhaar TEXT DEFAULT '',
            mobile TEXT DEFAULT '',
            occupation TEXT DEFAULT '',
            education_status TEXT DEFAULT '',
            marital_status TEXT DEFAULT '',
            dependent TEXT DEFAULT '',
            gov_benefit TEXT DEFAULT '',
            scheme_eligibility TEXT DEFAULT '',
            remarks TEXT DEFAULT '',
            is_minor INTEGER DEFAULT 0,
            guardian_declaration INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(application_id) REFERENCES applications(id)
        );
        CREATE TABLE IF NOT EXISTS scheme_selections(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER NOT NULL,
            scheme_name TEXT NOT NULL,
            details_json TEXT DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(application_id, scheme_name),
            FOREIGN KEY(application_id) REFERENCES applications(id)
        );
        CREATE TABLE IF NOT EXISTS comments(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER NOT NULL,
            comment_text TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_role TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(application_id) REFERENCES applications(id)
        );
        CREATE TABLE IF NOT EXISTS status_history(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER NOT NULL,
            previous_status TEXT,
            new_status TEXT NOT NULL,
            changed_by TEXT NOT NULL,
            changed_at TEXT NOT NULL,
            remarks TEXT DEFAULT '',
            FOREIGN KEY(application_id) REFERENCES applications(id)
        );
        CREATE TABLE IF NOT EXISTS audit_logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            role TEXT,
            action TEXT,
            record_type TEXT,
            record_id TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS privacy_requests(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER,
            request_type TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Open',
            assigned_officer TEXT DEFAULT '',
            resolution_remarks TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            closed_at TEXT
        );
        CREATE TABLE IF NOT EXISTS grievances(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Open',
            assigned_officer TEXT DEFAULT '',
            resolution_remarks TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            closed_at TEXT
        );
        CREATE TABLE IF NOT EXISTS breach_incidents(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_no TEXT UNIQUE NOT NULL,
            nature TEXT DEFAULT '',
            data_categories TEXT DEFAULT '',
            citizens_affected INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Open',
            mitigation_steps TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            closed_at TEXT
        );
        CREATE TABLE IF NOT EXISTS data_sharing_registry(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receiving_party TEXT NOT NULL,
            purpose TEXT NOT NULL,
            data_fields TEXT DEFAULT '',
            legal_basis TEXT DEFAULT '',
            frequency TEXT DEFAULT '',
            sharing_mode TEXT DEFAULT '',
            contact TEXT DEFAULT '',
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS retention_policy(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_category TEXT UNIQUE NOT NULL,
            retention_period TEXT NOT NULL,
            legal_hold INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS data_field_registry(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_name TEXT UNIQUE NOT NULL,
            data_category TEXT,
            purpose TEXT,
            scheme_requirement TEXT,
            mandatory TEXT,
            retention_period TEXT,
            masking_rule TEXT,
            export_allowed TEXT,
            public_reporting_allowed TEXT
        );
        CREATE TABLE IF NOT EXISTS sensitive_access_logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER,
            user_id INTEGER,
            role TEXT,
            field_type TEXT,
            reason TEXT,
            created_at TEXT NOT NULL
        );
        """
    )
    migrate_schema(conn)
    seed_data(conn)
    conn.commit()
    conn.close()


def column_exists(conn, table: str, column: str) -> bool:
    return any(row["name"] == column for row in conn.execute(f"PRAGMA table_info({table})").fetchall())


def migrate_schema(conn):
    # Safe additive migrations for existing local prototype databases.
    if not column_exists(conn, "applications", "aadhaar_verification_status"):
        conn.execute("ALTER TABLE applications ADD COLUMN aadhaar_verification_status TEXT DEFAULT 'Not Started'")
    if not column_exists(conn, "applications", "aadhaar_verified_at"):
        conn.execute("ALTER TABLE applications ADD COLUMN aadhaar_verified_at TEXT")
    if not column_exists(conn, "scheme_selections", "eligibility_status"):
        conn.execute("ALTER TABLE scheme_selections ADD COLUMN eligibility_status TEXT DEFAULT 'Pending Registration Completion'")
    if not column_exists(conn, "scheme_selections", "approval_status"):
        conn.execute("ALTER TABLE scheme_selections ADD COLUMN approval_status TEXT DEFAULT 'Pending Scheme Approval'")
    if not column_exists(conn, "scheme_selections", "eligibility_reason"):
        conn.execute("ALTER TABLE scheme_selections ADD COLUMN eligibility_reason TEXT DEFAULT ''")
    if not column_exists(conn, "scheme_selections", "approved_at"):
        conn.execute("ALTER TABLE scheme_selections ADD COLUMN approved_at TEXT")
    # Convert earlier prototype state to the revised business terminology.
    conn.execute("UPDATE applications SET status='Registered', aadhaar_verification_status='Pending Batch Verification' WHERE status='Submitted'")


def scheme_defaults_for_status(status: str):
    mapping = {
        "Draft": ("Pending Registration Completion", "Pending Scheme Approval", "Citizen registration is still in draft."),
        "Registered": ("Pending Aadhaar Verification", "Pending Scheme Approval", "Application registered; awaiting batch Aadhaar verification."),
        "Under Review": ("Eligibility Under Review", "Pending Scheme Approval", "Aadhaar verification completed; eligibility review is in progress."),
        "Approved": ("Eligible", "Approved", "Scheme eligibility approved for prototype sample."),
        "Rejected": ("Not Eligible", "Rejected", "Application rejected for prototype sample."),
        "Returned for Correction": ("Correction Required", "Pending Scheme Approval", "Citizen correction required before eligibility review."),
        "On Hold": ("On Hold", "On Hold", "Application is on hold for administrative review."),
    }
    return mapping.get(status, mapping["Registered"])


def seed_data(conn):
    def ensure_user(username, password, role, name):
        exists = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
        if not exists:
            conn.execute(
                "INSERT INTO users(username,password_hash,role,name,created_at) VALUES(?,?,?,?,?)",
                (username, hash_password(password), role, name, now_iso()),
            )
    ensure_user("admin", "admin123", "admin", "System Administrator")
    ensure_user("callcenter", "call123", "callcenter", "Call Center Agent")

    existing = conn.execute("SELECT COUNT(*) AS c FROM applications").fetchone()["c"]
    if existing == 0:
        names = [
            ("Lakshmi Devi", "Female", "Bengaluru Urban", "Approved", ["Gruha Lakshmi", "Shakti Scheme"]),
            ("Ramesh Gowda", "Male", "Mysuru", "Registered", ["Gruha Jyothi", "Anna Bhagya"]),
            ("Asha Rani", "Female", "Belagavi", "Under Review", ["Gruha Lakshmi", "Anna Bhagya"]),
            ("Kiran Kumar", "Male", "Dharwad", "Returned for Correction", ["Yuva Nidhi"]),
            ("Meena S", "Female", "Kalaburagi", "Approved", ["Shakti Scheme", "Gruha Jyothi"]),
            ("Shivappa", "Male", "Tumakuru", "Rejected", ["Anna Bhagya"]),
            ("Farzana Begum", "Female", "Dakshina Kannada", "On Hold", ["Gruha Lakshmi"]),
            ("Naveen R", "Male", "Ballari", "Registered", ["Yuva Nidhi", "Gruha Jyothi"]),
            ("Padma H", "Female", "Bengaluru Rural", "Draft", ["Gruha Lakshmi"]),
            ("Suresh Naik", "Male", "Shivamogga", "Under Review", ["Anna Bhagya", "Gruha Jyothi"]),
        ]
        for idx, (name, gender, district, status, schemes) in enumerate(names, start=1):
            created = (datetime.utcnow() - timedelta(days=idx)).replace(microsecond=0).isoformat() + "Z"
            appno = f"KGS202606{idx:02d}{idx:04d}"
            mobile = f"98765432{idx:02d}"[-10:]
            aadhaar = f"9999888877{idx:02d}"[-12:]
            cur = conn.execute(
                """INSERT INTO applications(application_no,citizen_mobile,applicant_name,gender,dob,age,mobile,email,aadhaar,aadhaar_name,
                aadhaar_linked_mobile,ration_card,marital_status,occupation,annual_income,bank_holder_name,bank_name,branch_name,ifsc,account_number,status,
                consent_accepted,consent_text,submitted_at,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (appno, mobile, name, gender, f"198{idx%10}-0{(idx%9)+1}-15", 30+idx, mobile, f"citizen{idx}@example.com", aadhaar, name,
                 mobile, f"RC{idx:06d}", "Married" if idx % 2 else "Single", "Worker", str(150000+idx*10000), name,
                 "State Bank of India", "Main Branch", "SBIN0001234", f"1234567890{idx}", status, 1, CONSENT_TEXT,
                 created if status != "Draft" else None, created, created)
            )
            app_id = cur.lastrowid
            conn.execute(
                """INSERT INTO addresses(application_id,house_no,street,ward_no,village_city,local_body,taluk,district,state,pincode,landmark,
                same_as_aadhaar,residence_type,electricity_consumer_no,lpg_ration_shop,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (app_id, f"#{idx}", "MG Road", str(10+idx), district, "Municipality", district, district, "Karnataka", f"5600{idx:02d}", "Near Bus Stand",
                 "Yes", "Own", f"ELEC{idx:06d}", f"FPS{idx:04d}", created, created),
            )
            conn.execute(
                """INSERT INTO family_members(application_id,full_name,relationship,gender,dob,age,aadhaar,mobile,occupation,education_status,
                marital_status,dependent,gov_benefit,scheme_eligibility,remarks,is_minor,guardian_declaration,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (app_id, f"Family Member {idx}", "Spouse", "Female" if gender == "Male" else "Male", "1990-01-01", 35,
                 f"8888777766{idx:02d}"[-12:], "", "Homemaker", "Graduate", "Married", "Yes", "No", ", ".join(schemes), "", 0, 0, created, created),
            )
            eligibility_status, approval_status, eligibility_reason = scheme_defaults_for_status(status)
            for scheme in schemes:
                conn.execute(
                    """INSERT INTO scheme_selections(application_id,scheme_name,details_json,eligibility_status,approval_status,eligibility_reason,approved_at,created_at,updated_at)
                    VALUES(?,?,?,?,?,?,?,?,?)""",
                    (app_id, scheme, json.dumps({"sample": True}), eligibility_status, approval_status, eligibility_reason, created if approval_status == "Approved" else None, created, created),
                )
            conn.execute(
                "INSERT INTO status_history(application_id,previous_status,new_status,changed_by,changed_at,remarks) VALUES(?,?,?,?,?,?)",
                (app_id, None, status, "seed", created, "Seed sample status"),
            )
    # retention / field registry samples
    for category, period in [("Draft applications", "90 days"), ("Approved applications", "As per scheme record policy"), ("Audit logs", "7 years"), ("Consent records", "As per statutory requirement")]:
        if not conn.execute("SELECT id FROM retention_policy WHERE data_category=?", (category,)).fetchone():
            conn.execute("INSERT INTO retention_policy(data_category,retention_period,created_at,updated_at) VALUES(?,?,?,?)", (category, period, now_iso(), now_iso()))
    for field_name, purpose, masking in [("aadhaar", "Identity dedupe and eligibility linkage", "XXXX-XXXX-1234"), ("account_number", "Benefit payment account reference", "XXXXXXXX1234"), ("mobile", "OTP login and communication", "Partial masking in admin lists")]:
        if not conn.execute("SELECT id FROM data_field_registry WHERE field_name=?", (field_name,)).fetchone():
            conn.execute("""INSERT INTO data_field_registry(field_name,data_category,purpose,scheme_requirement,mandatory,retention_period,masking_rule,export_allowed,public_reporting_allowed)
                          VALUES(?,?,?,?,?,?,?,?,?)""", (field_name, "Personal Data", purpose, "Multiple", "Yes", "As configured", masking, "Masked only", "No"))

@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "app": APP_NAME, "version": "1.1.2"}

# -----------------------------
# Models
# -----------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class OTPRequest(BaseModel):
    mobile: str

class OTPVerify(BaseModel):
    mobile: str
    otp: str

class ApplicantUpdate(BaseModel):
    applicant_name: str = ""
    gender: str = ""
    dob: str = ""
    age: int = 0
    mobile: str = ""
    alternate_mobile: str = ""
    email: str = ""
    aadhaar: str = ""
    aadhaar_name: str = ""
    aadhaar_linked_mobile: str = ""
    ration_card: str = ""
    voter_id: str = ""
    caste_category: str = ""
    marital_status: str = ""
    occupation: str = ""
    annual_income: str = ""
    bank_holder_name: str = ""
    bank_name: str = ""
    branch_name: str = ""
    ifsc: str = ""
    account_number: str = ""

class AddressUpdate(BaseModel):
    house_no: str = ""
    street: str = ""
    ward_no: str = ""
    village_city: str = ""
    local_body: str = ""
    taluk: str = ""
    district: str = ""
    state: str = "Karnataka"
    pincode: str = ""
    landmark: str = ""
    same_as_aadhaar: str = ""
    residence_type: str = ""
    electricity_consumer_no: str = ""
    lpg_ration_shop: str = ""

class FamilyMember(BaseModel):
    full_name: str
    relationship: str = ""
    gender: str = ""
    dob: str = ""
    age: int = 0
    aadhaar: str = ""
    mobile: str = ""
    occupation: str = ""
    education_status: str = ""
    marital_status: str = ""
    dependent: str = ""
    gov_benefit: str = ""
    scheme_eligibility: str = ""
    remarks: str = ""
    is_minor: int = 0
    guardian_declaration: int = 0

class SchemeSelection(BaseModel):
    schemes: Dict[str, Dict[str, Any]]

class StatusUpdate(BaseModel):
    status: str
    remarks: str = ""

class SchemeStatusUpdate(BaseModel):
    eligibility_status: str = "Eligibility Under Review"
    approval_status: str = "Pending Scheme Approval"
    eligibility_reason: str = ""

class CommentCreate(BaseModel):
    comment_text: str

class PrivacyRequestCreate(BaseModel):
    application_id: int
    request_type: str
    description: str

class GrievanceCreate(BaseModel):
    application_id: int
    category: str
    description: str

# -----------------------------
# Auth
# -----------------------------

def create_session(conn, user_id: Optional[int], role: str, mobile: Optional[str] = None):
    token = secrets.token_urlsafe(32)
    created = now_iso()
    expires = (datetime.utcnow() + timedelta(hours=12)).replace(microsecond=0).isoformat() + "Z"
    conn.execute("INSERT INTO sessions(token,user_id,role,mobile,created_at,expires_at) VALUES(?,?,?,?,?,?)", (token, user_id, role, mobile, created, expires))
    return {"token": token, "role": role, "mobile": mobile, "expires_at": expires}


def require_auth(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    token = authorization.split(" ", 1)[1]
    conn = get_conn()
    sess = conn.execute("SELECT * FROM sessions WHERE token=?", (token,)).fetchone()
    if not sess:
        conn.close()
        raise HTTPException(401, "Invalid token")
    # Simplified expiry check for prototype
    user = None
    if sess["user_id"]:
        user = conn.execute("SELECT * FROM users WHERE id=?", (sess["user_id"],)).fetchone()
    principal = {"token": token, "user_id": sess["user_id"], "role": sess["role"], "mobile": sess["mobile"], "username": user["username"] if user else sess["mobile"], "name": user["name"] if user else "Citizen"}
    conn.close()
    return principal


def require_role(*roles):
    def dep(user=Depends(require_auth)):
        if user["role"] not in roles:
            raise HTTPException(403, "Not authorised for this action")
        return user
    return dep

@app.post("/api/auth/admin/login")
def admin_login(payload: LoginRequest):
    return password_login(payload, "admin")

@app.post("/api/auth/callcenter/login")
def callcenter_login(payload: LoginRequest):
    return password_login(payload, "callcenter")


def password_login(payload: LoginRequest, required_role: str):
    conn = get_conn()
    user = conn.execute("SELECT * FROM users WHERE username=? AND role=? AND active=1", (payload.username, required_role)).fetchone()
    if not user or user["password_hash"] != hash_password(payload.password):
        conn.close()
        raise HTTPException(401, "Invalid username or password")
    session = create_session(conn, user["id"], required_role)
    audit(conn, user["id"], required_role, "login", "user", str(user["id"]))
    conn.commit(); conn.close()
    return {**session, "user": {"username": user["username"], "name": user["name"], "role": user["role"]}}

@app.post("/api/auth/citizen/otp/request")
def request_otp(payload: OTPRequest):
    if not payload.mobile.isdigit() or len(payload.mobile) != 10:
        raise HTTPException(400, "Mobile number must be 10 digits")
    return {"message": "OTP generated for prototype", "demo_otp": OTP_DEMO}

@app.post("/api/auth/citizen/otp/verify")
def verify_otp(payload: OTPVerify):
    if payload.otp != OTP_DEMO:
        raise HTTPException(401, "Invalid OTP")
    if not payload.mobile.isdigit() or len(payload.mobile) != 10:
        raise HTTPException(400, "Mobile number must be 10 digits")
    conn = get_conn()
    session = create_session(conn, None, "citizen", payload.mobile)
    audit(conn, None, "citizen", "otp_login", "mobile", payload.mobile[-4:])
    conn.commit(); conn.close()
    return {**session, "user": {"username": payload.mobile, "name": "Citizen", "role": "citizen"}}

@app.post("/api/auth/logout")
def logout(user=Depends(require_auth)):
    conn = get_conn()
    conn.execute("DELETE FROM sessions WHERE token=?", (user["token"],))
    audit(conn, user["user_id"], user["role"], "logout")
    conn.commit(); conn.close()
    return {"message": "Logged out"}

@app.get("/api/me")
def me(user=Depends(require_auth)):
    return user

# -----------------------------
# Public/meta
# -----------------------------
@app.get("/api/meta")
def meta():
    return {"schemes": SCHEMES, "statuses": STATUSES, "districts": DISTRICTS, "states": STATES, "genders": GENDERS, "marital_statuses": MARITAL_STATUSES, "privacy_notice": PRIVACY_NOTICE}

@app.get("/api/public/enrollment-statistics")
def public_stats(district: str = "", scheme: str = ""):
    conn = get_conn()
    where = []
    params = []
    if district:
        where.append("a.id IN (SELECT application_id FROM addresses WHERE district=?)")
        params.append(district)
    if scheme:
        where.append("a.id IN (SELECT application_id FROM scheme_selections WHERE scheme_name=?)")
        params.append(scheme)
    sql_where = " WHERE " + " AND ".join(where) if where else ""
    totals = conn.execute(f"SELECT COUNT(*) c, SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) approved, SUM(CASE WHEN status='Registered' THEN 1 ELSE 0 END) registered, SUM(CASE WHEN status='Under Review' THEN 1 ELSE 0 END) under_review, SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) rejected FROM applications a {sql_where}", params).fetchone()
    by_scheme = [dict(r) for r in conn.execute("SELECT scheme_name AS label, COUNT(*) AS value FROM scheme_selections GROUP BY scheme_name ORDER BY value DESC").fetchall()]
    by_district = [dict(r) for r in conn.execute("SELECT district AS label, COUNT(*) AS value FROM addresses GROUP BY district ORDER BY value DESC").fetchall()]
    by_status = [dict(r) for r in conn.execute("SELECT status AS label, COUNT(*) AS value FROM applications GROUP BY status").fetchall()]
    by_gender = [dict(r) for r in conn.execute("SELECT gender AS label, COUNT(*) AS value FROM applications GROUP BY gender").fetchall()]
    trend = [dict(r) for r in conn.execute("SELECT substr(created_at,1,10) AS label, COUNT(*) AS value FROM applications GROUP BY substr(created_at,1,10) ORDER BY label").fetchall()]
    conn.close()
    return {
        "last_updated": now_iso(),
        "disclaimer": "This page displays aggregated enrollment statistics for public transparency. No personal citizen information, Aadhaar details, mobile numbers, addresses, or bank details are displayed.",
        "summary": {
            "total_registrations": totals["c"] or 0,
            "registered": totals["registered"] or 0,
            "approved": totals["approved"] or 0,
            "under_review": totals["under_review"] or 0,
            "rejected": totals["rejected"] or 0,
        },
        "scheme_wise": suppress_small_counts(by_scheme),
        "district_wise": suppress_small_counts(by_district),
        "status": by_status,
        "gender": by_gender,
        "trend": trend,
    }


def suppress_small_counts(rows, threshold=1):
    # Prototype-friendly threshold. Increase for production.
    output = []
    for r in rows:
        output.append({"label": r["label"] or "Not specified", "value": r["value"] if r["value"] >= threshold else "Suppressed"})
    return output

# -----------------------------
# Application serialization
# -----------------------------

def serialize_application(conn, app_row, include_sensitive=False):
    appd = dict(app_row)
    appd["aadhaar_masked"] = mask_aadhaar(appd.get("aadhaar"))
    appd["account_number_masked"] = mask_bank(appd.get("account_number"))
    if not include_sensitive:
        appd.pop("aadhaar", None)
        appd.pop("account_number", None)
    addr = conn.execute("SELECT * FROM addresses WHERE application_id=?", (app_row["id"],)).fetchone()
    appd["address"] = dict(addr) if addr else None
    fam = [dict(r) for r in conn.execute("SELECT * FROM family_members WHERE application_id=? ORDER BY id", (app_row["id"],)).fetchall()]
    for f in fam:
        f["aadhaar_masked"] = mask_aadhaar(f.get("aadhaar"))
        if not include_sensitive:
            f.pop("aadhaar", None)
    appd["family_members"] = fam
    schemes = [dict(r) for r in conn.execute("SELECT * FROM scheme_selections WHERE application_id=?", (app_row["id"],)).fetchall()]
    for s in schemes:
        try:
            s["details"] = json.loads(s.pop("details_json") or "{}")
        except Exception:
            s["details"] = {}
    appd["scheme_selections"] = schemes
    appd["comments"] = [dict(r) for r in conn.execute("SELECT * FROM comments WHERE application_id=? ORDER BY created_at DESC", (app_row["id"],)).fetchall()]
    appd["status_history"] = [dict(r) for r in conn.execute("SELECT * FROM status_history WHERE application_id=? ORDER BY changed_at DESC", (app_row["id"],)).fetchall()]
    return appd

# -----------------------------
# Citizen
# -----------------------------
@app.get("/api/privacy-notice")
def privacy_notice():
    return PRIVACY_NOTICE

@app.get("/api/citizen/application")
def get_my_application(user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = conn.execute("SELECT * FROM applications WHERE citizen_mobile=? ORDER BY id DESC LIMIT 1", (user["mobile"],)).fetchone()
    if not app_row:
        conn.close()
        return {"application": None}
    appd = serialize_application(conn, app_row, include_sensitive=False)
    conn.close()
    return {"application": appd}

@app.post("/api/citizen/application")
def create_my_application(user=Depends(require_role("citizen"))):
    conn = get_conn()
    existing = conn.execute("SELECT * FROM applications WHERE citizen_mobile=? ORDER BY id DESC LIMIT 1", (user["mobile"],)).fetchone()
    if existing:
        appd = serialize_application(conn, existing)
        conn.close()
        return {"application": appd}
    appno = generate_application_no()
    created = now_iso()
    cur = conn.execute("INSERT INTO applications(application_no,citizen_mobile,mobile,created_at,updated_at) VALUES(?,?,?,?,?)", (appno, user["mobile"], user["mobile"], created, created))
    app_id = cur.lastrowid
    conn.execute("INSERT INTO status_history(application_id,previous_status,new_status,changed_by,changed_at,remarks) VALUES(?,?,?,?,?,?)", (app_id, None, "Draft", user["mobile"], created, "Application created"))
    audit(conn, None, "citizen", "application_create", "application", app_id)
    conn.commit()
    app_row = conn.execute("SELECT * FROM applications WHERE id=?", (app_id,)).fetchone()
    appd = serialize_application(conn, app_row)
    conn.close()
    return {"application": appd}


def get_citizen_app_or_404(conn, mobile):
    app_row = conn.execute("SELECT * FROM applications WHERE citizen_mobile=? ORDER BY id DESC LIMIT 1", (mobile,)).fetchone()
    if not app_row:
        raise HTTPException(404, "Application not found. Create an application first.")
    if app_row["status"] not in ("Draft", "Returned for Correction"):
        raise HTTPException(400, "Application can be edited only in Draft or Returned for Correction status")
    return app_row



def validate_mobile(value: str, label: str = "Mobile number"):
    if value and (not value.isdigit() or len(value) != 10):
        raise HTTPException(400, f"{label} must be 10 digits")

def validate_aadhaar(value: str, label: str = "Aadhaar"):
    if value and (not value.isdigit() or len(value) != 12):
        raise HTTPException(400, f"{label} must be 12 digits")

def validate_email(value: str):
    if value and "@" not in value:
        raise HTTPException(400, "Email must contain @")

def validate_dropdown(value: str, allowed: list, label: str):
    if value and value not in allowed:
        raise HTTPException(400, f"Invalid {label}. Please select a value from the dropdown")

@app.put("/api/citizen/application/applicant")
def update_applicant(payload: ApplicantUpdate, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    validate_aadhaar(payload.aadhaar, "Aadhaar")
    validate_mobile(payload.mobile, "Mobile number")
    validate_mobile(payload.alternate_mobile, "Alternate mobile number")
    validate_mobile(payload.aadhaar_linked_mobile, "Aadhaar-linked mobile")
    validate_email(payload.email)
    validate_dropdown(payload.gender, GENDERS, "gender")
    validate_dropdown(payload.marital_status, MARITAL_STATUSES, "marital status")
    if payload.account_number == "":
        pass
    fields = payload.dict()
    fields["updated_at"] = now_iso()
    sets = ",".join([f"{k}=?" for k in fields])
    conn.execute(f"UPDATE applications SET {sets} WHERE id=?", list(fields.values()) + [app_row["id"]])
    audit(conn, None, "citizen", "applicant_update", "application", app_row["id"])
    conn.commit(); conn.close()
    return {"message": "Applicant details saved"}

@app.put("/api/citizen/application/address")
def update_address(payload: AddressUpdate, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    if payload.pincode and (not payload.pincode.isdigit() or len(payload.pincode) != 6):
        raise HTTPException(400, "PIN code must be 6 digits")
    validate_dropdown(payload.district, DISTRICTS, "district")
    validate_dropdown(payload.state or "Karnataka", STATES, "state")
    existing = conn.execute("SELECT id FROM addresses WHERE application_id=?", (app_row["id"],)).fetchone()
    d = payload.dict(); d["updated_at"] = now_iso()
    if existing:
        sets = ",".join([f"{k}=?" for k in d])
        conn.execute(f"UPDATE addresses SET {sets} WHERE application_id=?", list(d.values()) + [app_row["id"]])
    else:
        d["application_id"] = app_row["id"]; d["created_at"] = now_iso()
        cols = ",".join(d.keys()); qs = ",".join(["?"] * len(d))
        conn.execute(f"INSERT INTO addresses({cols}) VALUES({qs})", list(d.values()))
    audit(conn, None, "citizen", "address_update", "application", app_row["id"])
    conn.commit(); conn.close()
    return {"message": "Address saved"}

@app.post("/api/citizen/application/family")
def add_family(payload: FamilyMember, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    validate_aadhaar(payload.aadhaar, "Family member Aadhaar")
    validate_mobile(payload.mobile, "Family member mobile")
    validate_dropdown(payload.gender, GENDERS, "family member gender")
    validate_dropdown(payload.marital_status, MARITAL_STATUSES, "family member marital status")
    if payload.aadhaar:
        duplicate = conn.execute("SELECT id FROM family_members WHERE application_id=? AND aadhaar=?", (app_row["id"], payload.aadhaar)).fetchone()
        if duplicate or app_row["aadhaar"] == payload.aadhaar:
            raise HTTPException(400, "Duplicate Aadhaar within application is not allowed")
    d = payload.dict(); d["application_id"] = app_row["id"]; d["created_at"] = now_iso(); d["updated_at"] = now_iso()
    cols = ",".join(d.keys()); qs = ",".join(["?"] * len(d))
    cur = conn.execute(f"INSERT INTO family_members({cols}) VALUES({qs})", list(d.values()))
    audit(conn, None, "citizen", "family_add", "family_member", cur.lastrowid)
    conn.commit(); conn.close()
    return {"message": "Family member added", "id": cur.lastrowid}

@app.put("/api/citizen/application/family/{member_id}")
def edit_family(member_id: int, payload: FamilyMember, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    exists = conn.execute("SELECT id FROM family_members WHERE id=? AND application_id=?", (member_id, app_row["id"])).fetchone()
    if not exists:
        raise HTTPException(404, "Family member not found")
    validate_aadhaar(payload.aadhaar, "Family member Aadhaar")
    validate_mobile(payload.mobile, "Family member mobile")
    validate_dropdown(payload.gender, GENDERS, "family member gender")
    validate_dropdown(payload.marital_status, MARITAL_STATUSES, "family member marital status")
    d = payload.dict(); d["updated_at"] = now_iso()
    sets = ",".join([f"{k}=?" for k in d])
    conn.execute(f"UPDATE family_members SET {sets} WHERE id=?", list(d.values()) + [member_id])
    audit(conn, None, "citizen", "family_edit", "family_member", member_id)
    conn.commit(); conn.close()
    return {"message": "Family member updated"}

@app.delete("/api/citizen/application/family/{member_id}")
def delete_family(member_id: int, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    conn.execute("DELETE FROM family_members WHERE id=? AND application_id=?", (member_id, app_row["id"]))
    audit(conn, None, "citizen", "family_delete", "family_member", member_id)
    conn.commit(); conn.close()
    return {"message": "Family member deleted"}

@app.put("/api/citizen/application/schemes")
def save_schemes(payload: SchemeSelection, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    conn.execute("DELETE FROM scheme_selections WHERE application_id=?", (app_row["id"],))
    for scheme, details in payload.schemes.items():
        if scheme not in SCHEMES:
            raise HTTPException(400, f"Unknown scheme: {scheme}")
        conn.execute("INSERT INTO scheme_selections(application_id,scheme_name,details_json,created_at,updated_at) VALUES(?,?,?,?,?)", (app_row["id"], scheme, json.dumps(details or {}), now_iso(), now_iso()))
    audit(conn, None, "citizen", "schemes_update", "application", app_row["id"], {"schemes": list(payload.schemes.keys())})
    conn.commit(); conn.close()
    return {"message": "Scheme selections saved"}

@app.post("/api/citizen/application/submit")
def submit_application(user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = get_citizen_app_or_404(conn, user["mobile"])
    schemes_count = conn.execute("SELECT COUNT(*) c FROM scheme_selections WHERE application_id=?", (app_row["id"],)).fetchone()["c"]
    if not app_row["applicant_name"] or not app_row["aadhaar"]:
        raise HTTPException(400, "Applicant name and Aadhaar are required")
    if schemes_count == 0:
        raise HTTPException(400, "At least one scheme must be selected")
    prev = app_row["status"]
    ts = now_iso()
    conn.execute("UPDATE applications SET status='Registered', aadhaar_verification_status='Pending Batch Verification', consent_accepted=1, consent_text=?, submitted_at=?, updated_at=? WHERE id=?", (CONSENT_TEXT, ts, ts, app_row["id"]))
    conn.execute("UPDATE scheme_selections SET eligibility_status='Pending Aadhaar Verification', approval_status='Pending Scheme Approval', eligibility_reason='Application registered; awaiting batch Aadhaar verification.', updated_at=? WHERE application_id=?", (ts, app_row["id"]))
    conn.execute("INSERT INTO status_history(application_id,previous_status,new_status,changed_by,changed_at,remarks) VALUES(?,?,?,?,?,?)", (app_row["id"], prev, "Registered", user["mobile"], ts, "Registration completed by citizen with consent; pending batch Aadhaar verification"))
    audit(conn, None, "citizen", "application_register", "application", app_row["id"])
    conn.commit(); conn.close()
    return {"message": "Application registered", "status": "Registered"}

@app.post("/api/citizen/privacy-request")
def citizen_privacy_request(payload: PrivacyRequestCreate, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = conn.execute("SELECT * FROM applications WHERE id=? AND citizen_mobile=?", (payload.application_id, user["mobile"])).fetchone()
    if not app_row:
        raise HTTPException(404, "Application not found")
    cur = conn.execute("INSERT INTO privacy_requests(application_id,request_type,description,created_at) VALUES(?,?,?,?)", (payload.application_id, payload.request_type, payload.description, now_iso()))
    audit(conn, None, "citizen", "privacy_request_create", "privacy_request", cur.lastrowid)
    conn.commit(); conn.close()
    return {"message": "Privacy request submitted", "id": cur.lastrowid}

@app.post("/api/citizen/grievance")
def citizen_grievance(payload: GrievanceCreate, user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = conn.execute("SELECT * FROM applications WHERE id=? AND citizen_mobile=?", (payload.application_id, user["mobile"])).fetchone()
    if not app_row:
        raise HTTPException(404, "Application not found")
    cur = conn.execute("INSERT INTO grievances(application_id,category,description,created_at) VALUES(?,?,?,?)", (payload.application_id, payload.category, payload.description, now_iso()))
    audit(conn, None, "citizen", "grievance_create", "grievance", cur.lastrowid)
    conn.commit(); conn.close()
    return {"message": "Grievance submitted", "id": cur.lastrowid}

@app.get("/api/citizen/status")
def citizen_status(user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = conn.execute("SELECT * FROM applications WHERE citizen_mobile=? ORDER BY id DESC LIMIT 1", (user["mobile"],)).fetchone()
    if not app_row:
        conn.close()
        return {"application": None}
    appd = serialize_application(conn, app_row)
    workflow = [
        {"step": "Registration", "status": "Completed" if appd["status"] != "Draft" else "Pending", "description": "Citizen and family details registered."},
        {"step": "Batch Aadhaar Verification", "status": appd.get("aadhaar_verification_status") or "Not Started", "description": "Aadhaar verification is run by admin in batch mode."},
        {"step": "Scheme Eligibility Review", "status": "In Progress" if appd["status"] == "Under Review" else ("Completed" if appd["status"] in ("Approved", "Rejected") else "Pending"), "description": "Selected guarantee schemes are checked for eligibility."},
        {"step": "Final Scheme Approval", "status": appd["status"], "description": "Final approval status is shown scheme-wise below."},
    ]
    conn.close()
    return {"application": appd, "workflow": workflow}


@app.get("/api/citizen/application/acknowledgement")
def acknowledgement(user=Depends(require_role("citizen"))):
    conn = get_conn()
    app_row = conn.execute("SELECT * FROM applications WHERE citizen_mobile=? ORDER BY id DESC LIMIT 1", (user["mobile"],)).fetchone()
    if not app_row:
        raise HTTPException(404, "Application not found")
    appd = serialize_application(conn, app_row)
    conn.close()
    text = f"""Government of Karnataka\nKarnataka Guarantee Schemes Registration Portal\n\nAcknowledgement Receipt\nApplication Number: {appd['application_no']}\nApplicant Name: {appd.get('applicant_name','')}\nMobile: {appd.get('mobile','')}\nStatus: {appd.get('status','')}\nMasked Aadhaar: {appd.get('aadhaar_masked','')}\nSelected Schemes: {', '.join([s['scheme_name'] for s in appd['scheme_selections']])}\nSubmission Date: {appd.get('submitted_at') or ''}\n\nThis acknowledgement confirms receipt of the application. It does not confirm approval or eligibility for benefits under the selected schemes.\n"""
    return Response(content=text, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename={appd['application_no']}_acknowledgement.txt"})

# -----------------------------
# Admin & Call center shared
# -----------------------------
@app.get("/api/applications")
def list_applications(
    q: str = "", district: str = "", scheme: str = "", status: str = "", limit: int = 100,
    user=Depends(require_role("admin", "callcenter"))
):
    conn = get_conn()
    params = []
    where = []
    if q:
        where.append("(a.application_no LIKE ? OR a.applicant_name LIKE ? OR a.mobile LIKE ? OR substr(a.aadhaar,-4)=?)")
        params += [f"%{q}%", f"%{q}%", f"%{q}%", q[-4:]]
    if status:
        where.append("a.status=?"); params.append(status)
    if district:
        where.append("a.id IN (SELECT application_id FROM addresses WHERE district=?)"); params.append(district)
    if scheme:
        where.append("a.id IN (SELECT application_id FROM scheme_selections WHERE scheme_name=?)"); params.append(scheme)
    sql_where = " WHERE " + " AND ".join(where) if where else ""
    rows = conn.execute(f"SELECT a.*, ad.district, ad.taluk FROM applications a LEFT JOIN addresses ad ON ad.application_id=a.id {sql_where} ORDER BY a.updated_at DESC LIMIT ?", params + [limit]).fetchall()
    data = []
    for r in rows:
        d = dict(r)
        d["aadhaar_masked"] = mask_aadhaar(d.get("aadhaar"))
        d["account_number_masked"] = mask_bank(d.get("account_number"))
        d.pop("aadhaar", None); d.pop("account_number", None)
        schemes = conn.execute("SELECT scheme_name FROM scheme_selections WHERE application_id=?", (d["id"],)).fetchall()
        d["schemes"] = [s["scheme_name"] for s in schemes]
        data.append(d)
    conn.close()
    return {"applications": data}

@app.get("/api/applications/{application_id}")
def get_application_detail(application_id: int, include_sensitive: int = 0, reason: str = "", user=Depends(require_role("admin", "callcenter"))):
    conn = get_conn()
    row = conn.execute("SELECT * FROM applications WHERE id=?", (application_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Application not found")
    can_sensitive = user["role"] == "admin" and include_sensitive == 1
    if include_sensitive and user["role"] != "admin":
        raise HTTPException(403, "Call center cannot view sensitive data")
    if can_sensitive:
        conn.execute("INSERT INTO sensitive_access_logs(application_id,user_id,role,field_type,reason,created_at) VALUES(?,?,?,?,?,?)", (application_id, user["user_id"], user["role"], "aadhaar_bank", reason or "Admin detail view", now_iso()))
        audit(conn, user["user_id"], user["role"], "sensitive_data_view", "application", application_id, {"reason": reason})
        conn.commit()
    appd = serialize_application(conn, row, include_sensitive=can_sensitive)
    conn.close()
    return {"application": appd}

@app.post("/api/applications/{application_id}/comments")
def add_comment(application_id: int, payload: CommentCreate, user=Depends(require_role("admin", "callcenter"))):
    conn = get_conn()
    exists = conn.execute("SELECT id FROM applications WHERE id=?", (application_id,)).fetchone()
    if not exists:
        raise HTTPException(404, "Application not found")
    cur = conn.execute("INSERT INTO comments(application_id,comment_text,created_by,created_role,created_at) VALUES(?,?,?,?,?)", (application_id, payload.comment_text, user["username"], user["role"], now_iso()))
    audit(conn, user["user_id"], user["role"], "comment_add", "application", application_id)
    conn.commit(); conn.close()
    return {"message": "Comment added", "id": cur.lastrowid}

# -----------------------------
# Admin
# -----------------------------
@app.get("/api/admin/dashboard")
def admin_dashboard(user=Depends(require_role("admin"))):
    conn = get_conn()
    total = conn.execute("SELECT COUNT(*) c FROM applications").fetchone()["c"]
    fam = conn.execute("SELECT COUNT(*) c FROM family_members").fetchone()["c"]
    comments = conn.execute("SELECT COUNT(*) c FROM comments").fetchone()["c"]
    by_status = [dict(r) for r in conn.execute("SELECT status label, COUNT(*) value FROM applications GROUP BY status").fetchall()]
    by_scheme = [dict(r) for r in conn.execute("SELECT scheme_name label, COUNT(*) value FROM scheme_selections GROUP BY scheme_name").fetchall()]
    by_district = [dict(r) for r in conn.execute("SELECT district label, COUNT(*) value FROM addresses GROUP BY district").fetchall()]
    by_gender = [dict(r) for r in conn.execute("SELECT gender label, COUNT(*) value FROM applications GROUP BY gender").fetchall()]
    trend = [dict(r) for r in conn.execute("SELECT substr(created_at,1,10) label, COUNT(*) value FROM applications GROUP BY substr(created_at,1,10) ORDER BY label").fetchall()]
    pending_sla = conn.execute("SELECT COUNT(*) c FROM applications WHERE status IN ('Registered','Under Review')").fetchone()["c"]
    privacy_requests = conn.execute("SELECT COUNT(*) c FROM privacy_requests WHERE status='Open'").fetchone()["c"]
    grievances = conn.execute("SELECT COUNT(*) c FROM grievances WHERE status='Open'").fetchone()["c"]
    conn.close()
    return {
        "summary": {"total_registrations": total, "family_members": fam, "comments": comments, "pending_sla": pending_sla, "open_privacy_requests": privacy_requests, "open_grievances": grievances},
        "by_status": by_status, "by_scheme": by_scheme, "by_district": by_district, "by_gender": by_gender, "trend": trend,
    }

@app.post("/api/admin/applications/{application_id}/status")
def admin_update_status(application_id: int, payload: StatusUpdate, user=Depends(require_role("admin"))):
    if payload.status not in STATUSES:
        raise HTTPException(400, "Invalid status")
    conn = get_conn()
    app_row = conn.execute("SELECT * FROM applications WHERE id=?", (application_id,)).fetchone()
    if not app_row:
        raise HTTPException(404, "Application not found")
    prev = app_row["status"]
    ts = now_iso()
    conn.execute("UPDATE applications SET status=?, updated_at=? WHERE id=?", (payload.status, ts, application_id))
    conn.execute("INSERT INTO status_history(application_id,previous_status,new_status,changed_by,changed_at,remarks) VALUES(?,?,?,?,?,?)", (application_id, prev, payload.status, user["username"], ts, payload.remarks))
    audit(conn, user["user_id"], "admin", "status_update", "application", application_id, {"from": prev, "to": payload.status})
    conn.commit(); conn.close()
    return {"message": "Status updated", "status": payload.status}

@app.post("/api/admin/batch/aadhaar-verification")
def admin_batch_aadhaar_verification(limit: int = 100, user=Depends(require_role("admin"))):
    conn = get_conn()
    rows = conn.execute("SELECT * FROM applications WHERE status='Registered' ORDER BY submitted_at ASC LIMIT ?", (limit,)).fetchall()
    ts = now_iso()
    processed = []
    for row in rows:
        conn.execute("UPDATE applications SET status='Under Review', aadhaar_verification_status='Verified', aadhaar_verified_at=?, updated_at=? WHERE id=?", (ts, ts, row["id"]))
        conn.execute("UPDATE scheme_selections SET eligibility_status='Eligibility Under Review', approval_status='Pending Scheme Approval', eligibility_reason='Aadhaar verification completed in batch; scheme eligibility review is now in progress.', updated_at=? WHERE application_id=?", (ts, row["id"]))
        conn.execute("INSERT INTO status_history(application_id,previous_status,new_status,changed_by,changed_at,remarks) VALUES(?,?,?,?,?,?)", (row["id"], row["status"], "Under Review", user["username"], ts, "Batch Aadhaar verification completed; moved to Under Review"))
        audit(conn, user["user_id"], "admin", "batch_aadhaar_verification", "application", row["id"], {"from": row["status"], "to": "Under Review"})
        processed.append(row["application_no"])
    conn.commit(); conn.close()
    return {"message": "Batch Aadhaar verification completed", "processed_count": len(processed), "applications": processed}

@app.post("/api/admin/applications/{application_id}/schemes/{scheme_name}/status")
def admin_update_scheme_status(application_id: int, scheme_name: str, payload: SchemeStatusUpdate, user=Depends(require_role("admin"))):
    if scheme_name not in SCHEMES:
        raise HTTPException(400, "Invalid scheme")
    conn = get_conn()
    exists = conn.execute("SELECT id FROM scheme_selections WHERE application_id=? AND scheme_name=?", (application_id, scheme_name)).fetchone()
    if not exists:
        raise HTTPException(404, "Scheme selection not found")
    ts = now_iso()
    approved_at = ts if payload.approval_status == "Approved" else None
    conn.execute("UPDATE scheme_selections SET eligibility_status=?, approval_status=?, eligibility_reason=?, approved_at=?, updated_at=? WHERE application_id=? AND scheme_name=?",
                 (payload.eligibility_status, payload.approval_status, payload.eligibility_reason, approved_at, ts, application_id, scheme_name))
    # Update overall application status only when every selected scheme is decided.
    app_row = conn.execute("SELECT * FROM applications WHERE id=?", (application_id,)).fetchone()
    scheme_rows = [dict(r) for r in conn.execute("SELECT approval_status FROM scheme_selections WHERE application_id=?", (application_id,)).fetchall()]
    decided = scheme_rows and all(r["approval_status"] in ("Approved", "Rejected", "On Hold") for r in scheme_rows)
    new_status = None
    if decided and any(r["approval_status"] == "Approved" for r in scheme_rows):
        new_status = "Approved"
    elif decided and all(r["approval_status"] == "Rejected" for r in scheme_rows):
        new_status = "Rejected"
    if new_status and app_row and app_row["status"] != new_status:
        conn.execute("UPDATE applications SET status=?, updated_at=? WHERE id=?", (new_status, ts, application_id))
        conn.execute("INSERT INTO status_history(application_id,previous_status,new_status,changed_by,changed_at,remarks) VALUES(?,?,?,?,?,?)", (application_id, app_row["status"], new_status, user["username"], ts, "Overall status updated based on scheme eligibility decisions"))
    audit(conn, user["user_id"], "admin", "scheme_status_update", "scheme_selection", exists["id"], {"scheme": scheme_name, "eligibility_status": payload.eligibility_status, "approval_status": payload.approval_status})
    conn.commit(); conn.close()
    return {"message": "Scheme status updated", "scheme": scheme_name, "eligibility_status": payload.eligibility_status, "approval_status": payload.approval_status}

@app.get("/api/admin/reports/{report_name}")
def admin_report(report_name: str, fmt: str = Query("json", regex="^(json|csv|excel|pdf)$"), user=Depends(require_role("admin"))):
    conn = get_conn()
    rows = [dict(r) for r in conn.execute("""SELECT a.application_no, a.applicant_name, a.gender, a.mobile, a.status, a.created_at, ad.district, ad.taluk,
        GROUP_CONCAT(ss.scheme_name, ', ') AS schemes
        FROM applications a
        LEFT JOIN addresses ad ON ad.application_id=a.id
        LEFT JOIN scheme_selections ss ON ss.application_id=a.id
        GROUP BY a.id ORDER BY a.created_at DESC""").fetchall()]
    audit(conn, user["user_id"], "admin", "report_generate", "report", report_name, {"format": fmt})
    conn.commit(); conn.close()
    title = report_name.replace("-", " ").title()
    if fmt == "json":
        return {"title": title, "generated_at": now_iso(), "rows": rows}
    if fmt == "csv":
        return export_csv(rows, f"{report_name}.csv")
    if fmt == "excel":
        return export_excel(rows, f"{report_name}.xlsx")
    return export_pdf_text(title, rows, f"{report_name}.txt")

@app.get("/api/admin/compliance")
def compliance_dashboard(user=Depends(require_role("admin"))):
    conn = get_conn()
    data = {
        "consent_records": conn.execute("SELECT COUNT(*) c FROM applications WHERE consent_accepted=1").fetchone()["c"],
        "pending_privacy_requests": conn.execute("SELECT COUNT(*) c FROM privacy_requests WHERE status='Open'").fetchone()["c"],
        "pending_grievances": conn.execute("SELECT COUNT(*) c FROM grievances WHERE status='Open'").fetchone()["c"],
        "sensitive_data_views": conn.execute("SELECT COUNT(*) c FROM sensitive_access_logs").fetchone()["c"],
        "breach_incidents": conn.execute("SELECT COUNT(*) c FROM breach_incidents").fetchone()["c"],
        "retention_policies": conn.execute("SELECT COUNT(*) c FROM retention_policy").fetchone()["c"],
        "data_sharing_records": conn.execute("SELECT COUNT(*) c FROM data_sharing_registry").fetchone()["c"],
        "public_statistics_last_updated": now_iso(),
    }
    conn.close()
    return {"compliance": data}

@app.get("/api/admin/audit-logs")
def audit_logs(limit: int = 100, user=Depends(require_role("admin"))):
    conn = get_conn()
    rows = [dict(r) for r in conn.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()]
    conn.close()
    return {"audit_logs": rows}

@app.get("/api/admin/privacy-requests")
def list_privacy_requests(user=Depends(require_role("admin"))):
    conn = get_conn()
    rows = [dict(r) for r in conn.execute("SELECT * FROM privacy_requests ORDER BY created_at DESC").fetchall()]
    conn.close()
    return {"privacy_requests": rows}

@app.get("/api/admin/grievances")
def list_grievances(user=Depends(require_role("admin"))):
    conn = get_conn()
    rows = [dict(r) for r in conn.execute("SELECT * FROM grievances ORDER BY created_at DESC").fetchall()]
    conn.close()
    return {"grievances": rows}

@app.get("/api/admin/master-data")
def master_data(user=Depends(require_role("admin"))):
    conn = get_conn()
    retention = [dict(r) for r in conn.execute("SELECT * FROM retention_policy ORDER BY data_category").fetchall()]
    fields = [dict(r) for r in conn.execute("SELECT * FROM data_field_registry ORDER BY field_name").fetchall()]
    conn.close()
    return {"schemes": SCHEMES, "statuses": STATUSES, "districts": DISTRICTS, "states": STATES, "genders": GENDERS, "marital_statuses": MARITAL_STATUSES, "retention_policy": retention, "data_field_registry": fields}

# -----------------------------
# Export helpers
# -----------------------------
def export_csv(rows, filename):
    stream = io.StringIO()
    if rows:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0].keys()))
        writer.writeheader(); writer.writerows(rows)
    else:
        stream.write("No data\n")
    return Response(stream.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

def export_excel(rows, filename):
    # Dependency-free XLSX writer for the prototype. This avoids openpyxl installation issues behind corporate SSL proxies.
    headers = list(rows[0].keys()) if rows else ["Message"]
    data_rows = rows if rows else [{"Message": "No data"}]
    def cell_ref(col_idx, row_idx):
        letters = ""
        col = col_idx
        while col:
            col, rem = divmod(col - 1, 26)
            letters = chr(65 + rem) + letters
        return f"{letters}{row_idx}"
    def make_cell(value, col_idx, row_idx):
        value = "" if value is None else str(value)
        return f'<c r="{cell_ref(col_idx, row_idx)}" t="inlineStr"><is><t>{html.escape(value)}</t></is></c>'
    rows_xml = []
    rows_xml.append('<row r="1">' + ''.join(make_cell(h, i+1, 1) for i, h in enumerate(headers)) + '</row>')
    for r_idx, row in enumerate(data_rows, start=2):
        rows_xml.append(f'<row r="{r_idx}">' + ''.join(make_cell(row.get(h, ""), i+1, r_idx) for i, h in enumerate(headers)) + '</row>')
    sheet_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + ''.join(rows_xml) + '</sheetData></worksheet>'
    workbook_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets></workbook>'
    rels_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
    wb_rels_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'
    content_types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'
    bio = io.BytesIO()
    with zipfile.ZipFile(bio, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', rels_xml)
        z.writestr('xl/workbook.xml', workbook_xml)
        z.writestr('xl/_rels/workbook.xml.rels', wb_rels_xml)
        z.writestr('xl/worksheets/sheet1.xml', sheet_xml)
    bio.seek(0)
    return StreamingResponse(bio, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename={filename}"})

def export_pdf_text(title, rows, filename):
    # Lightweight text export named .txt for environments without reportlab.
    lines = [title, f"Generated at: {now_iso()}", ""]
    for row in rows:
        lines.append(" | ".join([f"{k}: {v}" for k, v in row.items()]))
    return Response("\n".join(lines), media_type="text/plain", headers={"Content-Disposition": f"attachment; filename={filename}"})

# -----------------------------
# Railway / production frontend serving
# -----------------------------
FRONTEND_DIST = os.getenv("FRONTEND_DIST", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")))
FRONTEND_INDEX = os.path.join(FRONTEND_DIST, "index.html")
FRONTEND_ASSETS = os.path.join(FRONTEND_DIST, "assets")

if os.path.isdir(FRONTEND_ASSETS):
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="frontend-assets")


@app.get("/")
def serve_frontend_root():
    if os.path.exists(FRONTEND_INDEX):
        return FileResponse(FRONTEND_INDEX)
    return {"message": APP_NAME, "version": "1.1.2", "api_docs": "/docs", "health": "/health"}


@app.get("/{full_path:path}")
def serve_frontend_routes(full_path: str):
    # Keep unknown API paths as API 404s; serve React for normal browser routes.
    if full_path.startswith("api/") or full_path in {"docs", "redoc", "openapi.json", "health"}:
        raise HTTPException(status_code=404, detail="Not found")
    if os.path.exists(FRONTEND_INDEX):
        return FileResponse(FRONTEND_INDEX)
    return {"message": APP_NAME, "version": "1.1.2", "api_docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn
    init_db()
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
