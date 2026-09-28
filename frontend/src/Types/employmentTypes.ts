
export type EmploymentRecord = {
  id: string;
  employeeId?: string;
  dateJoin: string;
  dateLeft: string;
  probationPeriod: string;
  noticePeriod: string;
  status: string;
  notificationDate: string;
  confirmationDate: string;
  remarks: string;
  createdAt: string;
};

export type PwmHistory = {
  id: string;
  employeeId?: string;
  role: string;
  roleStartDate: string;
  createdAt: string;
};

export type SavedEmployment = {
  employmentRecords: EmploymentRecord[];
  pwmHistory: PwmHistory[];
};
