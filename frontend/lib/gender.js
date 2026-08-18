export const GENDER_OPTIONS = [
  { value: "straight_male", label: "Straight Male" },
  { value: "straight_female", label: "Straight Female" },
  { value: "bi", label: "Bi Male or Female" },
  { value: "gay_male", label: "Gay Male" },
  { value: "lesbian", label: "Lesbian" },
];

const GENDER_LABELS = {
  straight_male: "Straight Male",
  straight_female: "Straight Female",
  bi: "Bi Male or Female",
  gay_male: "Gay Male",
  lesbian: "Lesbian",
  male: "Male",
  female: "Female",
  other: "Other",
};

export function genderLabel(value) {
  return GENDER_LABELS[value] || null;
}