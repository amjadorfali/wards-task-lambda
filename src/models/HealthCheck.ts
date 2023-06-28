export type HealthCheck = {
  id: string
  userId: string
  name: string
  method: Method
  timeout: number | null
  verifySSL: boolean
  enabled: boolean
  type: HealtCheckType
  cron: string | null
  locations: Location[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Model Assertion
 *
 */
export type Assertion = {
  id: number
  type: string
  value: string
  compareType: CompareType
  healthCheckId: string | null
}

export type Header = {
  id: number
  type: string
  value: string
  healthCheckId: string | null
}


export let CompareType: {
  SMALL: 'SMALL',
  BIG: 'BIG',
  SMALL_EQUAL: 'SMALL_EQUAL',
  BIG_EQUAL: 'BIG_EQUAL'
};

export type CompareType = (typeof CompareType)[keyof typeof CompareType]


export let HealtCheckType: {
  SWITCH: 'SWITCH',
  HTTP: 'HTTP',
  BROWSER: 'BROWSER',
  TCP: 'TCP',
  UDP: 'UDP'
};

export type HealtCheckType = (typeof HealtCheckType)[keyof typeof HealtCheckType]


export let Location: {
  FRANKFURT: 'FRANKFURT',
  IRELAND: 'IRELAND',
  CALIFORNIA: 'CALIFORNIA',
  DUBAI: 'DUBAI',
  OHIO: 'OHIO',
  STOCKHOLM: 'STOCKHOLM',
  SINGAPORE: 'SINGAPORE',
  SYDNEY: 'SYDNEY',
  SAO_PAULO: 'SAO_PAULO'
};

export type Location = (typeof Location)[keyof typeof Location]


export let Method: {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  HEAD: 'HEAD'
};

export type Method = (typeof Method)[keyof typeof Method]
