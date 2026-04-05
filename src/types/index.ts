// ==================== AUTH ====================
export interface User {
  id: number;
  email: string;
  name: string | null;
  mssv: string | null;
  role: 'Student' | 'Lecturer' | 'TBM';
  major: string | null;
  heDaoTao: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

// ==================== PERIOD ====================
export type SubmissionType = 'BCTT' | 'KLTN';

export interface Period {
  id: number;
  startReg: string;
  endReg: string;
  startEx: string | null;
  endEx: string | null;
  loaiDetai: SubmissionType;
  major: string;
  dot: string;
  active: boolean;
  createdAt: string;
}

// ==================== REGISTRATION ====================
export type RegistrationStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'GRADING'
  | 'PASSED'
  | 'FAILED'
  | 'DEFENDING'
  | 'POST_DEFENSE'
  | 'REVISING'
  | 'COMPLETED'
  | 'REVISION_REJECTED';

export interface Registration {
  id: number;
  studentId: number;
  lecturerId: number;
  periodId: number;
  type: SubmissionType;
  topicName: string;
  field: string;
  status: RegistrationStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Pick<User, 'id' | 'name' | 'email' | 'mssv' | 'major'>;
  lecturer?: Pick<User, 'id' | 'name' | 'email'>;
  period?: Period;
  submissions?: Submission[];
  scores?: Score[];
  councilEntry?: CouncilStudent | null;
}

// ==================== SUBMISSION ====================
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Submission {
  id: number;
  studentId: number;
  registrationId: number;
  type: SubmissionType;
  version: number;
  fileUrl: string | null;
  fileConfirmUrl: string | null;
  turnitinUrl: string | null;
  revisionUrl: string | null;
  giaiTrinhUrl: string | null;
  gvhdApproval: ApprovalStatus;
  cthdApproval: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

// ==================== SCORE ====================
export type CouncilRole = 'GVHD' | 'GVPB' | 'CTHD' | 'TVHD' | 'ThukyHD';

export interface Score {
  id: number;
  studentId: number;
  graderId: number;
  registrationId: number;
  role: CouncilRole;
  tc1: number | null;
  tc2: number | null;
  tc3: number | null;
  tc4: number | null;
  tc5: number | null;
  tc6: number | null;
  tc7: number | null;
  tc8: number | null;
  tc9: number | null;
  tc10: number | null;
  totalScore: number | null;
  comments: string | null;
  questions: string | null;
  createdAt: string;
  grader?: Pick<User, 'name' | 'email'>;
}

// ==================== COUNCIL ====================
export interface Council {
  id: number;
  name: string;
  diaPoint: string | null;
  defenseDate: string | null;
  periodId: number | null;
  members: CouncilMember[];
}

export interface CouncilMember {
  id: number;
  councilId: number;
  lecturerId: number;
  role: CouncilRole;
  lecturer: Pick<User, 'id' | 'name' | 'email'>;
}

export interface CouncilStudent {
  id: number;
  councilId: number;
  registrationId: number;
  reviewerId: number | null;
  isDefended: boolean;
  defenseEnd: boolean;
  council: Council;
}

// ==================== QUOTA ====================
export interface LecturerQuota {
  id: number;
  lecturerId: number;
  periodId: number;
  major: string;
  heDaoTao: string | null;
  totalQuota: number;
  usedQuota: number;
  approved: boolean;
  lecturer: Pick<User, 'id' | 'name' | 'email' | 'major' | 'heDaoTao'>;
  period: Period;
}

export interface LecturerWithQuota extends Pick<User, 'id' | 'name' | 'email' | 'major'> {
  fields: string[];
  quota: { total: number; used: number; available: number } | null;
}

// ==================== CRITERIA ====================
export interface Criteria {
  id: number;
  code: string;
  name: string;
  description: string;
  maxScore: number;
  scoreType: SubmissionType;
}

// ==================== BIENBAN ====================
export interface Bienban {
  id: number;
  studentEmail: string;
  secretaryId: number;
  councilFeedback: string | null;
  fileUrl: string | null;
  createdAt: string;
}

// ==================== NOTIFICATION ====================
export type NotificationType = 'REGISTRATION' | 'APPROVAL' | 'GRADING' | 'DEADLINE' | 'SYSTEM' | 'ASSIGNMENT' | 'SUBMISSION' | 'REVISION';

export interface Notification {
  id: number;
  receiverId: number;
  senderId: number | null;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  link: string | null;
  createdAt: string;
  sender?: Pick<User, 'name' | 'email'> | null;
}

// ==================== SUGGESTED TOPIC ====================
export interface SuggestedTopic {
  id: number;
  lecturerId: number;
  title: string;
  field: string;
  major: string;
  description: string | null;
  dot: string | null;
  createdAt: string;
}

// ==================== STUDENT STATUS ====================
export interface StudentStatus {
  currentStage: 'NONE' | 'BCTT' | 'BCTT_PASSED' | 'KLTN';
  bcttRegistration: Registration | null;
  kltnRegistration: Registration | null;
  bcttPassed: boolean;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    notifications: T[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  };
}
