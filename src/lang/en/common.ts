/**
 * @file common implementation
 */

/**
 * Common Translations for Core Package
 * Shared translations used across the core package
 */

export const common = {
  // Common actions
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  add: "Add",
  remove: "Remove",
  create: "Create",
  update: "Update",
  refresh: "Refresh",
  reset: "Reset",

  // Common states
  enabled: "Enabled",
  disabled: "Disabled",
  active: "Active",
  inactive: "Inactive",
  online: "Online",
  offline: "Offline",

  // Common messages
  confirm: "Confirm",
  confirmDelete: "Are you sure you want to delete this item?",
  unsavedChanges: "You have unsaved changes. Are you sure you want to leave?",
  operationSuccess: "Operation completed successfully",
  operationFailed: "Operation failed",

  // Common labels
  name: "Name",
  description: "Description",
  type: "Type",
  status: "Status",
  date: "Date",
  time: "Time",
  size: "Size",
  count: "Count",

  // Common navigation
  back: "Back",
  next: "Next",
  previous: "Previous",
  home: "Home",
  settings: "Settings",
  help: "Help",
  about: "About",
} as const;

export default common;
