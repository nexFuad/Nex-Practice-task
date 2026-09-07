export type Profile = Record<string, string | string[]>;
export type Allowance = { name: string; amount: string; calculationRule: string };
export type Deduction = {
  name: string;
  amount: string;
  accountNumber: string;
  deductBeforeGross: boolean;
};
export type Bank = {
  bank: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  bankCode: string;
  swiftCode: string;
};
export type Toast = { kind: "success" | "error"; text: string } | null;

export const emptyProfile: Profile = {
  workingDays: "5", restDaysPerMonth: "", workingHoursPerWeek: "", fixedRestDays: "",
  basicSalary: "", decimalPlaces: "2", dailyRate: "", hourlyRate: "", otHourlyRate: "",
  excessDailyRate: "", excessHourlyRate: "", fixedBasicSalary: "", fixedGrossSalary: "",
  basicHours: "8", breakTime: "1", maximumOtHours: "", advancePaymentType: "",
  calculationType: "Monthly Basic", cpfType: "", cpfEffectiveDate: "", levyType: "",
  employeeSkillType: "", selfHelpGroups: [], sdlCalculation: "",
  paymentMethod: "Bank Deposit", paymentRemarks: "",
};
export const blankAllowance = (): Allowance => ({ name: "", amount: "", calculationRule: "" });
export const blankDeduction = (): Deduction => ({
  name: "", amount: "", accountNumber: "", deductBeforeGross: false,
});
export const blankBank = (): Bank => ({
  bank: "", accountName: "", accountNumber: "", branchCode: "", bankCode: "", swiftCode: "",
});
export const banks = [
  { name: "DBS Bank Limited (DBS)", code: "7171", swift: "DBSSSGSGXXX" },
  { name: "POSB Bank", code: "7171", swift: "DBSSSGSGXXX" },
  { name: "Oversea-Chinese Banking Corporation Limited (OCBC)", code: "7339", swift: "OCBCSGSGXXX" },
  { name: "United Overseas Bank Limited (UOB)", code: "7375", swift: "UOVBSGSGXXX" },
  { name: "Standard Chartered Bank", code: "7144", swift: "SCBLSGSGXXX" },
];
export const groupOptions = [
  "Chinese Development Assistance Council Fund", "Eurasian Community Fund",
  "Mosque Building and Mendaki Fund", "Singapore Indian Development Association Fund",
];
export const allowanceOptions = ["AWS (ANNUAL WAGE SUPPLEMENT)", "PERFORMANCE INCENTIVE", "SITE ALLOWANCE", "TRANSPORT ALLOWANCE"];
export const deductionOptions = ["CPF CONTRIBUTION", "LOAN REPAYMENT", "INSURANCE", "UNIFORM DEDUCTION", "OTHER DEDUCTION"];
export const restDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
