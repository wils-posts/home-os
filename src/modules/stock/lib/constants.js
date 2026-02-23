export const ERRORS = {
  NOT_ALLOWLISTED: "You're signed in but not authorised for this household.",
  NETWORK: "Offline or can't reach server",
  STATE_UPDATE: "Couldn't save change — please try again",
  OTP_SEND: "Couldn't send code — check your email address",
  OTP_VERIFY: "Couldn't verify code — please try again",
}

export const STATE_LABELS = {
  OK: 'OK',
  LOW: 'Low',
  NEED: 'Need',
}

export const STATE_COLORS = {
  OK: 'bg-ok text-white',
  LOW: 'bg-low text-white',
  NEED: 'bg-need text-white',
}

export const SECTIONS = [
  { key: 'pinned', label: 'Pinned', defaultOpen: true },
  { key: 'need',   label: 'Need',   defaultOpen: true },
  { key: 'low',    label: 'Low',    defaultOpen: true },
  { key: 'ok',     label: 'OK',     defaultOpen: true },
]
