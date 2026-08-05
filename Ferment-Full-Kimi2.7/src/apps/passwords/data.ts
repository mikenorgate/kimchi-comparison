import type { Credential } from './types'

export const sampleCredentials: Credential[] = [
  {
    id: 'cred-1',
    title: 'Apple ID',
    username: 'mac.user@icloud.com',
    password: 'Tahoe2026!Secure',
    category: 'Other',
    url: 'apple.com',
  },
  {
    id: 'cred-2',
    title: 'Twitter',
    username: '@tahoe_dev',
    password: 'Xy9#kL2$mN7',
    category: 'Social',
    url: 'x.com',
  },
  {
    id: 'cred-3',
    title: 'GitHub',
    username: 'tahoe-dev',
    password: 'ghp_verySecretToken42',
    category: 'Work',
    url: 'github.com',
  },
  {
    id: 'cred-4',
    title: 'Chase Bank',
    username: 'tahoe.user',
    password: 'MoneyBags2026!',
    category: 'Finance',
    url: 'chase.com',
  },
  {
    id: 'cred-5',
    title: 'Amazon',
    username: 'tahoe.shopper',
    password: 'PrimeTahoe#99',
    category: 'Shopping',
    url: 'amazon.com',
  },
]
