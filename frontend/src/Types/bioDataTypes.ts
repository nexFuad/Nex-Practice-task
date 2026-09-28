export type BioDataEmployment = {
  dateJoin?: string;
  dateLeft?: string;
  status?: string;
  confirmationDate?: string;
  remarks?: string;
};

export type BioDataPwmHistory = {
  role?: string;
  roleStartDate?: string;
};

export type BioDataSite = {
  id?: string;
  name?: string;
};

export type BioDataCourse = {
  name?: string;
  title?: string;
};

export type BioDataDetailRow = [label: string, value: string];
